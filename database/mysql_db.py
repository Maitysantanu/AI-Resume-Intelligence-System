import mysql.connector
import config


# =========================
# CONNECT DATABASE
# =========================

def connect_db():

    conn = mysql.connector.connect(
        host=config.DB_HOST,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME
    )

    return conn


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

# --------------------------
# CREATE USER
# --------------------------

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


# --------------------------
# GET USER
# --------------------------

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

# --------------------------
# CREATE HR
# --------------------------

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


# --------------------------
# GET HR
# --------------------------

def get_hr(email):

    conn = connect_db()

    cursor = conn.cursor(dictionary=True)

    query = "SELECT * FROM hr_admins WHERE email=%s"

    cursor.execute(query, (email,))

    hr = cursor.fetchone()

    cursor.close()
    conn.close()

    return hr