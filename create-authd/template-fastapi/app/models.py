from sqlalchemy import Column, String
from .database import Base
import uuid

class User(Base):

    __tablename__ = 'users'

    id = Column(String(36), primary_key=True, index=True, default=str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
