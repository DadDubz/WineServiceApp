from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.wines import router as wines_router
from app.routes.tables import router as tables_router

app = FastAPI()

# Allowed origins for Vite frontend during development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth")
app.include_router(wines_router, prefix="/wines")
app.include_router(tables_router, prefix="/tables")


# Optional health check
@app.get("/healthz")
def healthz():
    return {"ok": True}
