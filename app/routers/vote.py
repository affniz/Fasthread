from fastapi import Response,status,HTTPException,Depends,APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import select
from .. import schemas,database,models,oauth2

router=APIRouter(
    prefix="/vote",
    tags=['Vote']
)

@router.post("/upvote",status_code=status.HTTP_201_CREATED)
def upvote_on_post(vote_data:schemas.Vote,db:Session = Depends(database.get_db),current_user:schemas.UserOut=Depends(oauth2.get_current_user)):
    post=db.scalar(select(models.Post).where(models.Post.id==vote_data.post_id))
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"Post with id {vote_data.post_id} does not exist")
    vote_query=select(models.UPVote).where(models.UPVote.post_id == vote_data.post_id, models.UPVote.user_id == current_user.id)
    downvote = select(models.DownVote).where(models.DownVote.post_id == vote_data.post_id, models.DownVote.user_id == current_user.id)
    found_vote=db.scalar(vote_query)
    found_downvote=db.scalar(downvote)
    if found_vote:
        db.delete(found_vote)
        db.commit()
        return {"Message":"UPVote removed"}
    if found_downvote:
        db.delete(found_downvote)
        db.commit()
    new_vote = models.UPVote(post_id=vote_data.post_id,user_id=current_user.id)
    db.add(new_vote)
    db.commit()
    return {"Message":"UpVote Successful"}

@router.post("/downvote",status_code=status.HTTP_201_CREATED)
def downvote_on_post(vote_data:schemas.Vote,db:Session=Depends(database.get_db),current_user:schemas.UserOut=Depends(oauth2.get_current_user)):
    post=db.scalar(select(models.Post).where(models.Post.id==vote_data.post_id))
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"Post with id {vote_data.post_id} does not exist")
    vote_query=select(models.DownVote).where(models.DownVote.post_id==vote_data.post_id,models.DownVote.user_id==current_user.id)
    upvote=select(models.UPVote).where(models.UPVote.post_id == vote_data.post_id, models.UPVote.user_id == current_user.id)
    found_upvote=db.scalar(upvote)
    found_vote=db.scalar(vote_query)
    if found_vote:
        db.delete(found_vote)
        db.commit()
        return {"Message":"Down_Vote removed"}
    if found_upvote:
        db.delete(found_upvote)
        db.commit()
    new_vote = models.DownVote(post_id=vote_data.post_id,user_id=current_user.id)
    db.add(new_vote)
    db.commit()
    return {"Message":"DownVote Successful"}