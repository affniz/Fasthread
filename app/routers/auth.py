from fastapi import APIRouter,Depends,status,HTTPException,Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
from .. import database,schemas,models,utils,oauth2


router=APIRouter(tags=['Authentication'])

@router.post("/login",response_model=schemas.Token)
def user_login(user_credentials:OAuth2PasswordRequestForm=Depends(),db:Session=Depends(database.get_db)):
    #user_credentials = {username,password}
    user=db.execute(select(models.User).where(models.User.email==user_credentials.username)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail=f"Invalid Credentials")
    if not utils.verify(user_credentials.password,user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Invalid Credentials")
    #create token
    token=oauth2.create_access_token(data={"user_id":user.id})
    #return token
    return {"access_token":token,"token_type":"bearer"}

