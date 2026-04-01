# app/services/payout_service.py
from datetime import datetime
from app.core.database import SessionLocal
from app.models.models import Worker, Payout # Replace with your actual model names

def settle_all_active_workers(zone: str, trigger_type: str, raw_value: float):
    db = SessionLocal()
    try:
        # 1. Find all workers in the affected zone from your DB
        affected_workers = db.query(Worker).filter(Worker.zone == zone).all()
        
        for worker in affected_workers:
            # 2. Create a new Payout record in the database
            new_payout = Payout(
                worker_id=worker.id,
                amount=worker.weekly_income * 0.1, # 10% daily coverage
                trigger_type=trigger_type,
                audit_trail=f"Automated: {trigger_type} ({raw_value}) detected via OpenWeatherMap.",
                created_at=datetime.now()
            )
            db.add(new_payout)
        
        db.commit()
        print(f"💰 {len(affected_workers)} workers in {zone} settled for {trigger_type}")
    except Exception as e:
        print(f"Error in settlement: {e}")
        db.rollback()
    finally:
        db.close()