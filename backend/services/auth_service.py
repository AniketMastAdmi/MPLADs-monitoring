import os
import json
import base64
import hmac
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.models.models import User

# Secret key for token signing
SECRET_KEY = os.getenv("MPLADS_AUTH_SECRET", "mplads-gov-secure-secret-token-key-2026")

ROLES = [
    "PUBLIC / CITIZEN",
    "DISTRICT OFFICER",
    "STATE ADMIN / NODAL OFFICER",
    "MINISTRY / SUPER ADMIN"
]

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000
    ).hex()
    return pw_hash, salt

def verify_password(password: str, pw_hash: str, salt: str) -> bool:
    expected_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(expected_hash, pw_hash)

def generate_session_token(payload: Dict[str, Any], expires_in_hours: int = 24) -> str:
    """Creates a cryptographically signed HMAC-SHA256 session token."""
    data = payload.copy()
    data["exp"] = (datetime.utcnow() + timedelta(hours=expires_in_hours)).isoformat()
    data["iat"] = datetime.utcnow().isoformat()
    
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(data).encode()).decode().rstrip("=")
    
    signature_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(SECRET_KEY.encode(), signature_input, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_session_token(token: str) -> Optional[Dict[str, Any]]:
    """Verifies HMAC signature and expiration of session token."""
    if not token or not isinstance(token, str):
        return None
    parts = token.strip().split(".")
    if len(parts) != 3:
        return None
    
    header_b64, payload_b64, sig_b64 = parts
    signature_input = f"{header_b64}.{payload_b64}".encode()
    expected_sig = hmac.new(SECRET_KEY.encode(), signature_input, hashlib.sha256).digest()
    expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
    
    if not hmac.compare_digest(expected_sig_b64, sig_b64):
        return None
    
    # Pad base64 if needed
    rem = len(payload_b64) % 4
    if rem:
        payload_b64 += "=" * (4 - rem)
        
    try:
        payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode())
        exp_str = payload.get("exp")
        if exp_str and datetime.fromisoformat(exp_str) < datetime.utcnow():
            return None
        return payload
    except Exception:
        return None

def seed_default_users(db: Session):
    """Provisions standard authenticated accounts for each role."""
    default_accounts = [
        {
            "username": "citizen",
            "password": "citizen123",
            "full_name": "Ramesh Kumar (Citizen / Resident)",
            "role": "PUBLIC / CITIZEN",
            "designation": "Verified Citizen",
            "state": "Uttar Pradesh",
            "district": "Varanasi"
        },
        {
            "username": "officer",
            "password": "officer123",
            "full_name": "Rajesh Varma, IAS",
            "role": "DISTRICT OFFICER",
            "designation": "District Nodal Officer (DRDA)",
            "state": "Uttar Pradesh",
            "district": "Varanasi"
        },
        {
            "username": "state_admin",
            "password": "admin123",
            "full_name": "Dr. Sunita Sen, IAS",
            "role": "STATE ADMIN / NODAL OFFICER",
            "designation": "Joint Secretary (Planning & MPLADS), UP",
            "state": "Uttar Pradesh",
            "district": None
        },
        {
            "username": "ministry_admin",
            "password": "super123",
            "full_name": "Ajay Sharma, ISS",
            "role": "MINISTRY / SUPER ADMIN",
            "designation": "Director (Data Informatics & Innovation Division), MoSPI",
            "state": None,
            "district": None
        }
    ]

    for acc in default_accounts:
        user = db.query(User).filter_by(username=acc["username"]).first()
        if not user:
            pw_hash, salt = hash_password(acc["password"])
            db.add(User(
                username=acc["username"],
                password_hash=pw_hash,
                salt=salt,
                full_name=acc["full_name"],
                role=acc["role"],
                designation=acc["designation"],
                state=acc["state"],
                district=acc["district"],
                is_active=True
            ))
    db.commit()
