# AI Resume Intelligence System

An **AI-powered recruitment platform** that analyzes resumes, predicts job roles, evaluates ATS compatibility using LLMs, and matches candidates with job descriptions.

The system helps **job seekers improve their resumes** and enables **HR teams to quickly identify the best candidates** using **machine learning and NLP techniques**.

---

# Features

## User Features
- Upload resume in **PDF format**
- Predict **job role** based on resume content
- Perform **ATS resume analysis using LLM**
- Get detailed feedback including:
  - ATS score
  - Detected skills
  - Missing industry skills
  - Strengths
  - Weaknesses
  - Resume improvement suggestions

##  ATS Improvement Dashboard
A powerful feature to **track resume improvement over time**.

###  What it does:
- Upload **improved resume**
- Compare **old vs new ATS score**
- Visualize **score improvement**
- Identify:
  - Skills added  
  - Skills still missing  

###  Highlights:
- Dynamic **score comparison cards**
- Animated **progress bars**
- Smart **skill gap analysis**
- Clean, modern UI with responsive design

## HR Features
- Enter **job description**
- Automatically **match resumes with job description**
- View **top ranked candidates**

Candidate ranking based on:
- TF-IDF similarity
- Semantic embeddings
- Skill overlap

## Security Features
- User and HR **authentication system**
- **Password hashing using bcrypt**
- Resume upload **file validation**
- **Environment variable protection using `.env`**

---

# Tech Stack

## Backend
- FastAPI  
- Python 3.10  

## Machine Learning / NLP
- Sentence Transformers  
- Scikit-learn  
- TF-IDF Vectorization  
- Cosine Similarity  

## LLM Integration
- Groq API (Llama models)

## Database
- MySQL

## Resume Parsing
- PyMuPDF

## Frontend
- HTML  
- CSS  
- JavaScript  

---

# System Architecture
## System Architecture

```
User / HR Dashboard
        │
        ▼
Frontend (HTML + JavaScript)
        │
        ▼
FastAPI Backend
        │
        ├── Resume Upload Module
        │
        ├── ATS Resume Analysis (LLM - Groq API)
        │
        ├── Job Role Prediction Model
        │
        └── Resume – Job Description Matching
                │
                ├── TF-IDF Similarity
                ├── Semantic Embeddings
                └── Skill Overlap Analysis
        │
        ▼
Machine Learning Models
        │
        ▼
MySQL Database
```

---
# Project Structure
```
AI-Resume-Intelligence-System
│
├── Backend
│ └── api.py
│
├── database
│ └── mysql_db.py
│
├── utils
│ ├── auth.py
│ ├── pdf_parser.py
│ └── skill_extractor.py
│
├── static
│ ├── login.html
│ ├── signup.html
│ ├── dashboard_user.html
│ ├── dashboard_hr.html
│ ├── compare.html # NEW
│ ├── login.css
│ ├── signup.css
│ ├── user_dashboard.css
│ ├── hr_dashboard.css
│ ├── compare.css 
│ └── script.js 
│
├── ats_genai_score.py
├── hr_match.py
├── main.py
├── config.py
├── requirements.txt
└── README.md
```
---
## Usage

### User Workflow
1. Create an account or login  
2. Upload resume  
3. Predict job role  
4. Check ATS score and improvement suggestions
5. Upload Improved Resume → View Comparison Dashboard

### HR Workflow
1. Login as HR  
2. Enter job description  
3. View top matching candidates  

---

## Future Improvements
- Resume vector search using embeddings
- Candidate analytics dashboard
- Resume improvement suggestions using LLM
- Resume version tracking
- JWT authentication
- Docker deployment

---

# Installation

### 1 Clone the repository

```bash
git clone https://github.com/yourusername/AI-Resume-Intelligence-System.git
```
### 2 Navigate to project directory

```bash
cd AI-Resume-Intelligence-System
```
### 3 Create virtual environment

```bash
python -m venv venv
```
### 4 Activate virtual environment
Windows:
```bash
venv\Scripts\activate
```
Linux / Mac:
```bash
source venv/bin/activate
```
### 5 Install dependencies
```bash
pip install -r requirements.txt
```
### 6 Configure environment variables
Create a .env file and add your API keys and database credentials.
Example:
```bash
GROQ_API_KEY=your_api_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=resume_ai
```
### 7 Run the application
```bash
uvicorn main:app --reload
```
Open in browser:
http://127.0.0.1:8000

