import aiosqlite
import json
import os
import time

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DB_PATH = os.path.join(DB_DIR, "coral.db")


async def init_db():
    """Initialize the database and create tables if they don't exist."""
    os.makedirs(DB_DIR, exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                trace_id TEXT PRIMARY KEY,
                query TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'RUNNING',
                result_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL
            )
        """)
        await db.commit()


async def save_session(session: dict):
    """Insert or update a session in the database."""
    trace_id = session.get("trace_id")
    query = session.get("query", "")
    status = session.get("status", "RUNNING")
    created_at = session.get("timestamp", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    result_json = json.dumps(session)

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO sessions (trace_id, query, status, result_json, created_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(trace_id) DO UPDATE SET
                status = excluded.status,
                result_json = excluded.result_json
        """, (trace_id, query, status, result_json, created_at))
        await db.commit()


async def get_session(trace_id: str) -> dict | None:
    """Retrieve a single session by trace_id."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT result_json FROM sessions WHERE trace_id = ?", (trace_id,)
        )
        row = await cursor.fetchone()
        if row:
            return json.loads(row["result_json"])
        return None


async def list_sessions(limit: int = 20) -> list[dict]:
    """Return most recent sessions, newest first."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT result_json FROM sessions ORDER BY created_at DESC LIMIT ?",
            (limit,)
        )
        rows = await cursor.fetchall()
        return [json.loads(row["result_json"]) for row in rows]
