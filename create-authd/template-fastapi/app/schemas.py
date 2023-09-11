from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    username: str
    email: EmailStr
    password: str

class User(UserBase):
    pass

class TokenData(BaseModel):
    username: str | None = None
