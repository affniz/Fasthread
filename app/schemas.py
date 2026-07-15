from pydantic import BaseModel,ConfigDict,EmailStr,RootModel,field_validator,Field
from datetime import datetime
from typing import Literal

class PostBase(BaseModel):
    title:str
    content:str
    published:bool=True

class PostCreate(PostBase):
    pass

class UserOut(BaseModel):
    id:int
    email:EmailStr
    created_at:datetime
    model_config = ConfigDict(from_attributes=True)

class Post(PostBase):
    id:int
    created_at:datetime
    owner_id:int
    owner:UserOut
    model_config = ConfigDict(from_attributes=True)

class CommentOut(BaseModel):
    id: int
    user_id: int
    comment: str
    model_config = ConfigDict(from_attributes=True)

class PostOut(BaseModel):
    Post: Post
    up_votes: int
    down_votes: int
    comments: list[CommentOut] = Field(default_factory=list)
    my_vote: Literal["up", "down"] | None = None
    @field_validator("comments", mode="before")
    @classmethod
    def empty_if_none(cls, value):
        return [] if value is None else value
    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token:str
    token_type:str

class TokenData(BaseModel):
    id: int|None

class Vote(BaseModel):
    post_id:int

class Comment(BaseModel):
    post_id : int
    comment : str

    model_config = ConfigDict(from_attributes=True)

class CommentUpdate(BaseModel):
    comment: str