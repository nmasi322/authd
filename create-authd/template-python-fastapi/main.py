# FastAPI Imports
from fastapi import FastAPI

# Own Imports
from app import models
from app.database import engine
from app.auth import routes


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(routes.router)
