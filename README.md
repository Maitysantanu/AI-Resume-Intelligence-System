AI Resume Intelligence System

An AI-powered recruitment platform that analyzes resumes, predicts job roles, evaluates ATS compatibility using LLMs, and matches candidates with job descriptions. This 
system helps job seekers improve their resumes and enables HR teams to quickly identify the best candidates.

Features

Resume Upload
Users can upload their resume in PDF format for automated analysis.
Job Role Prediction
The system predicts the most suitable job role for a candidate using machine learning.
ATS Resume Analysis

An AI model evaluates resumes like a real Applicant Tracking System (ATS) and provides:
ATS score
Skills detected
Missing industry skills
Strengths
Weaknesses
Resume improvement suggestions
Rewritten bullet points

HR Job Description Matching
HR users can enter a job description, and the system ranks the top matching candidates using:

TF-IDF similarity
Semantic embeddings
Skill overlap scoring

Authentication System
Separate login system for:
Users
HR/Admin

Tech Stack

Backend
FastAPI
Python 3.10

Machine Learning / NLP
Sentence Transformers
Scikit-learn
TF-IDF Vectorization
Cosine Similarity

LLM Integration
Groq API (Llama models)

Database
MySQL

Frontend
HTML
CSS
JavaScript

Resume Parsing
PyMuPDF

System Architecture:

User / HR Dashboard
        ↓
Frontend (HTML + JS)
        ↓
FastAPI Backend
        ↓
ML + NLP Services
    ├ ATS Scoring (LLM)
    ├ Job Role Prediction
    └ Resume-JD Matching
        ↓
MySQL Database
