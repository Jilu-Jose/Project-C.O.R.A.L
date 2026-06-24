from typing import TypedDict, List

class AgentState(TypedDict):
    query:str
    proposer_response: str
    critic_response: str
    final_response: str
    debate_history: List[dict]
    round_count: int
    model_provider: str
    model_name: str