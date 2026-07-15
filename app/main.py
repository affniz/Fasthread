from fastapi import FastAPI
from app.routers import post,user,auth,vote,comment
from .database import engine
from . import models
from fastapi.middleware.cors import CORSMiddleware

#models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fasthread API")

# Token-based API (Authorization header, no cookies), so any origin may call
# it and credentials are not required.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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