from sqlalchemy import JSON, Column, ForeignKey, String, Text, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from app.db import Base
from app.models.session_status import SessionStatus
from sqlalchemy.orm import relationship

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    # Primary Key
    session_id = Column(String, primary_key=True, index=True)
    
    # User Details
    user_id = Column(String, ForeignKey("users.user_id"), index=True)

    # Interviewer Character
    interviewer_id = Column(String, ForeignKey("interviewer_characters.id"))
    
    # Job Details
    job_role = Column(String)
    job_description = Column(Text)
    candidate_level = Column(String)

    # Voice Model
    voice_model = Column(String, nullable=True)
    
    # Context
    system_prompt = Column(Text) # The "Brain" context
    
    # Stores the full conversation [{"role": "user", "content": "..."}, ...]
    transcript = Column(JSON, nullable=True) 

    status = Column(
        SQLEnum(SessionStatus, name="session_status_enum"),
        default=SessionStatus.ACTIVE,
        nullable=False,
    )
    
    # Meta
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)

    report = relationship(
        "InterviewReport",
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan"
    )