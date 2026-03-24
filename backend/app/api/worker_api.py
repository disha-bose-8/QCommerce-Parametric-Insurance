from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Worker

router = APIRouter()

@router.post("/add-worker")
def add_worker(name: str, zone: str, income: float, platform: str, db: Session = Depends(get_db)):
    new_worker = Worker(
        name=name,
        zone=zone,
        weekly_income=income,
        platform=platform
    )

    db.add(new_worker)
    db.commit()

    return {"message": "Worker added successfully"}