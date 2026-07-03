from langgraph.graph import StateGraph, END
from app.graph.state import AgentState

from app.agents.proposer import ProposerAgent
from app.agents.critic import CriticAgent
from app.agents.arbitrator import ArbitratorAgent
from app.agents.role_manager import RoleManager
from app.agents.memory import DebateMemory

proposer = ProposerAgent()
critic = CriticAgent()
arbitrator = ArbitratorAgent()
role_manager = RoleManager()

# Shared memory bank across debates — persists in-process
debate_memory = DebateMemory()


async def proposer_node(state: AgentState):
    memory_context = state.get("memory_context", "")

    response = await proposer.generate(
        state["query"],
        model_provider=state.get("model_provider", "ollama"),
        model_name=state.get("model_name", "qwen:0.5b"),
        memory_context=memory_context
    )

    new_history = list(state.get("debate_history", []))
    new_history.append({
        "role": "proposer",
        "content": response
    })

    return {
        "proposer_response": response,
        "debate_history": new_history,
    }


async def critic_node(state: AgentState):
    feedback = await critic.critique(
        state["query"],
        state["proposer_response"],
        model_provider=state.get("model_provider", "ollama"),
        model_name=state.get("model_name", "qwen:0.5b")
    )

    new_history = list(state.get("debate_history", []))
    new_history.append({
        "role": "critic",
        "content": feedback
    })

    # Increment round_count here (inside a proper node, not in route_decision)
    new_round_count = state.get("round_count", 0) + 1

    return {
        "critic_response": feedback,
        "debate_history": new_history,
        "round_count": new_round_count,
    }


async def arbitrator_node(state: AgentState):
    final_answer = await arbitrator.finalize(
        state["query"],
        state["proposer_response"],
        state["critic_response"],
        model_provider=state.get("model_provider", "ollama"),
        model_name=state.get("model_name", "qwen:0.5b")
    )

    new_history = list(state.get("debate_history", []))
    new_history.append({
        "role": "arbitrator",
        "content": final_answer
    })

    # Store completed debate entries into the memory bank
    debate_memory.add("proposer", state.get("proposer_response", ""))
    debate_memory.add("critic", state.get("critic_response", ""))
    debate_memory.add("arbitrator", final_answer)

    return {
        "final_response": final_answer,
        "debate_history": new_history,
    }


def route_decision(state: AgentState) -> str:
    """
    Pure conditional routing function — does NOT mutate state.
    Decides whether to loop back to proposer or proceed to arbitrator.
    Called after the critic node.
    """
    should_continue = role_manager.should_continue(
        state["critic_response"],
        state["round_count"],
        max_rounds=state.get("max_rounds", 3)
    )

    if should_continue:
        return "proposer"

    return "final"


def build_graph():
    """Build and compile the debate graph."""
    workflow = StateGraph(AgentState)

    workflow.add_node("proposer", proposer_node)
    workflow.add_node("critic", critic_node)
    workflow.add_node("arbitrator", arbitrator_node)

    workflow.set_entry_point("proposer")

    workflow.add_edge("proposer", "critic")

    # After critic, decide: loop back to proposer or go to arbitrator
    workflow.add_conditional_edges(
        "critic",
        route_decision,
        {
            "proposer": "proposer",
            "final": "arbitrator"
        }
    )

    workflow.add_edge("arbitrator", END)

    return workflow.compile()


# Expose debate_memory for the API layer to inject context
def get_memory_context(query: str) -> str:
    """Search the memory bank for relevant past debate context."""
    return debate_memory.search(query)


graph = build_graph()