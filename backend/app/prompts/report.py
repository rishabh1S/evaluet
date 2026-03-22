from app.models.interview_sessions import InterviewSession

def build_report_prompt(session: InterviewSession, transcript_text: str, evaluation_prompt: str) -> str:
    """
    Robust report-generation prompt.
    Designed to NEVER break JSON parsing.
    """

    return f"""
    {evaluation_prompt}
    ═══════════════════════════════════════════════════════════
    INTERVIEW CONTEXT
    ═══════════════════════════════════════════════════════════
    Role: {session.job_role}
    Level: {session.candidate_level}

    ═══════════════════════════════════════════════════════════
    TRANSCRIPT (VERBATIM)
    ═══════════════════════════════════════════════════════════
    {transcript_text}

    TASK:
    Generate a structured hiring evaluation based ONLY on the transcript.
    Do NOT invent information.
    If something is unclear, state it explicitly.

    ═══════════════════════════════════════════════════════════
    OUTPUT REQUIREMENTS (CRITICAL)
    ═══════════════════════════════════════════════════════════
    - Return ONLY a valid JSON object.
    - DO NOT escape single quotes (e.g., use "candidate's" NOT "candidate\\'s").
    - Do NOT insert standalone punctuation or filler lines.
    - Use double quotes for JSON keys and string values.
    - NO explanations outside JSON.

    ═══════════════════════════════════════════════════════════
    SCORING CRITERIA
    ═══════════════════════════════════════════════════════════
    Rate each skill on a scale of 0 to 100:
    - technical_knowledge: Depth and accuracy of domain/technical answers.
    - communication: Clarity, structure, and articulation of responses.
    - problem_solving: Analytical thinking, approach to challenges, and reasoning.
    - confidence: Poise, decisiveness, and composure under pressure.

    ═══════════════════════════════════════════════════════════
    REPORT FIELDS (MANDATORY)
    ═══════════════════════════════════════════════════════════
    1. skill_scores: Individual scores (0-100) for each of the 4 skills above.
    2. strengths: 2-4 bullet points highlighting what the candidate did well.
    3. improvements: 2-4 bullet points on areas the candidate should work on.
    4. hiring_decision: Exactly one of "Strong Hire", "Hire", "Maybe", "No Hire".
    5. final_verdict: A 2-4 sentence summary explaining the hiring decision with specific evidence from the interview.

    Do NOT add extra fields. Do NOT add filler lines.

    JSON STRUCTURE (MANDATORY):
    {{
      "skill_scores": {{
        "technical_knowledge": <integer 0-100>,
        "communication": <integer 0-100>,
        "problem_solving": <integer 0-100>,
        "confidence": <integer 0-100>
      }},
      "strengths": ["<point 1>", "<point 2>"],
      "improvements": ["<point 1>", "<point 2>"],
      "hiring_decision": "<Strong Hire | Hire | Maybe | No Hire>",
      "final_verdict": "<2-4 sentence summary>"
    }}
    """
