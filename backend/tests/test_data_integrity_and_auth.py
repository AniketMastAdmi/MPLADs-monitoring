import os
import io
import unittest
from datetime import datetime
from backend.models.database import engine, Base, SessionLocal
from backend.models.models import MP, Project, RiskAssessment, Investigation, AuditLog, User
from backend.services.ingestion import compute_real_data_quality, get_project_provenance
from backend.services.auth_service import (
    hash_password, verify_password, generate_session_token, verify_session_token,
    seed_default_users
)
from backend.services.demo_generator import generate_demo_dataset
from backend.ml.risk_engine import risk_engine
from fastapi.testclient import TestClient
from backend.main import app

class TestDataIntegrityAndAuth(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()
        cls.client = TestClient(app)
        # Ensure standard demo dataset and users are loaded
        generate_demo_dataset(cls.db)
        risk_engine.evaluate_all_projects(cls.db)
        seed_default_users(cls.db)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_official_record_retains_provenance(self):
        """1. Official record retains source provenance without fabrication."""
        # Create a real imported official record
        proj = Project(
            project_id="PRJ-TEST-OFFICIAL-01",
            work_name="Verified Primary Health Centre Boundary",
            state="Kerala",
            district="Ernakulam",
            work_type="Health & Sanitation",
            sanctioned_amount=2500000.0,
            expenditure=1800000.0,
            source="Imported CSV File (kerala_works.csv)",
            source_name="Kerala DRDA Portal Registry",
            source_record_id="KL-EKM-2024-099",
            source_url="https://mplads.gov.in",
            data_version="v2026.3",
            ingestion_batch_id="BATCH-TEST-001",
            is_demo=False
        )
        self.db.add(proj)
        self.db.commit()

        prov = get_project_provenance(self.db, "PRJ-TEST-OFFICIAL-01")
        self.assertEqual(prov["data_origin"], "Official / Imported")
        self.assertEqual(prov["source_name"], "Kerala DRDA Portal Registry")
        self.assertEqual(prov["source_record_id"], "KL-EKM-2024-099")
        self.assertFalse(prov["is_demo"])

    def test_02_demo_record_marked_as_demo(self):
        """2. Demo record is marked as demo and provenance does not fabricate an official source URL."""
        prov = get_project_provenance(self.db, "MPLAD-UP-2023-GOLDEN-01")
        self.assertEqual(prov["data_origin"], "Demo / Simulated")
        self.assertTrue(prov["is_demo"])
        self.assertIn("Simulated Location", prov["location_status"])
        self.assertIsNone(prov["source_url"])

    def test_03_demo_records_excluded_from_official_analytics(self):
        """3. Demo records do not enter official-only analytics."""
        res = self.client.get("/api/analytics/national?data_mode=official")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        # All demo projects must be excluded
        demo_count = self.db.query(Project).filter(Project.is_demo == True).count()
        self.assertGreater(demo_count, 0)
        # Official total works should only count non-demo works
        official_in_db = self.db.query(Project).filter(Project.is_demo == False).count()
        self.assertEqual(data["total_works"], official_in_db)

    def test_04_project_without_coordinates_does_not_receive_fake_coords(self):
        """4. Project without coordinates does not receive fake coordinates from financial fields."""
        no_gps_proj = Project(
            project_id="PRJ-TEST-NO-GPS-01",
            work_name="Rural Solar Lighting System",
            state="Odisha",
            district="Mayurbhanj",
            work_type="Rural Electrification",
            sanctioned_amount=450000.0,
            expenditure=400000.0,
            latitude=None,
            longitude=None,
            is_demo=False
        )
        self.db.add(no_gps_proj)
        self.db.commit()

        # Call map API
        res = self.client.get("/api/map/projects?data_mode=all")
        self.assertEqual(res.status_code, 200)
        map_data = res.json()
        
        # Verify no_gps_proj is NOT in mapped_projects
        mapped_ids = [p["project_id"] for p in map_data["mapped_projects"]]
        self.assertNotIn("PRJ-TEST-NO-GPS-01", mapped_ids)
        self.assertGreater(map_data["summary"]["location_missing_count"], 0)

    def test_05_map_returns_actual_stored_coordinates(self):
        """5. Map returns actual stored coordinates with simulated tagging."""
        res = self.client.get("/api/map/projects?data_mode=demo")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        golden_item = next((p for p in data["mapped_projects"] if p["project_id"] == "MPLAD-UP-2023-GOLDEN-01"), None)
        self.assertIsNotNone(golden_item)
        self.assertAlmostEqual(golden_item["latitude"], 25.3176, places=3)
        self.assertAlmostEqual(golden_item["longitude"], 82.9739, places=3)
        self.assertEqual(golden_item["location_type"], "simulated")
        self.assertTrue(golden_item["is_demo"])

    def test_06_data_quality_score_changes_when_invalid_data_added(self):
        """6. Data-quality score is dynamic and changes when invalid data is added."""
        initial_quality = compute_real_data_quality(self.db)
        initial_score = initial_quality["score"]

        # Insert 3 intentionally malformed records (missing fields, invalid negative amounts)
        bad_proj = Project(
            project_id="PRJ-BAD-01",
            work_name="", # Missing mandatory field
            state="",
            district="",
            work_type="Infrastructure",
            sanctioned_amount=-50000.0, # Negative amount
            expenditure=-20000.0,
            is_demo=False
        )
        self.db.add(bad_proj)
        self.db.commit()

        updated_quality = compute_real_data_quality(self.db)
        # Score must drop because of penalties
        self.assertLess(updated_quality["score"], initial_score)
        self.assertGreater(updated_quality["incomplete_records"], initial_quality["incomplete_records"])
        self.assertGreater(updated_quality["invalid_records"], initial_quality["invalid_records"])

    def test_07_and_08_csv_import_preview_and_validation(self):
        """7 & 8. CSV import preview matches actual uploaded rows, and invalid rows are rejected."""
        csv_content = """work_name,state,district,sanctioned_amount,expenditure,latitude,longitude,work_type
Construction of Community Hall,Bihar,Patna,1500000,1200000,25.5941,85.1376,Infrastructure
Drinking Water RO Plant,Bihar,Gaya,-200000,50000,24.7914,85.0002,Water Supply
,Bihar,Muzaffarpur,800000,500000,26.1209,85.3647,Roads
"""
        # Login as ministry admin to get bearer token
        login_res = self.client.post("/api/auth/login", json={"username": "ministry_admin", "password": "super123"})
        self.assertEqual(login_res.status_code, 200)
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Step 1: Preview CSV
        files = {"file": ("test_works.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
        preview_res = self.client.post("/api/admin/import/preview", files=files, headers=headers)
        self.assertEqual(preview_res.status_code, 200)
        p_data = preview_res.json()
        
        # 3 rows total: 1 valid, 2 invalid (1 negative amount, 1 missing work_name)
        self.assertEqual(p_data["total_rows"], 3)
        self.assertEqual(p_data["valid_rows"], 1)
        self.assertEqual(p_data["invalid_rows"], 2)

        # Step 2: Commit valid row
        commit_res = self.client.post(
            "/api/admin/import/commit",
            json={"temp_batch_id": p_data["temp_batch_id"]},
            headers=headers
        )
        self.assertEqual(commit_res.status_code, 200)
        c_data = commit_res.json()
        self.assertEqual(c_data["inserted_rows"], 1)
        self.assertEqual(c_data["rejected_rows"], 2)

    def test_09_unauthorized_role_cannot_modify_investigation(self):
        """9. Unauthorized role cannot modify an investigation (403 Forbidden)."""
        # Citizen token
        login_res = self.client.post("/api/auth/login", json={"username": "citizen", "password": "citizen123"})
        self.assertEqual(login_res.status_code, 200)
        citizen_token = login_res.json()["access_token"]

        inv = self.db.query(Investigation).first()
        self.assertIsNotNone(inv)

        res = self.client.patch(
            f"/api/investigations/{inv.investigation_id}",
            json={"current_status": "Resolved", "findings": "Unauthorized attempt"},
            headers={"Authorization": f"Bearer {citizen_token}"}
        )
        self.assertEqual(res.status_code, 403)

    def test_10_authorized_officer_can_update_investigation(self):
        """10. Authorized officer can update an assigned investigation and audit entry is created."""
        login_res = self.client.post("/api/auth/login", json={"username": "officer", "password": "officer123"})
        self.assertEqual(login_res.status_code, 200)
        officer_token = login_res.json()["access_token"]

        inv = self.db.query(Investigation).first()
        self.assertIsNotNone(inv)

        res = self.client.patch(
            f"/api/investigations/{inv.investigation_id}",
            json={"current_status": "Under Verification", "findings": "Field verification verified by IAS officer."},
            headers={"Authorization": f"Bearer {officer_token}"}
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["current_status"], "Under Verification")

        # 11. Verify Audit Entry
        audit = self.db.query(AuditLog).filter(
            AuditLog.investigation_id == inv.investigation_id,
            AuditLog.action == "INVESTIGATION_UPDATED"
        ).order_by(AuditLog.timestamp.desc()).first()
        self.assertIsNotNone(audit)
        self.assertIn("Under Verification", audit.new_value)

    def test_12_model_evaluation_clearly_identifies_synthetic_benchmark(self):
        """12. Model evaluation clearly identifies synthetic benchmark data with mandatory notice."""
        res = self.client.get("/api/analytics/model-evaluation")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_synthetic_evaluation"])
        self.assertIn("Synthetic Scenario Detection", data["evaluation_dataset_name"])
        self.assertIn("These metrics measure agreement with predefined synthetic anomaly labels", data["disclaimer"])

if __name__ == "__main__":
    unittest.main()
