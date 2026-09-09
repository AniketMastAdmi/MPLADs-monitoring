import unittest
from backend.models.database import engine, Base, SessionLocal
from backend.models.models import Project, Investigation, InvestigationEvidence, RiskHistory
from backend.services.ingestion import get_data_health_and_freshness, get_project_provenance
from backend.services.nlp_feedback import get_public_concern_cluster
from backend.ml.risk_engine import haversine_distance_km

class TestInvestigationAndProvenance(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_golden_demo_investigation(self):
        """Verifies golden demo project has an active investigation case."""
        inv = self.db.query(Investigation).filter_by(investigation_id="INV-UP-2024-001").first()
        self.assertIsNotNone(inv)
        self.assertEqual(inv.risk_level, "CRITICAL")
        self.assertEqual(inv.current_status, "Under Verification")
        self.assertEqual(inv.assigned_officer, "Er. Rajesh Kumar")

    def test_02_field_evidence_and_gps(self):
        """Verifies field evidence with GPS discrepancy calculation."""
        ev = self.db.query(InvestigationEvidence).filter_by(investigation_id="INV-UP-2024-001").first()
        self.assertIsNotNone(ev)
        self.assertEqual(ev.evidence_type, "Site Photograph")
        self.assertIsNotNone(ev.file_hash)
        self.assertGreater(ev.distance_difference_meters, 0.0)
        self.assertTrue(ev.visual_mismatch_flag)

    def test_03_haversine_distance(self):
        """Asserts Haversine distance calculator between GPS coordinates."""
        # Varanasi coordinates approx ~1.8km apart
        dist = haversine_distance_km(25.3176, 82.9739, 25.3240, 82.9860)
        self.assertAlmostEqual(dist, 1.4, delta=0.5)

    def test_04_data_health_and_provenance(self):
        """Verifies Data Health and Project Provenance lineage."""
        health = get_data_health_and_freshness(self.db)
        self.assertGreaterEqual(health["quality_score"], 95.0)
        self.assertGreater(health["total_records"], 700)

        prov = get_project_provenance(self.db, "MPLAD-UP-2023-GOLDEN-01")
        self.assertEqual(prov["project_id"], "MPLAD-UP-2023-GOLDEN-01")
        self.assertIn("Demonstration", prov["source"])
        self.assertTrue(prov["is_demo"])

    def test_05_grievance_clustering(self):
        """Verifies public concern clustering on golden project."""
        cluster = get_public_concern_cluster(self.db, "MPLAD-UP-2023-GOLDEN-01")
        self.assertGreaterEqual(cluster["total_complaints"], 3)
        self.assertEqual(cluster["concern_level"], "HIGH")
        self.assertTrue(len(cluster["top_issues"]) > 0)

if __name__ == "__main__":
    unittest.main()
