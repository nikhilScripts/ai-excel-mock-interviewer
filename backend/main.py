from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List
import uuid
import json
from pathlib import Path

from ai_utils import grade_answer, generate_questions
from evaluator import evaluate_grid

app = FastAPI(title="AI Excel Mock Interviewer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

class AnswerIn(BaseModel):
    session_id: str
    answer: str

class GridIn(BaseModel):
    session_id: str
    grid: List[List[Any]]

class ReportIn(BaseModel):
    session_id: str | None = None

SESSIONS: Dict[str, Dict[str, Any]] = {}

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/start")
@app.get("/start")
def start():
    session_id = str(uuid.uuid4())
    qs = generate_questions(limit=15)
    q1 = qs[0]
    SESSIONS[session_id] = {
        "questions": qs,
        "index": 0,
        "answers": [],
        "scores": {"theory": 0, "practical": 0, "efficiency": 12, "communication": 12},
    }
    return {"session_id": session_id, "question": q1}

@app.post("/answer")
def answer(inp: AnswerIn):
    session = SESSIONS.get(inp.session_id)
    if not session:
        return {"error": "invalid session"}
    session["answers"].append(inp.answer)
    feedback, delta_score, _ = grade_answer(inp.answer)
    session["scores"]["theory"] = min(20, session["scores"]["theory"] + delta_score)
    # advance question index
    # advance
    session["index"] = session["index"] + 1
    next_q = None
    if session["index"] < len(session["questions"]):
        next_q = session["questions"][session["index"]]
    return {"feedback": feedback, "next_question": next_q}

@app.post("/grid")
def grid(inp: GridIn):
    session = SESSIONS.get(inp.session_id)
    if not session:
        return {"error": "invalid session"}
    score = evaluate_grid(inp.grid)
    session["scores"]["practical"] = min(40, score)
    return {"score": score}

@app.post("/report")
@app.get("/report")
def report(inp: ReportIn | None = None):
    # Prefer provided session, else last session
    sid = (inp.session_id if inp else None) or next(iter(SESSIONS.keys()), None)
    if not sid:
        dummy = {"theory": 12, "practical": 20, "efficiency": 15, "communication": 16}
        total = sum(dummy.values())
        return {**dummy, "total": total, "feedback": "Good starting point. Keep practicing formulas."}
    scores = SESSIONS[sid]["scores"]
    scores["efficiency"] = scores.get("efficiency", 15)
    scores["communication"] = scores.get("communication", 16)
    total = sum(scores.values())
    out = {**scores, "total": total, "feedback": "Strong candidate, efficient with formulas."}
    # persist
    (DATA_DIR / f"report_{sid}.json").write_text(json.dumps(out, indent=2))
    return out

