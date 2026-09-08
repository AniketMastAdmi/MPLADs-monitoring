import os
import re
import csv
from typing import Dict, List, Tuple, Any, Optional
from sqlalchemy.orm import Session
from backend.models.models import MP, AuditLog

def clean_amount(val: Any) -> float:
    if val is None:
        return 0.0
    s = str(val).replace(",", "").replace("₹", "").strip()
    if not s or s.lower() == "nan" or s == " ":
        return 0.0
    try:
        return float(s)
    except ValueError:
        return 0.0

def normalize_mp_name(raw_name: str) -> Tuple[str, Optional[str]]:
    """
    Normalizes MP names:
    - Strips prefixes: Dr., Prof., Shri, Smt., Ms., Adv, Captain, Swami
    - Extracts and removes tenure parentheticals e.g. '(2026-32) (2026-2032)', '(18LS)'
    - Cleans up extra spaces and standardizes Title Case
    - Returns: (normalized_name, extracted_tenure)
    """
    if not raw_name:
        return "", None
    
    name = raw_name.strip()
    
    # Extract tenure if present e.g. (2026-32) or (2022-2028)
    tenure_match = re.findall(r"\((?:20\d\d-\d{2,4}|18LS)\)", name)
    tenure_str = " ".join(tenure_match) if tenure_match else None
    
    # Remove all parenthetical tenures/dates
    name = re.sub(r"\((?:20\d\d-\d{2,4}|18LS)\)", "", name)
    
    # Remove leading honorifics / titles
    titles = [
        r"^Dr\.\s+", r"^Prof\.\s+", r"^Shri\s+", r"^Smt\.\s+", r"^Ms\.\s+",
        r"^Adv\s+", r"^Captain\s+", r"^Swami\s+", r"^Mr\s+"
    ]
    for pattern in titles:
        name = re.sub(pattern, "", name, flags=re.IGNORECASE)
    
    # Remove internal noise like "alias", redundant quotes, trailing parentheticals
    name = re.sub(r"\s+alias\s+.*", "", name, flags=re.IGNORECASE)
    name = name.strip("\"' ")
    
    # Convert ALL CAPS to Title Case, but preserve initials properly
    words = name.split()
    cleaned_words = []
    for w in words:
        if len(w) <= 2 and w.isupper():
            cleaned_words.append(w)
        else:
            cleaned_words.append(w.capitalize())
    
    normalized = " ".join(cleaned_words).strip()
    return normalized, tenure_str

def calculate_name_similarity(name1: str, name2: str) -> float:
    """Calculates token-based Jaccard similarity between two normalized names."""
    tokens1 = set(name1.lower().split())
    tokens2 = set(name2.lower().split())
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union)

