from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from app.core.database import Base
from datetime import datetime, date


class Worker(Base):
    __tablename__ = "workers"

    id                    = Column(Integer, primary_key=True, index=True)
    name                  = Column(String)
    phone                 = Column(String)
    zone                  = Column(String)
    weekly_income         = Column(Float)
    platform              = Column(String)
    password              = Column(String)
    wallet_balance        = Column(Float, default=0.0)
    premium_weekly        = Column(Float, default=0.0)
    # ── Claim history — used by dynamic pricing engine ──────────────────────
    claim_count           = Column(Integer, default=0)   # total settled payouts ever
    total_payout_received = Column(Float,   default=0.0) # cumulative ₹ paid out ever


class Policy(Base):
    __tablename__ = "policies"

    id         = Column(Integer, primary_key=True, index=True)
    worker_id  = Column(Integer)
    week_start = Column(Date)
    premium    = Column(Float)
    status     = Column(String)


class Payout(Base):
    __tablename__ = "payouts"

    id           = Column(Integer, primary_key=True, index=True)
    worker_id    = Column(Integer, ForeignKey("workers.id"))
    amount       = Column(Float)
    trigger_type = Column(String)
    audit_trail  = Column(String, nullable=True)
    status       = Column(String, default="settled")
    created_at   = Column(DateTime, default=datetime.utcnow)


class Premium(Base):
    __tablename__ = "premiums"

    id            = Column(Integer, primary_key=True, index=True)
    weekly_income = Column(Float)
    zone          = Column(String)
    month         = Column(String)
    risk_factor   = Column(Float)
    total_premium = Column(Float)
    worker_pays   = Column(Float)
    platform_pays = Column(Float)
    created_at    = Column(Date, default=date.today)