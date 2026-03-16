AI Resume Intelligence System

An AI-powered recruitment platform that analyzes resumes, predicts job roles, evaluates ATS compatibility using LLMs, and matches candidates with job descriptions.The system helps job seekers improve their resumes and enables HR teams to quickly identify the best candidates using machine learning and NLP techniques.

->Features

User Features:
        Upload resume in PDF format
        Predict job role based on resume content
        ATS resume analysis using LLM
        Get feedback including:
                ATS score
                detected skills
                missing industry skills
                strengths
                weaknesses
                resume improvement suggestions

HR Features:
        Enter job description
        Automatically match resumes with JD
        View top ranked candidates
        Candidate ranking based on:
                TF-IDF similarity
                semantic embeddings
                skill overlap

Security Features:
        User and HR authentication system
        Password hashing using bcrypt
        Resume upload file validation
        Environment variable protection using .env

->Tech Stack
Backend:
        FastAPI
        Python 3.10

Machine Learning / NLP:
        Sentence Transformers
        Scikit-learn
        TF-IDF Vectorization
        Cosine Similarity

LLM Integration:
        Groq API (Llama models)

Database:
        MySQL
        
Resume Parsing:
        PyMuPDF

Frontend:
        HTML
        CSS
        JavaScript
        
->System Architecture: 

User / HR Dashboard
        │
        ▼
Frontend (HTML + JS)
        │
        ▼
FastAPI Backend
        │
        ├── Resume Upload
        ├── ATS Analysis (LLM)
        ├── Job Role Prediction
        └── Resume-JD Matching
        │
        ▼
Machine Learning Models
        │
        ▼
MySQL Database

->Project Structure:
AI-Resume-Intelligence-System
│
├── Backend
│   └── api.py
│
├── database
│   └── mysql_db.py
│
├── utils
│   ├── auth.py
│   ├── pdf_parser.py
│   └── skill_extractor.py
│
├── static
│   ├── login.html
│   ├── signup.html
│   ├── dashboard_user.html
│   ├── dashboard_hr.html
│   ├── login.css
│   ├── signup.css
│   ├── user_dashboard.css
│   ├── hr_dashboard.css
│   └── script.js
│
├── ats_genai_score.py
├── hr_match.py
├── main.py
├── config.py
├── requirements.txt
└── README.md


->Usage
User Workflow:
        1.Create an account or login
        2.Upload resume
        3.Predict job role
        4.Check ATS score and improvement suggestions

HR Workflow:
        1.Login as HR
        2.Enter job description
        3.View top matching candidates

Future Improvements:
        Resume vector search using embeddings
        Candidate analytics dashboard
        Resume improvement suggestions using LLM
        Resume version tracking
        JWT authentication
        Docker deployment
