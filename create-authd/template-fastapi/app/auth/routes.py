# FastAPI Import
from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta

# SqlAlchemy Import
from sqlalchemy.orm import Session

# Own imports
from ..database import get_db
from .. import models,schemas
from ..core.hash import Hash
from ..core import token


router = APIRouter(
    tags=["Auth"]
)

@router.post("/signup")
def signup(request: schemas.User, db: Session = Depends(get_db)):
    # Check if the user already exists
    existing_user = db.query(models.User).filter(models.User.username == request.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")

    # Hash the user's password before saving it
    hashed_password = Hash.get_password_hash(request.password)

    # Create a new user
    new_user = models.User(username=request.username, email=request.email, password=hashed_password)
    db.add(new_user)
    db.commit()

    return {"user": new_user}

@router.post("/login")
def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user:
        #return False
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Credentials")
    if not Hash.verify_password(request.password, user.password):
        #return False
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Credentials")

    refresh_token = token.generate_refresh_token()
    
    db_refresh_token = models.RefreshToken(token=refresh_token, user_id=user.id, expires_at=datetime.utcnow() + timedelta(days=30))
    db.add(db_refresh_token)
    db.commit()

    access_token = token.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

@router.post("/password-reset/{username}")
def password_reset(username: str, new_password: str, db: Session = Depends(get_db)):
    # Find the user by username
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Hash the new password before saving it
    hashed_password = Hash.get_password_hash(new_password)

    # Update the user's password in the database using the SQLAlchemy update() method
    db.query(models.User).filter(models.User.username == username).update({"password": hashed_password})
    db.commit()

    return {"message": "Password reset successful"}

@router.post("/refresh-token")
def refresh_access_token(refresh_token: str = Form(...), db: Session = Depends(get_db)):
    # Verify the refresh token in the database
    db_refresh_token = db.query(models.RefreshToken).filter(models.RefreshToken.token == refresh_token).first()
    if not db_refresh_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Check if the refresh token has expired
    if db_refresh_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Expired refresh token")

    # Create a new access token
    user = db.query(models.User).filter(models.User.id == db_refresh_token.user_id).first()
    access_token = token.create_access_token({"sub": user.username})

    return {"access_token": access_token, "token_type": "bearer"}
