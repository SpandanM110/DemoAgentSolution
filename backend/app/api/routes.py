import os
import uuid
import asyncio
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks

from app.config import get_settings
from app.models.schemas import UploadResponse, AnalyzeResponse, StatusResponse, ResultsResponse
from app.services.document_parser import extract_text
from app.agents.graph import build_graph
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/api", tags=["analysis"])

# In-memory session store
sessions: dict[str, dict] = {}


@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    # Validate file type
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".pdf", ".docx", ".txt"):
        raise HTTPException(400, "Unsupported file type. Use PDF, DOCX, or TXT.")

    # Validate file size (10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large. Maximum 10MB.")

    # Save file
    session_id = str(uuid.uuid4())
    settings = get_settings()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(settings.UPLOAD_DIR, f"{session_id}{ext}")

    with open(filepath, "wb") as f:
        f.write(contents)

    # Extract text
    try:
        raw_text = extract_text(filepath)
    except Exception as e:
        raise HTTPException(400, f"Failed to parse document: {str(e)}")

    # Store session
    sessions[session_id] = {
        "status": "uploaded",
        "filename": file.filename,
        "filepath": filepath,
        "raw_text": raw_text,
        "result": None,
    }

    return UploadResponse(
        session_id=session_id,
        filename=file.filename or "unknown",
        char_count=len(raw_text),
        message="Document uploaded and parsed successfully.",
    )


async def _run_pipeline(session_id: str):
    session = sessions[session_id]
    session["status"] = "running"
    session["current_agent"] = "problem_analyzer"

    graph = build_graph()
    initial_state = {
        "session_id": session_id,
        "raw_text": session["raw_text"],
        "problems": [],
        "prioritized_tasks": [],
        "specialist_outputs": [],
        "synthesized_solution": {},
        "final_report": "",
        "agent_logs": [],
        "errors": [],
        "current_agent": "",
    }

    try:
        result = await graph.ainvoke(initial_state)
        session["result"] = result
        session["status"] = "completed"
        session["current_agent"] = None
    except Exception as e:
        session["status"] = "error"
        session["error"] = str(e)
        await ws_manager.broadcast(session_id, {
            "type": "pipeline_error",
            "agent": None,
            "message": str(e),
            "progress": 0,
            "data": {},
        })


@router.post("/analyze/{session_id}", response_model=AnalyzeResponse)
async def start_analysis(session_id: str, background_tasks: BackgroundTasks):
    if session_id not in sessions:
        raise HTTPException(404, "Session not found.")

    session = sessions[session_id]
    if session["status"] == "running":
        raise HTTPException(409, "Analysis already running.")

    background_tasks.add_task(_run_pipeline, session_id)

    return AnalyzeResponse(
        session_id=session_id,
        status="running",
        message="Analysis pipeline started.",
    )


@router.get("/status/{session_id}", response_model=StatusResponse)
async def get_status(session_id: str):
    if session_id not in sessions:
        raise HTTPException(404, "Session not found.")

    session = sessions[session_id]
    return StatusResponse(
        session_id=session_id,
        status=session["status"],
        current_agent=session.get("current_agent"),
    )


@router.get("/results/{session_id}", response_model=ResultsResponse)
async def get_results(session_id: str):
    if session_id not in sessions:
        raise HTTPException(404, "Session not found.")

    session = sessions[session_id]
    result = session.get("result")

    if not result:
        return ResultsResponse(
            session_id=session_id,
            status=session["status"],
        )

    return ResultsResponse(
        session_id=session_id,
        status=session["status"],
        problems=result.get("problems"),
        prioritized_tasks=result.get("prioritized_tasks"),
        specialist_outputs=result.get("specialist_outputs"),
        synthesized_solution=result.get("synthesized_solution"),
        final_report=result.get("final_report"),
        errors=result.get("errors"),
    )
