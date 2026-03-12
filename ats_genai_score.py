import os
import sys
from groq import Groq
from dotenv import load_dotenv
from utils.pdf_parser import extract_text_from_pdf

# -----------------------------
# LOAD ENV VARIABLES
# -----------------------------
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("ERROR: GROQ_API_KEY not found in environment variables")
    sys.exit(1)

client = Groq(api_key=api_key)


# -----------------------------
# GET RESUME PATH FROM BACKEND
# -----------------------------
if len(sys.argv) < 2:
    print("ERROR: Resume path not provided")
    sys.exit(1)

resume_path = sys.argv[1]


# -----------------------------
# CHECK FILE EXISTS
# -----------------------------
if not os.path.exists(resume_path):
    print(f"ERROR: Resume file not found -> {resume_path}")
    sys.exit(1)


try:

    # -----------------------------
    # EXTRACT TEXT FROM PDF
    # -----------------------------
    resume_text = extract_text_from_pdf(resume_path)

    if not resume_text or not resume_text.strip():
        print("ERROR: Resume text could not be extracted")
        sys.exit(1)

    # Prevent extremely long prompts
    resume_text = resume_text[:12000]


    # -----------------------------
    # ATS ANALYSIS PROMPT
    # -----------------------------
    prompt = f"""
You are an advanced Applicant Tracking System (ATS) used by top tech companies.

Evaluate the resume like a real ATS combined with a recruiter review.

Evaluation Criteria:
1. Technical skills relevance
2. Keyword matching for modern software roles
3. Project quality and technical depth
4. Measurable achievements
5. Resume formatting and ATS readability
6. Industry skill coverage

Be strict and realistic.

Return ONLY in this structure:

ATS_SCORE:
(number between 0 and 100)

IMPORTANT_SKILLS_DETECTED:
(list)

MISSING_INDUSTRY_SKILLS:
(list)

STRENGTHS:
(list)

WEAKNESSES:
(list)

FORMATTING_FEEDBACK:
(text)

RESUME_IMPROVEMENT_SUGGESTIONS:
(list)

REWRITTEN_BULLET_POINTS:
(rewrite 3 weak bullet points with strong action verbs and metrics)

Resume:
{resume_text}
"""


    # -----------------------------
    # CALL GROQ MODEL
    # -----------------------------
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        max_tokens=1500,
        messages=[
            {
                "role": "system",
                "content": "You are a strict ATS resume evaluator."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )


    # -----------------------------
    # RETURN RESULT
    # -----------------------------
    result = response.choices[0].message.content.strip()

    print(result)


except Exception as e:
    print(f"ERROR: {str(e)}")