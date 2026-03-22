import asyncio
import dirtyjson
import re
from groq import Groq
from app.models.interview_sessions import InterviewSession
from app.db import SessionLocal
from app.config import settings
from app.prompts.report import build_report_prompt
from app.models.session_status import SessionStatus
from app.models.interview_reports import InterviewReport
from app.services.mail_service import MailService
from app.services.report_pdf_service import generate_report_pdf
from app.models.users import User
from app.models.interviewer_character import InterviewerCharacter

client = Groq(api_key=settings.GROQ_API_KEY)
mail_service = MailService()


def _clamp_score(val, low=0, high=100) -> int:
    try:
        return max(low, min(high, int(val)))
    except (TypeError, ValueError):
        return 50


async def generate_and_send_report(session_id: str):
    """
    Generates an interview report using LLM and sends it via email with PDF.
    """
    db = SessionLocal()
    try:
        # A. Fetch Session
        interview_session = db.query(InterviewSession).filter(InterviewSession.session_id == session_id).with_for_update().first()

        interviewer = db.query(InterviewerCharacter).filter(InterviewerCharacter.id == interview_session.interviewer_id).first()

        if not interview_session:
            print(f"No session found for {session_id}")
            return
        if interview_session.status in [SessionStatus.COMPLETED, SessionStatus.FAILED]:
            print(f"Session {session_id} already {interview_session.status.value}, skipping")
            return

        interview_report = db.query(InterviewReport).filter(InterviewReport.session_id == session_id).first()

        if not interview_report:
            interview_report = InterviewReport(session_id=session_id)
            db.add(interview_report)
            db.flush()

        # 1. Sanitize Transcript
        clean_transcript = []
        if isinstance(interview_session.transcript, list):
            for msg in interview_session.transcript:
                content = msg.get("content", "")
                role = msg.get("role", "unknown")
                if content and content.strip() and role in ["user", "assistant"]:
                    speaker = "INTERVIEWER" if role == "assistant" else "CANDIDATE"
                    clean_transcript.append(f"{speaker}: {content.strip()}")

        transcript_text = "\n\n".join(clean_transcript)

        # 2. VALIDATION CHECK
        if not transcript_text.strip():
            print(f"Empty transcript after cleaning for {session_id}")
            interview_session.status = SessionStatus.FAILED
            db.commit()
            return

        if len(clean_transcript) < 3:
            print(f"Very short transcript ({len(clean_transcript)} messages) for {session_id}")

        # 3. Generate Feedback
        print(f"Generating report for {session_id}")
        print(f"Transcript: {len(transcript_text)} chars, {len(clean_transcript)} messages")

        report_prompt = build_report_prompt(
            session=interview_session,
            transcript_text=transcript_text,
            evaluation_prompt=interviewer.evaluation_prompt
        )

        # 4. Call LLM to generate report
        try:
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{
                    "role": "system",
                    "content": (
                        "You are a JSON generator. "
                        "You must output STRICT JSON only. "
                        "No prose, no markdown, no explanations."
                    )
                },{
                    "role": "user",
                    "content": report_prompt
                }
                ],
                temperature=0.2
            )
            raw_response = completion.choices[0].message.content
        except Exception as e:
            print(f"Groq API error: {e}")
            interview_session.status = SessionStatus.FAILED
            db.commit()
            return

        # 5. Parse JSON response
        parsed_data = parse_llm_json(raw_response)

        if not parsed_data:
            print(f"Failed to parse LLM response for {session_id}")
            interview_session.status = SessionStatus.FAILED
            db.commit()
            return

        # 6. Extract structured data
        skill_scores_raw = parsed_data.get("skill_scores", {})
        skill_scores = {
            "technical_knowledge": _clamp_score(skill_scores_raw.get("technical_knowledge", 50)),
            "communication": _clamp_score(skill_scores_raw.get("communication", 50)),
            "problem_solving": _clamp_score(skill_scores_raw.get("problem_solving", 50)),
            "confidence": _clamp_score(skill_scores_raw.get("confidence", 50)),
        }

        # Compute weighted overall score
        overall_score = round(
            skill_scores["technical_knowledge"] * 0.4
            + skill_scores["communication"] * 0.2
            + skill_scores["problem_solving"] * 0.3
            + skill_scores["confidence"] * 0.1
        )

        strengths = parsed_data.get("strengths", [])
        improvements = parsed_data.get("improvements", [])
        hiring_decision = parsed_data.get("hiring_decision", "Maybe")
        final_verdict = parsed_data.get("final_verdict", "")

        # Validate hiring_decision
        valid_decisions = {"Strong Hire", "Hire", "Maybe", "No Hire"}
        if hiring_decision not in valid_decisions:
            hiring_decision = "Maybe"

        # C. Save to DB
        try:
            interview_report.score = overall_score
            interview_report.skill_scores = skill_scores
            interview_report.strengths = strengths if isinstance(strengths, list) else []
            interview_report.improvements = improvements if isinstance(improvements, list) else []
            interview_report.hiring_decision = hiring_decision
            interview_report.final_verdict = final_verdict
            interview_session.status = SessionStatus.COMPLETED
            db.commit()
            print(f"Report saved successfully for {session_id}")
        except Exception as e:
            print(f"Database error while saving report: {e}")
            db.rollback()
            interview_session.status = SessionStatus.FAILED
            db.commit()
            raise

        # D. Generate PDF
        interviewer_name = interviewer.name if interviewer else "AI Interviewer"
        created_at_str = interview_session.created_at.strftime("%B %d, %Y") if interview_session.created_at else ""

        try:
            pdf_path = await asyncio.to_thread(
                generate_report_pdf,
                session_id=session_id,
                score=overall_score,
                skill_scores=skill_scores,
                strengths=interview_report.strengths,
                improvements=interview_report.improvements,
                hiring_decision=hiring_decision,
                final_verdict=final_verdict,
                job_role=interview_session.job_role,
                candidate_level=interview_session.candidate_level,
                interviewer_name=interviewer_name,
                created_at=created_at_str,
            )
            print(f"PDF generated at {pdf_path}")
        except Exception as pdf_err:
            print(f"PDF generation failed (non-fatal): {pdf_err}")
            pdf_path = None

        # E. Send Email
        user = db.query(User).filter(User.user_id == interview_session.user_id).first()
        if user and user.email:
            try:
                await mail_service.send_interview_report(
                    recipient_email=user.email,
                    job_role=interview_session.job_role,
                    score=overall_score,
                    skill_scores=skill_scores,
                    strengths=interview_report.strengths,
                    improvements=interview_report.improvements,
                    hiring_decision=hiring_decision,
                    final_verdict=final_verdict,
                    pdf_path=pdf_path,
                )
                print(f"Email sent to {user.email}")
            except Exception as mail_err:
                print(f"Mail failed (non-fatal): {mail_err}")

    except Exception as e:
        print(f"Unexpected error generating report for {session_id}: {e}")
        db.rollback()
        try:
            if interview_session:
                interview_session.status = SessionStatus.FAILED
                db.commit()
        except:
            pass
    finally:
        db.close()
        print(f"Report generation completed for {session_id}")


def parse_llm_json(raw_content: str):
    """
    Uses dirtyjson to handle the 'almost-JSON' often returned by LLMs.
    """
    if not raw_content or not raw_content.strip():
        return None

    # 1. Remove markdown code fences
    text = raw_content.strip()
    text = re.sub(r"```(?:json|JSON)?\s*", "", text)
    text = re.sub(r"\s*```", "", text)

    try:
        # 2. dirtyjson handles invalid escapes like \' and missing trailing braces
        parsed = dirtyjson.loads(text)

        # dirtyjson might return a AttributedDict; convert to standard dict
        if hasattr(parsed, "to_dict"):
            return parsed.to_dict()
        return dict(parsed)
    except Exception as e:
        print(f"parse_llm_json: Final fallback failed: {e}")
        return None
