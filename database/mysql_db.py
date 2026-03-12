import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# =========================
# CONNECT DATABASE
# =========================

def connect_db():
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", 3306))
    )
    return connection


# =========================
# INSERT CANDIDATE
# =========================

def insert_candidate(name, email, resume_text):

    conn = connect_db()
    cursor = conn.cursor()

    query = """
    INSERT INTO candidates (name,email,resume_text)
    VALUES (%s,%s,%s)
    """

    cursor.execute(query, (name, email, resume_text))

    conn.commit()

    cursor.close()
    conn.close()


# =========================
# FETCH RESUMES
# =========================

def fetch_resumes():

    conn = connect_db()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT id,name,email,resume_text FROM candidates"

    cursor.execute(query)

    resumes = cursor.fetchall()

    cursor.close()
    conn.close()

    return resumes


# ======================================================
# USER AUTHENTICATION FUNCTIONS
# ======================================================

def create_user(email, password_hash):

    conn = connect_db()
    cursor = conn.cursor()

    query = """
    INSERT INTO users (email, password_hash)
    VALUES (%s,%s)
    """

    cursor.execute(query, (email, password_hash))

    conn.commit()

    cursor.close()
    conn.close()


def get_user(email):

    conn = connect_db()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT * FROM users WHERE email=%s"

    cursor.execute(query, (email,))

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    return user


# ======================================================
# HR AUTHENTICATION FUNCTIONS
# ======================================================

def create_hr(email, password_hash):

    conn = connect_db()
    cursor = conn.cursor()

    query = """
    INSERT INTO hr_admins (email, password_hash)
    VALUES (%s,%s)
    """

    cursor.execute(query, (email, password_hash))

    conn.commit()

    cursor.close()
    conn.close()


def get_hr(email):

    conn = connect_db()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT * FROM hr_admins WHERE email=%s"

    cursor.execute(query, (email,))

    hr = cursor.fetchone()

    cursor.close()
    conn.close()

    return hr