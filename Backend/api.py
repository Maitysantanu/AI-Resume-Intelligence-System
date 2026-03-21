from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException
import shutil
import subprocess
import sys
import os
import json
import re
import uuid

from utils.auth import hash_password, verify_password
from database.mysql_db import create_user, create_hr, get_user, get_hr


ADMIN_KEY = "HR2026ADMIN"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

app = FastAPI()


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Path Setup

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ATS_SCRIPT = os.path.join(BASE_DIR, "ats_genai_score.py")
ROLE_SCRIPT = os.path.join(BASE_DIR, "main.py")
JD_SCRIPT = os.path.join(BASE_DIR, "hr_match.py")

RESUME_FOLDER = os.path.join(BASE_DIR, "resumefile")
STATIC_FOLDER = os.path.join(BASE_DIR, "static")

# Persistent resume path tracker
RESUME_TRACKER = os.path.join(BASE_DIR, "current_resume.txt")

# -----------------------------
# Serve static files
# -----------------------------

# ADD COMPARE ROUTE BEFORE THE MOUNT ↓
@app.get("/compare")
def compare_page():
    return FileResponse(os.path.join(STATIC_FOLDER, "compare.html"))


# Serve static file
app.mount("/static", StaticFiles(directory=STATIC_FOLDER), name="static")


@app.get("/debug")
def debug():
    return {
        "BASE_DIR": BASE_DIR,
        "RESUME_FOLDER": RESUME_FOLDER,
        "RESUME_TRACKER": RESUME_TRACKER,
        "tracker_exists": os.path.exists(RESUME_TRACKER),
        "tracker_content": open(RESUME_TRACKER).read() if os.path.exists(RESUME_TRACKER) else "not found"
    }


# -----------------------------
# Helper: Get current resume path
# -----------------------------
def get_current_resume():
    if not os.path.exists(RESUME_TRACKER):
        return None
    with open(RESUME_TRACKER, "r") as f:
        path = f.read().strip()
    if not os.path.exists(path):
        return None
    return path


# -----------------------------
# Landing Page
# -----------------------------
# Landing page
@app.get("/")
def home():
    return FileResponse(os.path.join(STATIC_FOLDER, "landing.html"))


# Login page
@app.get("/login")
def login_page():
    return FileResponse(os.path.join(STATIC_FOLDER, "login.html"))


@app.get("/signup")
def signup_page():
    return FileResponse(os.path.join(STATIC_FOLDER, "signup.html"))


@app.get("/dashboard-user")
def dashboard_user():
    return FileResponse(os.path.join(STATIC_FOLDER, "dashboard_user.html"))


@app.get("/dashboard-hr")
def dashboard_hr():
    return FileResponse(os.path.join(STATIC_FOLDER, "dashboard_hr.html"))



# Upload Resume

@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...)):

    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    contents = await file.read()

    # Validate file size
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB")

    os.makedirs(RESUME_FOLDER, exist_ok=True)

    # Generate safe random filename
    safe_filename = f"{uuid.uuid4()}.pdf"
    save_path = os.path.join(RESUME_FOLDER, safe_filename)

    # Save file
    with open(save_path, "wb") as f:
        f.write(contents)

    # Persist resume path so it survives server restarts
    with open(RESUME_TRACKER, "w") as f:
        f.write(save_path)

    return {
        "message": "Resume uploaded successfully",
        "filename": safe_filename
    }


# -----------------------------
# Predict Job Role

@app.get("/predict-role/")
async def predict_role():

    resume_path = get_current_resume()

    if resume_path is None:
        return {"error": "Please upload a resume first"}

    process = subprocess.run(
        [sys.executable, ROLE_SCRIPT, resume_path],
        capture_output=True,
        text=True,
        encoding="utf-8"
    )

    if process.stderr:
        return {"error": process.stderr}

    try:
        result = json.loads(process.stdout)
        return result
    except Exception:
        return {
            "error": "Invalid JSON from model",
            "stdout": process.stdout,
            "stderr": process.stderr
        }


