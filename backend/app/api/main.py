from dotenv import load_dotenv
load_dotenv()

import time
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from app.graph.workflow import graph



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
session_store: list[dict] = []

class QueryRequest(BaseModel):
    query: str
    max_rounds: Optional[int] = 3
    convergence_threshold: Optional[float] = 0.80



@app.get("/")
async def root():
    return {
        "message": "C.O.R.A.L System Running"
    }


@app.post("/debate")
async def debate(data: QueryRequest):

    trace_id = f"trc_{uuid.uuid4().hex[:12]}"
    start_time = time.time()

    initial_state = {
        "query": data.query,
        "proposer_response": "",
        "critic_response": "",
        "final_response": "",
        "debate_history": [],
        "round_count": 0
    }

    try:
        result = await graph.ainvoke(initial_state)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Debate failed: {str(e)}")

    elapsed = round(time.time() - start_time, 2)

    session = {
        "trace_id": trace_id,
        "query": data.query,
        "task": data.query,
        "history": result["debate_history"],
        "proposer": result["proposer_response"],
        "critic": result["critic_response"],
        "final": result["final_response"],
        "round_count": result.get("round_count", 1),
        "elapsed_seconds": elapsed,
        "status": "CONVERGED",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    session_store.append(session)

    return session


@app.get("/history")
async def history(limit: int = 20):
    # Return most recent sessions first
    return list(reversed(session_store[-limit:]))


@app.get("/reports/{trace_id}")
async def get_report(trace_id: str):
    for session in session_store:
        if session["trace_id"] == trace_id:
            return session
    raise HTTPException(status_code=404, detail="Session not found")


@app.get("/health")
async def health():
    return {
        "status": "HEALTHY",
        "ollama": True,
        "langsmith": False
    }