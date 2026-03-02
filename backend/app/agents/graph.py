from langgraph.graph import StateGraph, START, END
from langgraph.types import Send

from app.models.state import AgentGraphState
from app.agents.nodes import (
    problem_analyzer_node,
    task_prioritizer_node,
    research_agent_node,
    technical_agent_node,
    strategy_agent_node,
    solution_synthesizer_node,
    report_generator_node,
)


def fan_out_specialists(state: AgentGraphState):
    """Fan out to 3 specialist agents concurrently using Send()."""
    return [
        Send("research_agent", state),
        Send("technical_agent", state),
        Send("strategy_agent", state),
    ]


def build_graph():
    graph = StateGraph(AgentGraphState)

    # Add nodes
    graph.add_node("problem_analyzer", problem_analyzer_node)
    graph.add_node("task_prioritizer", task_prioritizer_node)
    graph.add_node("research_agent", research_agent_node)
    graph.add_node("technical_agent", technical_agent_node)
    graph.add_node("strategy_agent", strategy_agent_node)
    graph.add_node("solution_synthesizer", solution_synthesizer_node)
    graph.add_node("report_generator", report_generator_node)

    # Sequential edges
    graph.add_edge(START, "problem_analyzer")
    graph.add_edge("problem_analyzer", "task_prioritizer")

    # Fan-out: task_prioritizer -> 3 specialists
    graph.add_conditional_edges("task_prioritizer", fan_out_specialists)

    # Fan-in: all 3 specialists -> synthesizer
    graph.add_edge("research_agent", "solution_synthesizer")
    graph.add_edge("technical_agent", "solution_synthesizer")
    graph.add_edge("strategy_agent", "solution_synthesizer")

    # Synthesizer -> report -> end
    graph.add_edge("solution_synthesizer", "report_generator")
    graph.add_edge("report_generator", END)

    return graph.compile()
