# app/api/simulate.py  ← NEW FILE, register in main.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, date
from app.core.database import get_db
from app.models.models import Worker, Payout

router = APIRouter()

TRIGGER_LABELS = {
    "RAIN":   "Heavy Rain (Simulated)",
    "HEAT":   "Extreme Heat (Simulated)",
    "AQI":    "Hazardous AQI (Simulated)",
    "OUTAGE": "Platform Outage (Simulated)",
    "CURFEW": "Government Curfew (Simulated)",
}

class SimulateTriggerRequest(BaseModel):
    trigger_type: str   # RAIN | HEAT | AQI | OUTAGE | CURFEW
    zone: str           # Koramangala | Whitefield | HSR | etc. | ALL

@router.post("/triggers/simulate")
def simulate_trigger(request: SimulateTriggerRequest, db: Session = Depends(get_db)):
    trigger = request.trigger_type.upper()
    zone    = request.zone

    # Fetch affected workers
    if zone.upper() == "ALL":
        workers = db.query(Worker).all()
    else:
        workers = db.query(Worker).filter(Worker.zone == zone).all()

    if not workers:
        return {"error": f"No workers found in zone: {zone}"}

    today = date.today()
    settled = []
    skipped = []

    for worker in workers:
        # ONE payout per worker per trigger type per day
        existing = db.query(Payout).filter(
            Payout.worker_id   == worker.id,
            Payout.trigger_type == trigger,
            Payout.date        == today,
        ).first()

        if existing:
            skipped.append(worker.id)
            continue

        # Correct formula: weekly_income ÷ 7 × 0.5
        amount = round(worker.weekly_income / 7 * 0.5, 2)

        new_payout = Payout(
            worker_id    = worker.id,
            amount       = amount,
            trigger_type = trigger,
            date         = today,
            audit_trail  = f"Admin simulated: {TRIGGER_LABELS.get(trigger, trigger)}",
            status       = "settled",
            created_at   = datetime.now(),
        )
        db.add(new_payout)
        settled.append({"worker_id": worker.id, "name": worker.name, "amount": amount})

    db.commit()

    return {
        "trigger":  trigger,
        "zone":     zone,
        "settled":  settled,
        "skipped_duplicate": skipped,
        "total_settled": len(settled),
    }