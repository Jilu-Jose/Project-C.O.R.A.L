from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.graph.workflow import graph



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query:str



@app.get("/")
async def root():
    return {
        "message":"C.O.R.A.L System Running"
    }


@app.post("/debate")
async def debate(data: QueryRequest):

    initial_state = {
        "query": data.query,
        "proposer_response": "",
        "critic_response": "",
        "final_response": "",
        "debate_history": [],
        "round_count": 0
    }

    result = await graph.ainvoke(initial_state)

    return {
        "query": data.query,
        "history": result["debate_history"],
        "proposer": result["proposer_response"],
        "critic": result["critic_response"],
        "final": result["final_response"],
    }


@app.get("/health")
async def health():
    return {
        "status":"HEALTHY"
    }