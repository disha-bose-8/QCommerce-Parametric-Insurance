from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey # Added DateTime and ForeignKey
from app.core.database import Base
from datetime import datetime, date # Added datetime

# Worker Table
class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String)
    zone = Column(String)
    weekly_income = Column(Float)
    platform = Column(String)
    password = Column(String)


# Policy Table
class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer)
    week_start = Column(Date)
    premium = Column(Float)
    status = Column(String)  # active / expired


# Payout Table
class Payout(Base):
    __tablename__ = "payouts"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    amount = Column(Float)
    trigger_type = Column(String)  # rain / heat / AQI / outage
    
    # NEW COLUMNS ADDED HERE
    audit_trail = Column(String, nullable=True) 
    status = Column(String, default="settled")
    
    # Changed to DateTime so the React app shows "2 mins ago" instead of just the date
    created_at = Column(DateTime, default=datetime.utcnow)


# ✅ Premium Table (FIXED INDENTATION)
class Premium(Base):
    __tablename__ = "premiums"

    id = Column(Integer, primary_key=True, index=True)
    weekly_income = Column(Float)
    zone = Column(String)
    month = Column(String)
    risk_factor = Column(Float)
    total_premium = Column(Float)
    worker_pays = Column(Float)
    platform_pays = Column(Float)
    created_at = Column(Date, default=date.today)