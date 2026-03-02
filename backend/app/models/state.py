import operator
from typing import Annotated, Any, TypedDict


class AgentGraphState(TypedDict, total=False):
    session_id: str
    raw_text: str
    problems: list[dict[str, Any]]
    prioritized_tasks: list[dict[str, Any]]
    specialist_outputs: Annotated[list[dict[str, Any]], operator.add]
    synthesized_solution: dict[str, Any]
    final_report: str
    agent_logs: Annotated[list[dict[str, Any]], operator.add]
    errors: Annotated[list[str], operator.add]
    current_agent: str
