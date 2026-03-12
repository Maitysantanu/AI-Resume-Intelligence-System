from groq import Groq
import os
import sys
from dotenv import load_dotenv
from utils.pdf_parser import extract_text_from_pdf

# Load API key
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("ERROR: GROQ_API_KEY not found in environment variables")
    exit()

client = Groq(api_key=api_key)

# -----------------------------
# Get resume path from backend
# -----------------------------
if len(sys.argv) < 2:
    print("ERROR: Resume path not provided")
    exit()

resume_path = sys.argv[1]

# -----------------------------
# Check file exists
# -----------------------------
if not os.path.exists(resume_path):
    print(f"ERROR: Resume file not found -> {resume_path}")
    exit()

try:

    # Extract resume text
    resume_text = extract_text_from_pdf(resume_path)

    if not resume_text or not resume_text.strip():
        print("ERROR: Resume text could not be extracted")
        exit()

    # Limit size for safety
    resume_text = resume_text[:12000]

    prompt = f"""
You are an advanced Applicant Tracking System (ATS) used by top tech companies 
like Google, Microsoft, and Amazon.

Your task is to evaluate the following resume exactly like a real ATS system 
combined with a recruiter review.

You must analyze the resume based on these criteria:

1. Technical Skills relevance
2. Keyword matching for modern job roles
3. Project quality and technical depth
4. Measurable achievements
5. Resume formatting and ATS readability
6. Industry skill coverage

Be strict and realistic like a real recruiter.

Return your response ONLY in the following format:

ATS_SCORE:
A score between 0 and 100 representing how well this resume would pass an ATS system.

IMPORTANT_SKILLS_DETECTED:
List the most important technical skills detected in the resume.

MISSING_INDUSTRY_SKILLS:
List key industry skills that are commonly expected but missing.

STRENGTHS:
List strong aspects of the resume such as projects, tools, achievements, impact.

WEAKNESSES:
List problems such as missing keywords, vague bullet points, poor metrics, etc.

FORMATTING_FEEDBACK:
Evaluate the formatting for ATS readability (sections, bullet points, structure).

RESUME_IMPROVEMENT_SUGGESTIONS:
Provide clear actionable suggestions to improve the ATS score.

REWRITTEN_BULLET_POINTS:
Rewrite 3 weak resume bullet points into strong action-oriented bullet points 
with measurable impact.

Important Rules:
- Be strict and realistic.
- Do not hallucinate skills not present in the resume.
- Keep each section concise and professional.
- Follow the exact structure above.

Resume Content:
{resume_text}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    result = response.choices[0].message.content

    # Return clean output for FastAPI
    print(result)

except Exception as e:
    print(f"ERROR: {str(e)}")