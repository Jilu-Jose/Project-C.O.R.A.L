from app.models.ollama_client import get_llm

class CriticAgent:

    def __init__(self):
        self.llm = get_llm()


    async def critique(self, query:str, proposer_answer: str):

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

        response = self.llm.invoke(prompt)
        return response
    
    