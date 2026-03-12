import sys
import json
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

import config

from database.mysql_db import fetch_resumes
from utils.skill_extractor import load_all_skills, extract_skills, skill_overlap_score


embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
# ----------------------------
# RECEIVE JD FROM BACKEND (stdin)
# ----------------------------
job_description = sys.stdin.read().strip().encode("utf-8", "ignore").decode("utf-8")

if not job_description:
    print("ERROR: No Job Description received")
    sys.exit()


# ----------------------------
# LOAD SKILLS DATABASE
# ----------------------------
with open(config.JOB_SKILL_JSON) as f:
    role_data = json.load(f)

ALL_SKILLS = load_all_skills(role_data)


# ----------------------------
# EXTRACT JD SKILLS
# ----------------------------
jd_skills = extract_skills(job_description, ALL_SKILLS)


# ----------------------------
# FETCH RESUMES FROM DATABASE
# ----------------------------
resumes = fetch_resumes()

if len(resumes) == 0:
    print("No resumes found in database")
    sys.exit()


resume_texts = [r["resume_text"] for r in resumes]


# ----------------------------
# TF-IDF SIMILARITY
# ----------------------------
corpus = resume_texts + [job_description]

vectorizer = TfidfVectorizer(
    ngram_range=(1,2),
    stop_words="english",
    max_df=0.85,
    sublinear_tf=True
)

tfidf_matrix = vectorizer.fit_transform(corpus)

resume_vectors = tfidf_matrix[:-1]
jd_vector = tfidf_matrix[-1]

tfidf_scores = cosine_similarity(jd_vector, resume_vectors)


# ----------------------------
# SEMANTIC SIMILARITY
# ----------------------------


resume_embeddings = embedding_model.encode(resume_texts)

jd_embedding = embedding_model.encode([job_description])

semantic_scores = cosine_similarity(jd_embedding, resume_embeddings)


# ----------------------------
# FINAL SCORE
# ----------------------------
final_scores = []

for i in range(len(resumes)):

    resume_skills = extract_skills(resume_texts[i], ALL_SKILLS)

    overlap = skill_overlap_score(resume_skills, jd_skills)

    tfidf_score = tfidf_scores[0][i]
    semantic_score = semantic_scores[0][i]

    final_score = (
        0.4 * tfidf_score +
        0.4 * semantic_score +
        0.2 * overlap
    )

    final_scores.append(final_score)


# ----------------------------
# TOP MATCHING CANDIDATES
# ----------------------------
top_indices = np.argsort(final_scores)[::-1][:3]





results = []

for idx in top_indices:
    candidate = resumes[idx]
    score = round(final_scores[idx] * 100, 2)

    results.append({
        "name": candidate["name"],
        "email": candidate["email"],
        "score": score
    })

print(json.dumps(results))