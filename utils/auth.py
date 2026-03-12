from passlib.context import CryptContext


# ==========================================
# PASSWORD HASHING CONFIGURATION
# ==========================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ==========================================
# HASH PASSWORD
# ==========================================

def hash_password(password: str) -> str:
    """
    Convert a plain password into a secure bcrypt hash.
    bcrypt supports passwords up to 72 bytes only.
    """

    if not password:
        raise ValueError("Password cannot be empty")

    # bcrypt limitation protection
    safe_password = password[:72]

    try:
        return pwd_context.hash(safe_password)
    except Exception as e:
        raise RuntimeError(f"Password hashing failed: {str(e)}")


# ==========================================
# VERIFY PASSWORD
# ==========================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against the stored bcrypt hash.
    """

    if not plain_password or not hashed_password:
        return False

    safe_password = plain_password[:72]

    try:
        return pwd_context.verify(safe_password, hashed_password)
    except Exception:
        return False