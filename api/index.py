import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from backend.database import engine
from backend.models import Base
from backend.routers.auth import router as auth_router
from backend.routers.teams import router as teams_router
from backend.routers.tasks import router as tasks_router
from backend.routers.messages import router as messages_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskFlow")

allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:8000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(teams_router)
app.include_router(tasks_router)
app.include_router(messages_router)

frontend_dir = Path(__file__).parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="static")