# -----------------------------
# ATS Score

@app.get("/ats-score/")
async def ats_score():

    resume_path = get_current_resume()

    if resume_path is None:
        return {"error": "Please upload a resume first"}

    process = subprocess.run(
        [sys.executable, ATS_SCRIPT, resume_path],
        capture_output=True,
        text=True,
        encoding="utf-8"
    )

    output = process.stdout.strip()

    # Extract ATS score from output
    score = 0
    lines = output.splitlines()
    for i, line in enumerate(lines):
        # Match "ATS_SCORE: 85" on same line
        match = re.search(r"ATS_SCORE\s*:\s*(\d+)", line, re.IGNORECASE)
        if match:
            score = int(match.group(1))
            break
        # Match "ATS_SCORE:" on one line, number on next line
        if "ATS_SCORE" in line.upper() and i + 1 < len(lines):
            next_line = lines[i + 1].strip()
            if next_line.isdigit():
                score = int(next_line)
                break

    return {
        "score": score,
        "result": output,
        "stderr": process.stderr  # keep for debugging, remove later
    }



# JD Matching (HR)

@app.post("/jd-match/")
async def jd_match(jd: str = Form(...)):

    try:
        process = subprocess.Popen(
            [sys.executable, JD_SCRIPT],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8"
        )

        output, error = process.communicate(jd)

        if process.returncode != 0:
            return {
                "error": "Script execution failed",
                "details": error.strip()
            }

        output = output.strip()

        if not output:
            return {"error": "Empty response from matching engine"}

        try:
            candidates = json.loads(output)
        except json.JSONDecodeError:
            return {
                "error": "Invalid JSON from matching engine",
                "raw_output": output
            }

        return {"candidates": candidates}

    except Exception as e:
        return {"error": str(e)}


# =========================
# VALIDATION FUNCTIONS
# =========================
# USER AUTHENTICATION


def validate_email(email: str):
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email)

def validate_password(password: str):
    return len(password) >= 6


# =====================================================
# UNIFIED AUTH
# =====================================================
@app.post("/signup-user/")
async def signup_user(email: str = Form(...), password: str = Form(...)):

    email = email.strip().lower()
    password = password.strip()

    if not validate_email(email):
        return {"error": "Invalid email format"}

    if not validate_password(password):
        return {"error": "Password must be at least 6 characters"}

    if get_user(email):
        return {"error": "User already exists"}

    password_hash = hash_password(password)
    create_user(email, password_hash)

    return {"message": "User registered successfully"}


@app.post("/login-user/")
async def login_user(email: str = Form(...), password: str = Form(...)):

    email = email.strip().lower()
    password = password.strip()

    user = get_user(email)

    if not user:
        return {"error": "User not found"}

    if not verify_password(password, user["password_hash"]):
        return {"error": "Incorrect password"}

    return {"role": "user"}


@app.post("/signup-hr/")
async def signup_hr(email: str = Form(...), password: str = Form(...)):

    email = email.strip().lower()
    password = password.strip()

    if not validate_email(email):
        return {"error": "Invalid email format"}

    if not validate_password(password):
        return {"error": "Password must be at least 6 characters"}

    if get_hr(email):
        return {"error": "HR already exists"}

    password_hash = hash_password(password)
    create_hr(email, password_hash)

    return {"message": "HR registered successfully"}


@app.post("/login-hr/")
async def login_hr(
    email: str = Form(...),
    password: str = Form(...),
    admin_key: str = Form(...)
):

    email = email.strip().lower()
    password = password.strip()

    if admin_key != ADMIN_KEY:
        return {"error": "Invalid admin key"}

    hr = get_hr(email)

    if not hr:
        return {"error": "HR not found"}

    if not verify_password(password, hr["password_hash"]):
        return {"error": "Incorrect password"}

    return {"role": "hr"}




# -----------------------------
# favicon fix
# -----------------------------
@app.get("/favicon.ico")
async def favicon():
    return FileResponse(os.path.join(STATIC_FOLDER, "favicon.ico"))