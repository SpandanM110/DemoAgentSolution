import json
import asyncio
from typing import Any

from app.agents.llm import rate_limited_llm_call, parse_json_response
from app.agents import prompts
from app.services.websocket_manager import ws_manager


async def _emit(session_id: str, event_type: str, agent: str, data: dict | None = None, progress: float = 0.0, message: str = ""):
    await ws_manager.broadcast(session_id, {
        "type": event_type,
        "agent": agent,
        "data": data or {},
        "progress": progress,
        "message": message,
    })


AGENT_PROGRESS = {
    "problem_analyzer": (0.05, 0.20),
    "task_prioritizer": (0.20, 0.35),
    "research_agent": (0.35, 0.55),
    "technical_agent": (0.35, 0.55),
    "strategy_agent": (0.35, 0.55),
    "solution_synthesizer": (0.60, 0.80),
    "report_generator": (0.80, 1.0),
}


async def problem_analyzer_node(state: dict[str, Any]) -> dict[str, Any]:
    agent = "problem_analyzer"
    session_id = state.get("session_id", "")
    start, end = AGENT_PROGRESS[agent]

    await _emit(session_id, "agent_start", agent, progress=start, message="Analyzing document for problems...")

    try:
        user_prompt = prompts.PROBLEM_ANALYZER_USER.format(
            document_text=state["raw_text"]
        )
        response = await rate_limited_llm_call(prompts.PROBLEM_ANALYZER_SYSTEM, user_prompt)
        parsed = parse_json_response(response, "problems")

        problems = parsed if isinstance(parsed, list) else parsed.get("problems", [parsed])

        await _emit(session_id, "agent_complete", agent, data={"count": len(problems)}, progress=end, message=f"Identified {len(problems)} problems")

        return {
            "problems": problems,
            "current_agent": agent,
            "agent_logs": [{"agent": agent, "status": "complete", "output_summary": f"Found {len(problems)} problems"}],
        }
    except Exception as e:
        await _emit(session_id, "agent_error", agent, message=str(e))
        return {
            "problems": [],
            "errors": [f"{agent}: {str(e)}"],
            "agent_logs": [{"agent": agent, "status": "error", "error": str(e)}],
        }


async def task_prioritizer_node(state: dict[str, Any]) -> dict[str, Any]:
    agent = "task_prioritizer"
    session_id = state.get("session_id", "")
    start, end = AGENT_PROGRESS[agent]

    await _emit(session_id, "agent_start", agent, progress=start, message="Prioritizing tasks...")

    try:
        user_prompt = prompts.TASK_PRIORITIZER_USER.format(
            problems_json=json.dumps(state["problems"], indent=2)
        )
        response = await rate_limited_llm_call(prompts.TASK_PRIORITIZER_SYSTEM, user_prompt)
        parsed = parse_json_response(response, "tasks")

        tasks = parsed.get("tasks", [parsed]) if isinstance(parsed, dict) else parsed

        await _emit(session_id, "agent_complete", agent, data={"count": len(tasks)}, progress=end, message=f"Created {len(tasks)} prioritized tasks")

        return {
            "prioritized_tasks": tasks,
            "current_agent": agent,
            "agent_logs": [{"agent": agent, "status": "complete", "output_summary": f"Created {len(tasks)} tasks"}],
        }
    except Exception as e:
        await _emit(session_id, "agent_error", agent, message=str(e))
        return {
            "prioritized_tasks": [],
            "errors": [f"{agent}: {str(e)}"],
            "agent_logs": [{"agent": agent, "status": "error", "error": str(e)}],
        }


