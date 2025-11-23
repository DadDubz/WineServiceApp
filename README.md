# 🍷 WineServiceApp

**Premium Wine Service & Inventory Management System**

Full-stack application with elegant maroon/tan design, perfect for fine dining establishments.

[![Docker Build](https://github.com/DadDubz/WineServiceApp/actions/workflows/docker-build.yml/badge.svg)](https://github.com/DadDubz/WineServiceApp/actions)

## 🎨 Features

- ✅ **User Authentication** - JWT-based secure login
- ✅ **Role-Based Access** - Manager, Sommelier, Expo, Server roles
- ✅ **Wine Inventory** - Track wines with vintage, region, and tasting notes
- ✅ **Table Management** - Service tracking and course management
- ✅ **Premium Design** - Maroon/tan/white professional color scheme
- ✅ **Responsive UI** - Works on desktop, tablet, and mobile

## 🚀 Tech Stack

- **Backend**: FastAPI, SQLAlchemy, SQLite/PostgreSQL
- **Frontend**: React 19, Vite 7, TypeScript, Tailwind CSS 4
- **Auth**: JWT (OAuth2 Password Flow)
- **Deployment**: Docker, Docker Compose, GitHub Actions

## ⚡ Quick Start (Docker)

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
