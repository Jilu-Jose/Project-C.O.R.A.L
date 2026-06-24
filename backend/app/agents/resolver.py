from app.models.llm_factory import get_llm

class ResolverAgent:
    async def resolver(self, query:str, resolver_selection:str, model_provider: str = "ollama", model_name: str = "qwen:0.5b"):
        llm = get_llm(provider=model_provider, model_name=model_name)
        prompt = f""" 
        You are a conflict resolver agent,
        Analyse the response from other agents and 
        resolve if any conflicts occur.

        User Question: {query}

        Output: {resolver_selection}
        """

        response = llm.invoke(prompt)
        return response.content if hasattr(response, 'content') else response