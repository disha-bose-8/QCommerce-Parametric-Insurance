# app/services/payout_service.py
from datetime import datetime, date
from app.core.database import SessionLocal
from app.models.models import Worker, Payout

def settle_all_active_workers(zone: str, trigger_type: str, raw_value: float):
    db = SessionLocal()
    try:
        affected_workers = db.query(Worker).filter(Worker.zone == zone).all()
        today = date.today()
        settled_count = 0

        for worker in affected_workers:
            # Guard: one payout per worker per trigger type per day
            existing = db.query(Payout).filter(
                Payout.worker_id    == worker.id,
                Payout.trigger_type == trigger_type,
                Payout.date         == today,
            ).first()
            if existing:
                continue

            # Correct formula: weekly_income ÷ 7 × 0.5
            amount = round(worker.weekly_income / 7 * 0.5, 2)

            new_payout = Payout(
                worker_id   = worker.id,
                amount      = amount,
                trigger_type= trigger_type,
                date        = today,
                audit_trail = f"Automated: {trigger_type} ({raw_value}) detected via oracle.",
                status      = "settled",
                created_at  = datetime.now(),
            )
            db.add(new_payout)

            # Credit the payout amount back into wallet (represents UPI credit)
            worker.wallet_balance = round((worker.wallet_balance or 0.0) + amount, 2)
            settled_count += 1

        db.commit()
        print(f"💰 {settled_count} workers in {zone} settled for {trigger_type}")
    except Exception as e:
        print(f"Error in settlement: {e}")
        db.rollback()
    finally:
        db.close()