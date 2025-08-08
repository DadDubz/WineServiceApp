# WineServiceApp

Full-stack app for wine service and inventory.

## Tech
- Backend: FastAPI, SQLAlchemy, SQLite (dev)
- Frontend: React + Vite

## Quick start (Docker)

Prereqs: Docker and Docker Compose installed.

1) Copy env examples (optional):
```
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
2) Build and run:
```
docker compose up --build
```
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

3) Seed demo users (in another shell):
```
docker compose exec backend python -m app.routes.users_seed
```
Demo users:
- manager1 / pass
- sommelier1 / pass
- expo1 / pass

## Local dev (without Docker)

Prereqs: Python 3.11 with venv, Node 20+

Backend:
```
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:
```
cd frontend
cp .env.example .env  # ensures API base URL
npm ci
npm run dev
```
- Open http://localhost:5173

## Notes
- API base URL is configured via `VITE_API_BASE_URL` in frontend and defaults to `http://localhost:8000`.
- Auth uses OAuth2 Password to get a JWT; the token is stored in `localStorage` and sent as `Authorization: Bearer`.
- The older demo server in `backend/server.py` is deprecated. Use the FastAPI app (`app.main`).
- The `WineServiceApp-Frontend` directory appears to be a legacy scaffold; the active frontend is `frontend/`.
