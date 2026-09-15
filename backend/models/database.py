import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Automatically load .env if present
_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
if os.path.exists(_env_path):
    try:
        with open(_env_path, "r", encoding="utf-8") as _f:
            for _line in _f:
                _line = _line.strip()
                if _line and not _line.startswith("#") and "=" in _line:
                    _k, _v = _line.split("=", 1)
                    _k, _v = _k.strip(), _v.strip().strip('"').strip("'")
                    if _k not in os.environ:
                        os.environ[_k] = _v
    except Exception:
        pass

# Resolve DATABASE_URL: treat missing, empty, or whitespace-only values as absent.
# On Vercel the filesystem is read-only except for /tmp, so we use /tmp as the
# SQLite fallback. Local development and external databases are unaffected.
_VERCEL_SQLITE_FALLBACK = "sqlite:////tmp/mplads_insight.db"
DATABASE_URL = (os.getenv("DATABASE_URL") or "").strip() or _VERCEL_SQLITE_FALLBACK

# For SQLite, enable check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
