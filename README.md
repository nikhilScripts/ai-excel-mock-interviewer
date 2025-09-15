AI-Powered Excel Mock Interviewer (PoC)

Overview
- Web app to simulate an Excel interview: chat Q&A + simple grid task + final report.
- Frontend: Next.js + Tailwind.
- Backend: FastAPI + OpenAI (optional). Sessions in-memory; reports saved as JSON.

Monorepo
- ai-excel-mock-interviewer/
  - frontend/ (Next.js)
  - backend/ (FastAPI + Dockerfile)

Prerequisites
- Node 18+, npm
- Python 3.10+ (venv recommended)
- Optional: Docker

Environment variables
- Backend: create backend/.env
  - OPENAI_API_KEY=sk-... (optional; if omitted, uses offline grading fallback)
- Frontend: create frontend/.env.local
  - NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000

Run locally
1) Backend
   - Windows PowerShell:
     - cd ai-excel-mock-interviewer/backend
     - python -m venv .venv
     - .\.venv\Scripts\Activate.ps1
     - pip install -r requirements.txt
     - uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   - Verify: http://127.0.0.1:8000/health and http://127.0.0.1:8000/docs

2) Frontend
   - New terminal:
     - cd ai-excel-mock-interviewer/frontend
     - npm install
     - npm run dev
   - App: http://localhost:3000

Demo flow
1. Landing → Start Interview
2. Chat: answer ~15 unique questions (theory/practical). After the last question, the AI will say the interview is complete.
3. Grid: type values or simple formulas (e.g., =2+2, use the word sum or a SUM formula) → Submit Grid
4. Finish and view report → shows Theory/Practical/Efficiency/Communication and Total, with feedback

Endpoints (FastAPI)
- GET /health
- GET|POST /start → returns { session_id, question }
- POST /answer → { session_id, answer } → { feedback, next_question|null }
- POST /grid → { session_id, grid: [][] } → { score }
- GET|POST /report → optional { session_id } → final scores + feedback

Docker (backend only)
- Build:
  - cd ai-excel-mock-interviewer/backend
  - docker build -t ai-excel-backend .
- Run:
  - docker run -p 8000:8000 -e OPENAI_API_KEY=sk-... ai-excel-backend

Docker Compose (backend)
- From repo root:
  - docker compose up --build
- Exposes backend at http://127.0.0.1:8000

Deploy
- Frontend to Vercel: set project root to frontend/, set NEXT_PUBLIC_API_BASE to your backend URL
- Backend to any PaaS/VPS: run uvicorn or the provided Docker image, ensure CORS allows your frontend origin

Troubleshooting
- "Failed to fetch" in UI → check backend /health, confirm NEXT_PUBLIC_API_BASE and restart npm run dev
- /health 404 → restart backend so latest routes load
- OpenAI client proxy error → reinstall requirements (pip install -r backend/requirements.txt)


