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

- Backend: <http://localhost:8000>
- Frontend: <http://localhost:5173>

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

- Open <http://localhost:5173>

## 🌐 Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for comprehensive deployment guides including:

- Docker deployment
- Cloud platforms (Render, Railway, Heroku, Fly.io)
- GitHub Actions CI/CD
- Production configuration

## 👥 Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| manager1 | pass | Manager (Full access) |
| sommelier1 | pass | Sommelier (Wine management) |
| expo1 | pass | Expo (Service) |
| server1 | pass | Server |

## 📸 Screenshots

**Login Page** - Elegant maroon/tan design with wine glass branding

**Dashboard** - Stats cards, wine inventory, and role-based features

## 🔧 API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Current user profile
- `GET /api/wines/` - List all wines
- `POST /api/wines/` - Add wine (Manager/Sommelier)
- `GET /api/tables/` - List tables
- `POST /api/tables/` - Create table
- `GET /api/healthz` - Health check

## 📝 Notes

- API routes prefixed with `/api` for Kubernetes ingress compatibility
- JWT tokens stored in `localStorage` with `authToken` key
- Frontend environment: `VITE_API_BASE_URL`
- Backend environment: `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- The older `backend/server.py` is deprecated - use `app.main:app`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Support

For issues or questions:

- Open a GitHub Issue
- Check SETUP_COMPLETE.md for detailed setup info
- See DEPLOYMENT.md for deployment help

---

**Built with ❤️ for premium wine service excellence** 🍷
