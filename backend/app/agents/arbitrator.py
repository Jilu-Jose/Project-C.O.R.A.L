from app.models.ollama_client import get_llm

class ArbitratorAgent:


    def __init__(self):
        self.llm = get_llm()

    async def finalize(
            self,
            query: str,
            proposer_answer: str,
            critic_feedback: str
    ):
        
        prompt = f""" 
        You are an arbitrator agent.

        Your task:
        - analyze prosper answer
        - analyze critic feedback
        - generate improved final response

        User Question:
        {query}

        Prosper Answer:
        {proposer_answer}

        Critic FeedBack:
        {critic_feedback}
        """

        response = self.llm.invoke(prompt)
        return response