async def _specialist_node(
    state: dict[str, Any],
    agent_name: str,
    system_prompt: str,
    user_template: str,
) -> dict[str, Any]:
    session_id = state.get("session_id", "")
    start, end = AGENT_PROGRESS[agent_name]

    await _emit(session_id, "agent_start", agent_name, progress=start, message=f"{agent_name.replace('_', ' ').title()} working...")

    try:
        user_prompt = user_template.format(
            problems_json=json.dumps(state["problems"], indent=2),
            tasks_json=json.dumps(state["prioritized_tasks"], indent=2),
        )
        response = await rate_limited_llm_call(system_prompt, user_prompt)
        parsed = parse_json_response(response, agent_name)

        await _emit(session_id, "agent_complete", agent_name, progress=end, message=f"{agent_name.replace('_', ' ').title()} complete")

        return {
            "specialist_outputs": [{"agent": agent_name, "output": parsed}],
            "current_agent": agent_name,
            "agent_logs": [{"agent": agent_name, "status": "complete"}],
        }
    except Exception as e:
        await _emit(session_id, "agent_error", agent_name, message=str(e))
        return {
            "specialist_outputs": [{"agent": agent_name, "error": str(e)}],
            "errors": [f"{agent_name}: {str(e)}"],
            "agent_logs": [{"agent": agent_name, "status": "error", "error": str(e)}],
        }


async def research_agent_node(state: dict[str, Any]) -> dict[str, Any]:
    return await _specialist_node(
        state, "research_agent",
        prompts.RESEARCH_AGENT_SYSTEM,
        prompts.RESEARCH_AGENT_USER,
    )


async def technical_agent_node(state: dict[str, Any]) -> dict[str, Any]:
    return await _specialist_node(
        state, "technical_agent",
        prompts.TECHNICAL_AGENT_SYSTEM,
        prompts.TECHNICAL_AGENT_USER,
    )


async def strategy_agent_node(state: dict[str, Any]) -> dict[str, Any]:
    return await _specialist_node(
        state, "strategy_agent",
        prompts.STRATEGY_AGENT_SYSTEM,
        prompts.STRATEGY_AGENT_USER,
    )


async def solution_synthesizer_node(state: dict[str, Any]) -> dict[str, Any]:
    agent = "solution_synthesizer"
    session_id = state.get("session_id", "")
    start, end = AGENT_PROGRESS[agent]

    await _emit(session_id, "agent_start", agent, progress=start, message="Synthesizing solutions...")

    try:
        user_prompt = prompts.SYNTHESIZER_USER.format(
            problems_json=json.dumps(state["problems"], indent=2),
            tasks_json=json.dumps(state["prioritized_tasks"], indent=2),
            specialist_outputs_json=json.dumps(state.get("specialist_outputs", []), indent=2),
        )
        response = await rate_limited_llm_call(prompts.SYNTHESIZER_SYSTEM, user_prompt)
        parsed = parse_json_response(response, "synthesis")

        await _emit(session_id, "agent_complete", agent, progress=end, message="Solutions synthesized")

        return {
            "synthesized_solution": parsed,
            "current_agent": agent,
            "agent_logs": [{"agent": agent, "status": "complete"}],
        }
    except Exception as e:
        await _emit(session_id, "agent_error", agent, message=str(e))
        return {
            "synthesized_solution": {},
            "errors": [f"{agent}: {str(e)}"],
            "agent_logs": [{"agent": agent, "status": "error", "error": str(e)}],
        }


async def report_generator_node(state: dict[str, Any]) -> dict[str, Any]:
    agent = "report_generator"
    session_id = state.get("session_id", "")
    start, end = AGENT_PROGRESS[agent]

    await _emit(session_id, "agent_start", agent, progress=start, message="Generating final report...")

    try:
        user_prompt = prompts.REPORT_GENERATOR_USER.format(
            problems_json=json.dumps(state["problems"], indent=2),
            tasks_json=json.dumps(state["prioritized_tasks"], indent=2),
            synthesized_json=json.dumps(state.get("synthesized_solution", {}), indent=2),
        )
        response = await rate_limited_llm_call(prompts.REPORT_GENERATOR_SYSTEM, user_prompt)

        await _emit(session_id, "agent_complete", agent, progress=end, message="Report generated")
        await _emit(session_id, "pipeline_complete", agent, progress=1.0, message="Analysis complete!")

        return {
            "final_report": response,
            "current_agent": agent,
            "agent_logs": [{"agent": agent, "status": "complete"}],
        }
    except Exception as e:
        await _emit(session_id, "agent_error", agent, message=str(e))
        return {
            "final_report": f"Error generating report: {str(e)}",
            "errors": [f"{agent}: {str(e)}"],
            "agent_logs": [{"agent": agent, "status": "error", "error": str(e)}],
        }
