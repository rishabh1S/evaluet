from fastapi_mail import FastMail, MessageSchema, MessageType
from app.core.mail import email_conf

SKILL_LABELS = {
    "technical_knowledge": "Technical Knowledge",
    "communication": "Communication",
    "problem_solving": "Problem Solving",
    "confidence": "Confidence",
}

DECISION_COLORS = {
    "Strong Hire": "#22c55e",
    "Hire": "#3b82f6",
    "Maybe": "#f59e0b",
    "No Hire": "#ef4444",
}


class MailService:
    def __init__(self):
        self.fm = FastMail(email_conf)

    async def send_interview_report(
        self,
        recipient_email: str,
        job_role: str,
        score: int,
        skill_scores: dict,
        strengths: list[str],
        improvements: list[str],
        hiring_decision: str,
        final_verdict: str,
    ):
        subject = f"Your Interview Report - {job_role}"

        # Build skill rows
        skill_rows = ""
        for key, label in SKILL_LABELS.items():
            val = skill_scores.get(key, 0)
            skill_rows += f"""
            <tr>
                <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">{label}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-weight:600;">{val}/100</td>
            </tr>"""

        # Build strengths list
        strengths_html = "".join(f"<li style='margin-bottom:6px;'>{s}</li>" for s in strengths)

        # Build improvements list
        improvements_html = "".join(f"<li style='margin-bottom:6px;'>{s}</li>" for s in improvements)

        decision_color = DECISION_COLORS.get(hiring_decision, "#666")

        body = f"""
        <html>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Interview Performance Report</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">{job_role}</p>
            </div>

            <div style="padding: 32px; background: #ffffff;">
                <!-- Score -->
                <div style="text-align: center; margin-bottom: 28px;">
                    <div style="font-size: 48px; font-weight: 800; color: #6366f1;">{score}<span style="font-size: 20px; color: #999;">/100</span></div>
                    <div style="font-size: 12px; color: #999; letter-spacing: 2px; margin-top: 4px;">OVERALL SCORE</div>
                </div>

                <!-- Hiring Decision -->
                <div style="text-align: center; margin-bottom: 28px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 12px; color: #999; letter-spacing: 1px; margin-bottom: 6px;">HIRING DECISION</div>
                    <div style="font-size: 22px; font-weight: 700; color: {decision_color};">{hiring_decision}</div>
                </div>

                <!-- Skill Breakdown -->
                <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Skill Breakdown</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    {skill_rows}
                </table>

                <!-- Strengths -->
                <h3 style="color: #22c55e;">Strengths</h3>
                <ul style="padding-left: 20px; color: #555;">
                    {strengths_html}
                </ul>

                <!-- Areas for Improvement -->
                <h3 style="color: #f59e0b;">Areas for Improvement</h3>
                <ul style="padding-left: 20px; color: #555;">
                    {improvements_html}
                </ul>

                <!-- Final Verdict -->
                <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Final Verdict</h3>
                <p style="color: #555; line-height: 1.7;">{final_verdict}</p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
                <p style="font-size: 12px; color: #999; margin: 0;">
                    This report was generated automatically by Evaluet AI.
                </p>
            </div>
        </body>
        </html>
        """

        message = MessageSchema(
            subject=subject,
            recipients=[recipient_email],
            body=body,
            subtype=MessageType.html,
        )

        await self.fm.send_message(message)
