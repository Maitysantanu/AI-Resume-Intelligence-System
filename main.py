
import os
import sys
import json
import pickle
import pandas as pd
import numpy as np

from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

import config

from utils.pdf_parser import extract_text_from_pdf
from utils.contact_extractor import extract_email, extract_name
from utils.skill_extractor import load_all_skills, extract_skills, skill_overlap_score
from database.mysql_db import insert_candidate


# ============================
# PATH SETUP
# ============================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# ============================
# INPUT VALIDATION
# ============================

if len(sys.argv) < 2:
    print(json.dumps({"error": "Resume path not provided"}))
    sys.exit(1)

resume_path = sys.argv[1]

if not os.path.exists(resume_path):
    print(json.dumps({"error": "Resume file not found"}))
    sys.exit(1)


# ============================
# EXTRACT RESUME TEXT
# ============================

resume_text = extract_text_from_pdf(resume_path)

if not resume_text or not resume_text.strip():
    print(json.dumps({"error": "Could not extract resume text"}))
    sys.exit(1)


# ============================
# CONTACT INFORMATION
# ============================

name = extract_name(resume_text)
email = extract_email(resume_text)


# ============================
# SAVE TO DATABASE
# ============================

try:
    insert_candidate(name, email, resume_text)
except Exception:
    pass


# ============================
# LOAD DATA
# ============================

df = pd.read_csv(config.JOB_CSV_PATH)

with open(config.JOB_SKILL_JSON) as f:
    role_data = json.load(f)


# ============================
# LOAD MODELS
# ============================

with open(os.path.join(BASE_DIR, "model", "tfidf_vectorizer.pkl"), "rb") as f:
    vectorizer = pickle.load(f)

with open(os.path.join(BASE_DIR, "model", "job_vectors.pkl"), "rb") as f:
    job_vectors = pickle.load(f)

job_embeddings = np.load(os.path.join(BASE_DIR, "model", "job_embeddings.npy"))

embedding_model = SentenceTransformer("all-mpnet-base-v2", device="cpu")


# ============================
# SKILL EXTRACTION
# ============================

ALL_SKILLS = load_all_skills(role_data)

candidate_skills = extract_skills(resume_text, ALL_SKILLS)

candidate_text = " ".join(candidate_skills)

if candidate_text.strip() == "":
    print(json.dumps({"error": "No skills detected in resume"}))
    sys.exit(1)


# ============================
# TF-IDF SIMILARITY
# ============================

candidate_vector = vectorizer.transform([candidate_text])

tfidf_scores = cosine_similarity(candidate_vector, job_vectors)


# ============================
# SEMANTIC SIMILARITY
# ============================

candidate_embedding = embedding_model.encode([candidate_text])

semantic_scores = cosine_similarity(candidate_embedding, job_embeddings)


# ============================
# FINAL SCORING
# ============================

final_scores = []

for i in range(len(df)):

    role = df.iloc[i]["job_title"]
    required_skills = role_data[role]["required_skills"]

    overlap = skill_overlap_score(candidate_skills, required_skills)
    tfidf_score = tfidf_scores[0][i]
    semantic_score = semantic_scores[0][i]

    final_score = (
        0.4 * tfidf_score +
        0.4 * semantic_score +
        0.2 * overlap
    )

    final_scores.append(final_score)


# ============================
# AGGREGATE SCORES PER ROLE
# ============================

role_scores = {}

for i in range(len(df)):

    role = df.iloc[i]["job_title"]
    score = final_scores[i]

    if role not in role_scores:
        role_scores[role] = []

    role_scores[role].append(score)


aggregated_scores = {role: max(scores) for role, scores in role_scores.items()}

sorted_roles = sorted(
    aggregated_scores.items(),
    key=lambda x: x[1],
    reverse=True
)

top_roles = sorted_roles[:3]


# ============================
# BEST ROLE + MISSING SKILLS
# ============================

best_role = top_roles[0][0]

required_skills = role_data[best_role]["required_skills"]

missing_skills = list(set(required_skills) - set(candidate_skills))


# ============================
# JSON OUTPUT
# ============================

output = {
    "name": name,
    "email": email,
    "extracted_skills": candidate_skills,
    "predicted_roles": [
        {
            "role": role,
            "score": round(score * 100, 2)
        }
        for role, score in top_roles
    ],
    "best_role": best_role,
    "missing_skills": missing_skills
}

print(json.dumps(output))

