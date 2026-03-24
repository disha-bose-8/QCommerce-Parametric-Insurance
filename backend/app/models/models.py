from sqlalchemy import Column, Integer, String, Float, Date
from app.core.database import Base

#Worker Table
class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    zone = Column(String)
    weekly_income = Column(Float)
    platform = Column(String)

#Policy Table
class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer)
    week_start = Column(Date)
    premium = Column(Float)
    status = Column(String)  # active / expired

#Payout Table
class Payout(Base):
    __tablename__ = "payouts"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer)
    date = Column(Date)
    amount = Column(Float)
    trigger_type = Column(String)  # rain / heat / AQI / etc