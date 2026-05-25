from app.models.ollama_client import get_llm

class ResolverAgent:

    def __init__(self):
        self.llm = get_llm()

    async def resolver(self, query:str, resolver_selection:str):

        prompt = f""" 
        You are a conflict resolver agent,
        Analyse the response from other agents and 
        resolve if any conflicts occur.

        User Question: {query}

        Output: {resolver_selection}
        """

        response = self.llm.invoke(prompt)
        return response