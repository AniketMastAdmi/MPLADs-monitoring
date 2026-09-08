import os
import sys

# Ensure parent directory is in path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, base_dir)

from backend.models.database import engine, Base, SessionLocal
from backend.services.ingestion import ingest_all_datasets
from backend.services.demo_generator import generate_demo_dataset
from backend.ml.risk_engine import risk_engine

def run_seed():
    print("[1/4] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("[2/4] Ingesting & normalizing MP allocation datasets...")
        data_dir = os.path.join(base_dir, "data")
        summary = ingest_all_datasets(db, data_dir)
        print(f"      Ingested {summary['mps_created']} MPs across datasets.")

        print("[3/4] Generating demonstration project dataset...")
        generate_demo_dataset(db)

        print("[4/4] Executing multi-signal AI Risk Engine...")
        risk_engine.evaluate_all_projects(db)
        print("✓ Database seeded and AI risk evaluation complete.")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
