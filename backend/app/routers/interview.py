import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy import desc, func
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.interview_sessions import InterviewSession
from app.models.interview_reports import InterviewReport
from app.services.pdf_service import extract_text_from_pdf
from app.models.users import User
from app.auth.dependencies import get_current_user_id
from app.models.interviewer_character import InterviewerCharacter
from app.models.dto.interviewer import InterviewerPublicDTO
from app.prompts.interviewer import build_system_prompt

router = APIRouter()

@router.get("/all_interviewers", response_model=List[InterviewerPublicDTO])
async def get_all_interviewers(db: Session = Depends(get_db)):
    rows = (db.query(
            InterviewerCharacter.id,
            InterviewerCharacter.name,
            InterviewerCharacter.description,
            InterviewerCharacter.profile_image_url,
            InterviewerCharacter.idle_video_url,
            InterviewerCharacter.talking_video_url,
            InterviewerCharacter.focus_areas,
        ).filter(InterviewerCharacter.is_active == True)
        .all()
    )

    return [
        InterviewerPublicDTO(
            id=row.id,
            name=row.name,
            description=row.description,
            profile_image_url=row.profile_image_url,
            idle_video_url=row.idle_video_url,
            talking_video_url=row.talking_video_url,
            focus_areas=row.focus_areas,
        )
        for row in rows
    ]


@router.post("/init")
async def init_interview(
    resume: UploadFile = File(...),
    job_desc: str = Form(...),
    job_level: str = Form(...),
    job_role: str = Form(...),
    interviewer_id: str = Form(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # 1. Read and Parse PDF
    try:
        content = await resume.read()
        resume_text = extract_text_from_pdf(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading PDF: {str(e)}")
    
    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")
    
    # Fetch Interviewer Character
    interviewer = (
        db.query(InterviewerCharacter)
        .filter(
        InterviewerCharacter.id == interviewer_id,
        InterviewerCharacter.is_active == True
        ).first()
    )

    if not interviewer:
        raise HTTPException(status_code=404, detail="Interviewer not found")

    # 2. Construct the System Prompt (The "Brain")
    # This guides the AI on how to behave during the WebSocket session
    system_prompt = build_system_prompt(
        character_prompt=interviewer.behavior_prompt,
        resume_text=resume_text,
        job_desc=job_desc,
        job_level=job_level,
        job_role=job_role
    )

    # User validation
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 3. Save Session to DB
    session_id = str(uuid.uuid4())

    new_session = InterviewSession(
        session_id=session_id,
        user_id=user_id,
        job_role=job_role,
        job_description=job_desc,
        candidate_level=job_level,
        system_prompt=system_prompt,
        interviewer_id=interviewer.id,
        voice_model=interviewer.voice_model,
    )
    
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "session_id": session_id,
        "message": "Interview initialized successfully",
        "ws_url": f"/ws/interview/{session_id}"
    }


@router.get("/history")
async def get_interview_history(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(
            InterviewSession.session_id,
            InterviewSession.job_role,
            InterviewSession.candidate_level,
            InterviewSession.status,
            InterviewSession.created_at,
            InterviewerCharacter.name.label("interviewer_name"),
            InterviewerCharacter.profile_image_url.label("interviewer_image"),
        )
        .join(
            InterviewerCharacter,
            InterviewSession.interviewer_id == InterviewerCharacter.id,
            isouter=True,
        )
        .filter(InterviewSession.user_id == user_id)
        .order_by(desc(InterviewSession.created_at))
        .limit(20)
        .all()
    )

    return [
        {
            "session_id": s.session_id,
            "job_role": s.job_role,
            "candidate_level": s.candidate_level,
            "status": s.status.value,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "interviewer_name": s.interviewer_name,
            "interviewer_image": s.interviewer_image,
        }
        for s in sessions
    ]


@router.get("/stats")
def get_user_stats(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    # ── User avg score ──
    user_avg_row = (
        db.query(func.avg(InterviewReport.score))
        .join(InterviewSession, InterviewReport.session_id == InterviewSession.session_id)
        .filter(InterviewSession.user_id == user_id)
        .scalar()
    )
    user_avg = round(float(user_avg_row or 0), 1)

    # ── Global avg score (all users) ──
    global_avg_row = db.query(func.avg(InterviewReport.score)).scalar()
    global_avg = float(global_avg_row or 0)

    # ── Score delta % vs global ──
    if global_avg > 0:
        delta_pct = round(((user_avg - global_avg) / global_avg) * 100, 1)
    else:
        delta_pct = 0.0

    # ── Practice time: lifetime total ──
    total_secs = (
        db.query(
            func.sum(
                func.extract("epoch", InterviewSession.ended_at - InterviewSession.created_at)
            )
        )
        .filter(
            InterviewSession.user_id == user_id,
            InterviewSession.ended_at.isnot(None),
        )
        .scalar()
    )
    total_hours = round((total_secs or 0) / 3600, 1)

    # ── Practice time: this calendar month ──
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_secs = (
        db.query(
            func.sum(
                func.extract("epoch", InterviewSession.ended_at - InterviewSession.created_at)
            )
        )
        .filter(
            InterviewSession.user_id == user_id,
            InterviewSession.ended_at.isnot(None),
            InterviewSession.created_at >= month_start,
        )
        .scalar()
    )
    month_hours = round((month_secs or 0) / 3600, 1)

    return {
        "score_avg": user_avg,
        "score_delta_pct": delta_pct,
        "practice_total_hours": total_hours,
        "practice_month_hours": month_hours,
    }