from app.models.llm_factory import get_llm

class ProposerAgent:
    async def generate(self, query: str, model_provider: str = "ollama", model_name: str = "qwen:0.5b"):
        llm = get_llm(provider=model_provider, model_name=model_name)
        prompt = f""" 

        You are a highly intelligent proposer agent.

        Solve the following problem clearly:

        Question:
        {query}
        """

        response = llm.invoke(prompt)
        # If Bedrock, response might be AIMessage, otherwise string
        return response.content if hasattr(response, 'content') else response