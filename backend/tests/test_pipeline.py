import os
import unittest
from backend.models.database import engine, Base, SessionLocal
from backend.models.models import MP, Project, RiskAssessment, Feedback
from backend.services.ingestion import ingest_all_datasets, normalize_mp_name
from backend.services.demo_generator import generate_demo_dataset
from backend.ml.risk_engine import risk_engine
from backend.services.nlp_feedback import classify_feedback_nlp

class TestMPLADSInsightPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cls.data_dir = os.path.join(os.path.dirname(base_dir), "data")

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_name_normalization(self):
        """Verify complex MP names with tenures and honorifics are normalized properly."""
        raw = "Dr. Abhishek Manu Singhvi (2026-32) (2026-2032)"
        norm, tenure = normalize_mp_name(raw)
        self.assertEqual(norm, "Abhishek Manu Singhvi")
        self.assertIn("2026-32", tenure)

        raw_ls = "AASHTIKAR PATIL NAGESH BAPURAO"
        norm_ls, _ = normalize_mp_name(raw_ls)
        self.assertEqual(norm_ls, "Aashtikar Patil Nagesh Bapurao")

    def test_02_ingestion_totals(self):
        """Verify that both official CSVs ingest and grand totals match baseline values."""
        summary = ingest_all_datasets(self.db, self.data_dir)
        self.assertGreaterEqual(summary["mps_created"], 700)
        # Check Dataset A sum is approx ₹3363.84 Cr
        self.assertAlmostEqual(summary["dataset_a_allocated_sum"] / 10000000, 3363.848, places=1)
        # Check Dataset B sum is approx ₹8318.05 Cr
        self.assertAlmostEqual(summary["dataset_b_allocated_sum"] / 10000000, 8318.055, places=1)

    def test_03_golden_demo_and_risk_engine(self):
        """Assert Golden Demo project exists with multi-signal evaluation and Critical risk tier."""
        generate_demo_dataset(self.db)
        risk_engine.evaluate_all_projects(self.db)

        golden = self.db.query(Project).filter_by(project_id="MPLAD-UP-2023-GOLDEN-01").first()
        self.assertIsNotNone(golden)
        self.assertEqual(golden.sanctioned_amount, 1850000.0)
        self.assertEqual(golden.expenditure, 2480000.0)
        self.assertEqual(golden.financial_progress, 89.0)
        self.assertEqual(golden.physical_progress, 51.0)

        risk = self.db.query(RiskAssessment).filter_by(project_id="MPLAD-UP-2023-GOLDEN-01").first()
        self.assertIsNotNone(risk)
        self.assertEqual(risk.risk_score, 91.0)
        self.assertEqual(risk.risk_level, "CRITICAL")
        self.assertGreater(risk.progress_mismatch_score, 50.0)

    def test_04_nlp_feedback_triaging(self):
        """Assert citizen feedback NLP categorizes delay and poor quality correctly."""
        cat, priority = classify_feedback_nlp("The building has severe water leakage and ceiling cracks", "Work incomplete")
        self.assertEqual(cat, "poor quality")

        cat2, priority2 = classify_feedback_nlp("Work was abandoned 6 months ago with zero progress", "Work not started")
        self.assertEqual(cat2, "delay")

if __name__ == "__main__":
    unittest.main()
