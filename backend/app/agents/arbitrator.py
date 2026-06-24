from app.models.llm_factory import get_llm

class ArbitratorAgent:
    async def finalize(
            self,
            query: str,
            proposer_answer: str,
            critic_feedback: str,
            model_provider: str = "ollama",
            model_name: str = "qwen:0.5b"
    ):
        llm = get_llm(provider=model_provider, model_name=model_name)
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

        response = llm.invoke(prompt)
        return response.content if hasattr(response, 'content') else response
