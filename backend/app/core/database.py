from sqlalchemy import create_engine #connect to database
from sqlalchemy.orm import sessionmaker #talk to database using sessions
from sqlalchemy.orm import declarative_base # base class for models

from app.core.config import settings

# create connection
engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db        # give session to route function
    finally:
        db.close()      