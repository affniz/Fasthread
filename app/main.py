from fastapi import FastAPI
from app.routers import post,user,auth,vote,comment
from .database import engine
from . import models
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
import json

#models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fasthread API")

# Parse CORS_ORIGINS robustly
raw_origins = settings.CORS_ORIGINS.strip()
if raw_origins == "*":
    origins = ["*"]
    allow_credentials = False
else:
    if raw_origins.startswith("[") and raw_origins.endswith("]"):
        try:
            origins = json.loads(raw_origins)
        except Exception:
            origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    else:
        origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get('/')
def basic():
    return {"Message":"Hello World"}

app.include_router(post.router)
app.include_router(user.router)
app.include_router(auth.router)
app.include_router(vote.router)
app.include_router(comment.router)