from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routers import fakepay, linkguard, voicescam, history, stats

app = FastAPI(title="PhantomCheck AI", version="1.0.0")

# Configure CORS for production
# ALLOWED_ORIGINS should be a comma-separated list in .env (e.g., https://myapp.vercel.app)
origins = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fakepay.router,   prefix="/api/fakepay",   tags=["FakePay"])
app.include_router(linkguard.router, prefix="/api/linkguard", tags=["LinkGuard"])
app.include_router(voicescam.router, prefix="/api/voicescam", tags=["VoiceScam"])
app.include_router(history.router,   prefix="/api/history",   tags=["History"])
app.include_router(stats.router,     prefix="/api/stats",     tags=["Stats"])

@app.get("/")
def root(): return {"status": "PhantomCheck AI running"}

@app.get("/health")
def health(): return {"status": "ok"}
