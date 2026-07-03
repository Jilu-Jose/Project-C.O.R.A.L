from app.models.llm_factory import get_llm

class ProposerAgent:
    async def generate(self, query: str, model_provider: str = "ollama", model_name: str = "qwen:0.5b", memory_context: str = ""):
        llm = get_llm(provider=model_provider, model_name=model_name)

        memory_section = ""
        if memory_context:
            memory_section = f"""
        Relevant context from previous debates (use if helpful):
        {memory_context}
        """

        prompt = f""" 

        You are a highly intelligent proposer agent.

        Solve the following problem clearly:

        Question:
        {query}
        {memory_section}
        """

        response = llm.invoke(prompt)
        # If Bedrock, response might be AIMessage, otherwise string
        return response.content if hasattr(response, 'content') else response