from pydantic import BaseModel
from typing import Any


class UploadResponse(BaseModel):
    session_id: str
    filename: str
    char_count: int
    message: str


class AnalyzeResponse(BaseModel):
    session_id: str
    status: str
    message: str


class StatusResponse(BaseModel):
    session_id: str
    status: str
    current_agent: str | None = None
    progress: float = 0.0


class ResultsResponse(BaseModel):
    session_id: str
    status: str
    problems: list[dict[str, Any]] | None = None
    prioritized_tasks: list[dict[str, Any]] | None = None
    specialist_outputs: list[dict[str, Any]] | None = None
    synthesized_solution: dict[str, Any] | None = None
    final_report: str | None = None
    errors: list[str] | None = None


class WSMessage(BaseModel):
    type: str  # agent_start, agent_complete, agent_error, pipeline_complete
    agent: str | None = None
    data: dict[str, Any] | None = None
    progress: float = 0.0
    message: str = ""
