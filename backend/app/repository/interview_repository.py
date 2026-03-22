from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.interview_sessions import InterviewSession
from app.models.session_status import SessionStatus

def load_session(db: Session, session_id: str):
    session = (
        db.query(InterviewSession)
        .filter(InterviewSession.session_id == session_id)
        .first()
    )
    return session

def persist_session(db: Session, session_id: str, history: list):
    session = (
        db.query(InterviewSession)
        .filter(InterviewSession.session_id == session_id)
        .first()
    )
    if not session:
        return False

    clean = [m for m in history if m["role"] in ("user", "assistant")]
    session.transcript = clean
    session.status = SessionStatus.PENDING_REPORT
    session.ended_at = datetime.now(timezone.utc)
    db.commit()
    return True
