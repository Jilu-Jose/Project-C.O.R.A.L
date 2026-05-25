from langgraph.graph import StateGraph, END
from app.graph.state import AgentState

from app.agents.proposer import ProposerAgent
from app.agents.critic import CriticAgent
from app.agents.arbitrator import ArbitratorAgent
from app.agents.role_manager import RoleManager
proposer = ProposerAgent()
critic = CriticAgent()
arbitrator = ArbitratorAgent()
role_manager = RoleManager()

async def proposer_node(state: AgentState):

    response = await proposer.generate(state["query"])

    state["proposer_response"] = response
    state["debate_history"].append({
        "role": "proposer",
        "content": response
    })
    return state


async def critic_node(state: AgentState):
    feedback = await critic.critique(
        state["query"],
        state["proposer_response"]
    )

    state["critic_response"] = feedback
    state["debate_history"].append({
        "role": "critic",
        "content": feedback
    })
    return state

async def arbitrator_node(state: AgentState):
    final_answer = await arbitrator.finalize(
        state["query"],
        state["proposer_response"],
        state["critic_response"]
    )

    state["final_response"] = final_answer
    state["debate_history"].append({
        "role": "arbitrator",
        "content": final_answer
    })
    return state


async def resolver_node(state:AgentState):

    output = await resolver.finalize(
        
    )



def route_decision(state: AgentState):

    should_continue = role_manager.should_continue(
        state["critic_response"],
        state["round_count"]
    )

    if should_continue:

        state["round_count"] += 1
        return "proposer"
    
    return "final"




workflow = StateGraph(AgentState)

workflow.add_node("proposer", proposer_node)
workflow.add_node("critic", critic_node)
workflow.add_node("arbitrator", arbitrator_node)

workflow.set_entry_point("proposer")

workflow.add_edge("proposer", "critic")
workflow.add_edge("critic", "arbitrator")

workflow.add_conditional_edges(
    "arbitrator",
    route_decision,
    {
        "proposer": "proposer",
        "final": END
    }
)
graph = workflow.compile()