from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Worker

router = APIRouter()

# REQUEST SCHEMAS
class RegisterRequest(BaseModel):
    name: str
    zone: str
    income: float
    platform: str
    password: str

class LoginRequest(BaseModel):
    name: str
    password: str

# REGISTER API
@router.post("/register")
def register_worker(request: RegisterRequest, db: Session = Depends(get_db)):

    new_worker = Worker(
        name=request.name,
        zone=request.zone,
        weekly_income=request.income,
        platform=request.platform,
        password=request.password
    )

    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)

    return {
        "message": "User registered successfully",
        "worker_id": new_worker.id
    }

# LOGIN API
@router.post("/login")
def login_worker(request: LoginRequest, db: Session = Depends(get_db)):

    worker = db.query(Worker).filter(Worker.name == request.name).first()

    if not worker:
        return {"error": "User not found"}

    if worker.password != request.password:
        return {"error": "Incorrect password"}

    return {
        "message": "Login successful",
        "worker_id": worker.id
    }