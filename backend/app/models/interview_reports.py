from sqlalchemy import Column, ForeignKey, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.db import Base
from sqlalchemy.orm import relationship

class InterviewReport(Base):
    __tablename__ = "interview_reports"

    report_id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(
        String,
        ForeignKey("interview_sessions.session_id"),
        unique=True,
        index=True
    )

    feedback_report = Column(Text, nullable=True)
    score = Column(Integer)  # 0–100 weighted overall score

    skill_scores = Column(JSON, nullable=True)      # {"technical_knowledge": 85, ...}
    strengths = Column(JSON, nullable=True)          # ["strength1", ...]
    improvements = Column(JSON, nullable=True)       # ["area1", ...]
    hiring_decision = Column(String, nullable=True)  # Strong Hire | Hire | Maybe | No Hire
    final_verdict = Column(Text, nullable=True)      # Detailed recommendation

    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship(
        "InterviewSession",
        back_populates="report"
    )
