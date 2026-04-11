# app/api/worker_api.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Worker

router = APIRouter()

# ── SCHEMAS ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    phone: str
    zone: str
    income: float
    platform: str
    password: str

class LoginRequest(BaseModel):
    name: str
    password: str

# ── REGISTER ──────────────────────────────────────────────────────────────────

@router.post("/register")
def register_worker(request: RegisterRequest, db: Session = Depends(get_db)):
    new_worker = Worker(
        name          = request.name,
        phone         = request.phone,
        zone          = request.zone,
        weekly_income = request.income,
        platform      = request.platform,
        password      = request.password,
    )
    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)
    return {"message": "User registered successfully", "worker_id": new_worker.id}

# ── LOGIN ─────────────────────────────────────────────────────────────────────

@router.post("/login")
def login_worker(request: LoginRequest, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.name == request.name).first()
    if not worker:
        return {"error": "User not found"}
    if worker.password != request.password:
        return {"error": "Incorrect password"}
    # Return full worker data so frontend can store everything in localStorage
    return {
        "message":       "Login successful",
        "worker_id":     worker.id,
        "name":          worker.name,
        "zone":          worker.zone,
        "platform":      worker.platform,
        "weekly_income": worker.weekly_income,
    }

# ── GET ALL WORKERS (admin) ───────────────────────────────────────────────────

@router.get("/all")
def get_all_workers(db: Session = Depends(get_db)):
    workers = db.query(Worker).all()
    return [
        {
            "id":            w.id,
            "name":          w.name,
            "zone":          w.zone,
            "platform":      w.platform,
            "weekly_income": w.weekly_income,
        }
        for w in workers
    ]

# ── GET SINGLE WORKER ─────────────────────────────────────────────────────────

@router.get("/{worker_id}")
def get_worker(worker_id: int, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        return {"error": "Worker not found"}
    return {
        "id":            worker.id,
        "name":          worker.name,
        "zone":          worker.zone,
        "platform":      worker.platform,
        "weekly_income": worker.weekly_income,
        "phone":         worker.phone,
    }