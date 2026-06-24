from app.models.llm_factory import get_llm

class CriticAgent:
    async def critique(self, query:str, proposer_answer: str, model_provider: str = "ollama", model_name: str = "qwen:0.5b"):
        llm = get_llm(provider=model_provider, model_name=model_name)
        prompt = f""" 
        You are a critic agent,
        
        Analyze the response carefully.
        
        Find:
        - logical mistakes
        - missing details
        - hallucinations
        - improvements
        
        User Question:
        {query}

        Proposed Answer:
        {proposer_answer}

        """

        response = llm.invoke(prompt)
        return response.content if hasattr(response, 'content') else response