def ingest_all_datasets(db: Session, data_dir: str) -> Dict[str, Any]:
    """
    Ingests and normalizes both CSV datasets:
    DATASET A: Allocated Limit for Honble MPs (1)(1).csv
    DATASET B: Allocated Limit for Honble MPs.csv
    Preserves original names, identifies matches across datasets, and logs audit entries.
    """
    file_a = os.path.join(data_dir, "raw", "Allocated Limit for Honble MPs (1)(1).csv")
    file_b = os.path.join(data_dir, "raw", "Allocated Limit for Honble MPs.csv")

    summary = {
        "dataset_a_total": 0,
        "dataset_a_allocated_sum": 0.0,
        "dataset_b_total": 0,
        "dataset_b_allocated_sum": 0.0,
        "mps_created": 0,
        "cross_dataset_matches": 0,
        "warnings": []
    }

    # Clear existing MP entries if needed
    db.query(MP).delete()
    db.commit()

    records_a = []
    if os.path.exists(file_a):
        with open(file_a, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                sr_no = row.get("Sr. No.", "").strip()
                if not sr_no or sr_no.lower() == "grand total":
                    continue
                state = row.get("State", "").strip()
                raw_name = row.get("Hon'ble Members of Parliament", "").strip()
                category = row.get("Elected/Nominated", "Elected MP").strip()
                amt = clean_amount(row.get("Allocated AMOUNT ( ₹ )", 0.0))
                norm_name, tenure = normalize_mp_name(raw_name)
                records_a.append({
                    "sr_no": sr_no,
                    "state": state,
                    "original_name": raw_name,
                    "normalized_name": norm_name,
                    "elected_nominated": category,
                    "allocation_amount": amt,
                    "allocation_period": tenure,
                    "source": "Allocated Limit for Honble MPs (1)(1).csv (Rajya Sabha/Nominated)"
                })
                summary["dataset_a_total"] += 1
                summary["dataset_a_allocated_sum"] += amt
    else:
        summary["warnings"].append(f"Dataset A file not found at {file_a}")

    records_b = []
    if os.path.exists(file_b):
        with open(file_b, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                sr_no = row.get("Sr. No.", "").strip()
                if not sr_no or sr_no.lower() == "grand total":
                    continue
                state = row.get("State", "").strip()
                raw_name = row.get("Hon'ble Members of Parliaments", "").strip()
                constituency = row.get("Constituency", "").strip()
                amt = clean_amount(row.get("Allocated AMOUNT ( ₹ )", 0.0))
                norm_name, tenure = normalize_mp_name(raw_name)
                records_b.append({
                    "sr_no": sr_no,
                    "state": state,
                    "original_name": raw_name,
                    "normalized_name": norm_name,
                    "constituency": constituency,
                    "elected_nominated": "Elected MP",
                    "allocation_amount": amt,
                    "allocation_period": tenure or "18th Lok Sabha",
                    "source": "Allocated Limit for Honble MPs.csv (Lok Sabha)"
                })
                summary["dataset_b_total"] += 1
                summary["dataset_b_allocated_sum"] += amt
    else:
        summary["warnings"].append(f"Dataset B file not found at {file_b}")

    # Ingest Records B (Lok Sabha with constituencies)
    mp_map = {} # normalized_name.lower() -> MP object
    for r in records_b:
        mp = MP(
            original_name=r["original_name"],
            normalized_name=r["normalized_name"],
            state=r["state"],
            constituency=r["constituency"],
            elected_nominated=r["elected_nominated"],
            allocation_amount=r["allocation_amount"],
            allocation_source=r["source"],
            allocation_period=r["allocation_period"],
            source_record_id=f"B-{r['sr_no']}",
            match_confidence=1.0
        )
        db.add(mp)
        db.flush()
        mp_map[r["normalized_name"].lower()] = mp
        summary["mps_created"] += 1

    # Ingest Records A (Rajya Sabha / Nominated), matching or creating new
    for r in records_a:
        key = r["normalized_name"].lower()
        matched = False
        
        # Check if already present in Lok Sabha (e.g. term transitions or dual records)
        if key in mp_map:
            matched = True
            summary["cross_dataset_matches"] += 1
            # Add as tracked MP record with cross reference
            mp = MP(
                original_name=r["original_name"],
                normalized_name=r["normalized_name"],
                state=r["state"],
                constituency="Rajya Sabha / State Allocation",
                elected_nominated=r["elected_nominated"],
                allocation_amount=r["allocation_amount"],
                allocation_source=r["source"],
                allocation_period=r["allocation_period"],
                source_record_id=f"A-{r['sr_no']}",
                match_confidence=0.95
            )
            db.add(mp)
        else:
            # Fuzzy match check
            best_sim = 0.0
            best_mp = None
            for existing_key, existing_mp in mp_map.items():
                sim = calculate_name_similarity(r["normalized_name"], existing_mp.normalized_name)
                if sim > best_sim:
                    best_sim = sim
                    best_mp = existing_mp
            
            confidence = 1.0
            if best_sim >= 0.8 and best_mp and best_mp.state.lower() == r["state"].lower():
                confidence = best_sim
                summary["cross_dataset_matches"] += 1

            mp = MP(
                original_name=r["original_name"],
                normalized_name=r["normalized_name"],
                state=r["state"],
                constituency="Nominated" if "nominated" in r["elected_nominated"].lower() else "Rajya Sabha",
                elected_nominated=r["elected_nominated"],
                allocation_amount=r["allocation_amount"],
                allocation_source=r["source"],
                allocation_period=r["allocation_period"],
                source_record_id=f"A-{r['sr_no']}",
                match_confidence=confidence
            )
            db.add(mp)
            summary["mps_created"] += 1

    # Audit log
    audit = AuditLog(
        actor="System Ingestion Engine",
        role="Admin",
        action="INGEST_OFFICIAL_ALLOCATION_DATASETS",
        record_id="BATCH-001",
        details=f"Ingested {summary['dataset_a_total']} records from Dataset A and {summary['dataset_b_total']} records from Dataset B. Total MPs: {summary['mps_created']}."
    )
    db.add(audit)
    db.commit()

    return summary
