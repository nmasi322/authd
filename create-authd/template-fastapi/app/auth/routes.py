# FastAPI Import
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

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

    access_token = token.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

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
def refresh_token(current_user: str = Depends(token.verify_token)):
    # Generate a new access token based on the current user
    new_access_token = token.create_access_token(data={"sub": current_user})
    return {"access_token": new_access_token, "token_type": "bearer"}
