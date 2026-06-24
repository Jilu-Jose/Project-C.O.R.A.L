import os
from langchain_community.llms import Ollama

def get_llm(provider="ollama", model_name="qwen:0.5b"):
    """
    Factory to instantiate the appropriate LLM client based on the provider.
    """
    if provider.lower() == "bedrock":
        try:
            from langchain_aws import ChatBedrock
            return ChatBedrock(
                model_id=model_name,
                model_kwargs={"temperature": 0.7}
            )
        except ImportError:
            raise ImportError("Could not import langchain_aws. Please ensure it is installed.")
            
    else:
        # Default to local Ollama
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        return Ollama(
            model=model_name,
            base_url=base_url
        )
