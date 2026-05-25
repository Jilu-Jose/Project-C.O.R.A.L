import os
from langchain_community.llms import Ollama

def get_llm(model_name=None):
    model = model_name or os.getenv("OLLAMA_MODEL", "qwen:0.5b")
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

    llm = Ollama(
        model=model,
        base_url=base_url
    )

    return llm
