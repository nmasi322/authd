from sqlalchemy import Column, String, Integer, ForeignKey,DateTime 
from sqlalchemy.orm import relationship
from .database import Base
import uuid
from datetime import datetime

class User(Base):

    __tablename__ = 'users'

    id = Column(String(36), primary_key=True, index=True, default=str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    refresh_tokens = relationship("RefreshToken", back_populates="user")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    
    user = relationship("User", back_populates="refresh_tokens")
