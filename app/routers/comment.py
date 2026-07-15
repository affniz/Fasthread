from fastapi import Response,status,HTTPException,Depends,APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import select
from .. import schemas,database,models,oauth2

router=APIRouter(prefix="/comment",tags=['Comments'])

@router.post("/",status_code=status.HTTP_201_CREATED,response_model=schemas.CommentOut)
def add_comment(comment:schemas.Comment,db:Session=Depends(database.get_db),current_user:schemas.UserOut=Depends(oauth2.get_current_user)):
    new_comment = models.Comment(
        user_id=current_user.id,
        post_id=comment.post_id,
        comment=comment.comment
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.put("/{id}",response_model=schemas.CommentOut)
def update_comment(id:int,comment:schemas.CommentUpdate,db:Session=Depends(database.get_db),current_user:schemas.UserOut=Depends(oauth2.get_current_user)):
    comment_db = db.execute(select(models.Comment).where(models.Comment.id == id)).scalar_one_or_none()
    if not comment_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment not found"
        )
    if comment_db.user_id!=current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Not authorized to perform requested action")
    comment_db.comment = comment.comment
    db.commit()
    db.refresh(comment_db)
    return comment_db

@router.delete("/{id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(id:int,db:Session=Depends(database.get_db),current_user:schemas.UserOut=Depends(oauth2.get_current_user)):
    del_comm = db.execute(select(models.Comment).where(models.Comment.id==id,models.Comment.user_id==current_user.id)).scalar_one_or_none()
    if del_comm is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,detail="Comment not found"
    )
    db.delete(del_comm)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
