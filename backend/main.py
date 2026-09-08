import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.models.database import engine, Base, SessionLocal
from backend.models.models import MP, Project
from backend.services.ingestion import ingest_all_datasets
from backend.services.demo_generator import generate_demo_dataset
from backend.ml.risk_engine import risk_engine
from backend.api.routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if MPs exist; if not, run automatic ingestion
        mp_count = db.query(MP).count()
        if mp_count == 0:
            print("[INFO] Ingesting provided MP allocation datasets...")
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_dir = os.path.join(base_dir, "data")
            summary = ingest_all_datasets(db, data_dir)
            print(f"[INFO] Ingested {summary['mps_created']} MPs.")

        # Check if Projects exist; if not, generate demo dataset
        proj_count = db.query(Project).count()
        if proj_count == 0:
            print("[INFO] Generating demonstration project dataset...")
            generate_demo_dataset(db)
            print("[INFO] Executing multi-signal AI Risk Engine...")
            risk_engine.evaluate_all_projects(db)
            print("[INFO] Risk evaluation completed.")
    except Exception as e:
        print(f"[ERROR] Startup data initialization error: {e}")
    finally:
        db.close()
    
    yield
    # Shutdown

app = FastAPI(
    title="MPLADS INSIGHT API",
    description="AI-Powered Monitoring, Transparency & Public Accountability Platform for MPLADS Scheme (MoSPI / DIID)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def root_check():
    return {
        "status": "online",
        "service": "MPLADS INSIGHT API",
        "organization": "MoSPI / DIID",
        "theme": "Smart Automation - SIH 2026",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
