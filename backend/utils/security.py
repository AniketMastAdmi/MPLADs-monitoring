import os
import hashlib
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import Request, HTTPException, Security, status
from sqlalchemy.orm import Session
from backend.models.models import AuditLog

VALID_ROLES = [
    "Citizen",
    "District Officer",
    "State Admin",
    "Ministry Admin"
]

# Role mapping helper to support UI aliases
ROLE_ALIASES = {
    "citizen": "Citizen",
    "public": "Citizen",
    "honble mp": "Citizen",
    "mp": "Citizen",
    "district authority": "District Officer",
    "district officer": "District Officer",
    "ddo": "District Officer",
    "dm": "District Officer",
    "state admin": "State Admin",
    "state nodal authority": "State Admin",
    "state nodal officer": "State Admin",
    "ministry admin": "Ministry Admin",
    "diid admin": "Ministry Admin",
    "super admin": "Ministry Admin"
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

def normalize_role(raw_role: Optional[str]) -> str:
    if not raw_role:
        return "Citizen"
    return ROLE_ALIASES.get(raw_role.strip().lower(), "Citizen")

def get_current_user(request: Request) -> Dict[str, Any]:
    """
    Extracts authenticated user context from request headers.
    Enforces role authorization across backend endpoints.
    """
    raw_role = request.headers.get("X-User-Role", "Citizen")
    role = normalize_role(raw_role)
    username = request.headers.get("X-User-Name", f"{role.replace(' ', '')}_User")
    district = request.headers.get("X-User-District", "Varanasi")
    state = request.headers.get("X-User-State", "Uttar Pradesh")
    client_ip = request.client.host if request.client else "127.0.0.1"

    return {
        "username": username,
        "role": role,
        "district": district,
        "state": state,
        "ip_address": client_ip
    }

def require_roles(allowed_roles: List[str]):
    """
    FastAPI dependency that enforces role-based access control.
    Raises HTTP 403 Forbidden if user's role is not in allowed_roles.
    """
    normalized_allowed = [normalize_role(r) for r in allowed_roles]

    def role_checker(request: Request) -> Dict[str, Any]:
        user = get_current_user(request)
        if user["role"] not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Role '{user['role']}' lacks required permission ({', '.join(normalized_allowed)} required)."
            )
        return user

    return role_checker

def log_audit_event(
    db: Session,
    actor: str,
    role: str,
    action: str,
    record_id: Optional[str] = None,
    record_type: str = "Project",
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: str = "127.0.0.1"
) -> AuditLog:
    """
    Persists an immutable audit log entry for system actions.
    """
    entry = AuditLog(
        actor=actor,
        role=role,
        action=action,
        record_id=record_id,
        record_type=record_type,
        old_value=old_value,
        new_value=new_value,
        details=details,
        ip_address=ip_address,
        timestamp=datetime.utcnow()
    )
    db.add(entry)
    db.commit()
    return entry

def calculate_sha256(data: bytes) -> str:
    """Computes SHA-256 hash for evidence files to guarantee data integrity."""
    return hashlib.sha256(data).hexdigest()
