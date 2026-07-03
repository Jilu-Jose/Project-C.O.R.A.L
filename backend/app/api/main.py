from dotenv import load_dotenv
load_dotenv()

import asyncio
import time
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager

from app.graph.workflow import graph, get_memory_context
from app.database import db


# In-memory store for live debate progress (trace_id -> current state)
# This is intentionally in-memory since it only tracks running debates.
live_debates: dict[str, dict] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await db.init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str
    max_rounds: Optional[int] = 3
    convergence_threshold: Optional[float] = 0.80
    model_provider: Optional[str] = "ollama"
    model_name: Optional[str] = "qwen:0.5b"
    memory_injection: Optional[bool] = False


@app.get("/")
async def root():
    return {
        "message": "C.O.R.A.L System Running"
    }


async def _run_debate(trace_id: str, data: QueryRequest):
    """
    Background task that runs the LangGraph debate and updates
    live_debates with intermediate state for polling.
    """
    try:
        # Look up memory context if injection is enabled
        memory_context = ""
        if data.memory_injection:
            memory_context = get_memory_context(data.query)

        initial_state = {
            "query": data.query,
            "proposer_response": "",
            "critic_response": "",
            "final_response": "",
            "debate_history": [],
            "round_count": 0,
            "max_rounds": data.max_rounds,
            "model_provider": data.model_provider,
            "model_name": data.model_name,
            "memory_injection": data.memory_injection,
            "memory_context": memory_context,
        }

        start_time = time.time()

        # Update live state to show we're running
        live_debates[trace_id].update({
            "status": "RUNNING",
            "agentStatuses": {"proposer": "THINKING", "critic": "WAITING", "arbitrator": "LISTENING"},
        })

        result = await graph.ainvoke(initial_state)

        elapsed = round(time.time() - start_time, 2)

        session = {
            "trace_id": trace_id,
            "query": data.query,
            "task": data.query,
            "history": result.get("debate_history", []),
            "proposer": result.get("proposer_response", ""),
            "critic": result.get("critic_response", ""),
            "final": result.get("final_response", ""),
            "round_count": result.get("round_count", 1),
            "elapsed_seconds": elapsed,
            "status": "CONVERGED",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "converged": True,
            "agentStatuses": {"proposer": "IDLE", "critic": "IDLE", "arbitrator": "IDLE"},
        }

        # Update live state with final results
        live_debates[trace_id] = session

        # Persist to SQLite
        await db.save_session(session)

    except Exception as e:
        import traceback
        traceback.print_exc()
        error_session = {
            "trace_id": trace_id,
            "query": data.query,
            "status": "FAILED",
            "error": str(e),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "agentStatuses": {"proposer": "IDLE", "critic": "IDLE", "arbitrator": "IDLE"},
        }
        live_debates[trace_id] = error_session
        await db.save_session(error_session)


@app.post("/debate")
async def debate(data: QueryRequest):

    trace_id = f"trc_{uuid.uuid4().hex[:12]}"
    start_time = time.time()

    # Initialize live tracking entry
    live_debates[trace_id] = {
        "trace_id": trace_id,
        "query": data.query,
        "task": data.query,
        "status": "STARTING",
        "round_count": 0,
        "history": [],
        "proposer": "",
        "critic": "",
        "final": "",
        "converged": False,
        "elapsed_seconds": 0,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "agentStatuses": {"proposer": "WAITING", "critic": "WAITING", "arbitrator": "WAITING"},
    }

    # Launch the debate in the background
    asyncio.create_task(_run_debate(trace_id, data))

    return {
        "trace_id": trace_id,
        "status": "RUNNING",
        "message": "Debate started. Poll /debate/status/{trace_id} for updates."
    }


@app.get("/debate/status/{trace_id}")
async def debate_status(trace_id: str):
    """
    Polling endpoint for live debate progress.
    Returns current intermediate state from in-memory tracking,
    or falls back to SQLite for completed debates.
    """
    # Check live in-memory state first
    if trace_id in live_debates:
        return live_debates[trace_id]

    # Fall back to persisted session
    session = await db.get_session(trace_id)
    if session:
        return session

    raise HTTPException(status_code=404, detail="Debate session not found")


@app.get("/history")
async def history(limit: int = 20):
    # Return most recent sessions from SQLite
    sessions = await db.list_sessions(limit=limit)
    return sessions


@app.get("/reports/{trace_id}")
async def get_report(trace_id: str):
    # Check live state first
    if trace_id in live_debates:
        return live_debates[trace_id]

    # Fall back to SQLite
    session = await db.get_session(trace_id)
    if session:
        return session

    raise HTTPException(status_code=404, detail="Session not found")


@app.get("/health")
async def health():
    return {
        "status": "HEALTHY",
        "ollama": True,
        "langsmith": False
    }
