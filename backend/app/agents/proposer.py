from app.models.ollama_client import get_llm

class ProposerAgent:

    def __init__(self):
        self.llm = get_llm()

    async def generate(self, query: str):

        prompt = f""" 

        You are a highly intelligent proposer agent.

        Solve the following problem clearly:

        Question:
        {query}
        """

        response = self.llm.invoke(prompt)

        return response