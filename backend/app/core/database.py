from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

#get DATABASE_URL from .env via config
DATABASE_URL = settings.DATABASE_URL

#create engine
engine = create_engine(
    DATABASE_URL,
    echo=True  # optional: shows SQL logs (good for debugging)
)

#create session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

#base class for models
Base = declarative_base()

#dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()