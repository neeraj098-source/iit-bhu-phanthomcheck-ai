"""
FakePay Detector Router — v3 with OCR Verification
POST /api/fakepay/scan

TWO-LAYER DETECTION:
  Layer 1 — Visual Analysis (fakepay_service.py)
    → Browser chrome, phone authenticity, composite, ELA
  Layer 2 — OCR + Official Verification (ocr_verification.py)
    → IFSC via Razorpay API, UTR format, date sanity, UPI ID

Final score = max(visual_score, ocr_score) if one is strong
            + combined boost if both agree
"""

import uuid
import time
import asyncio
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from database import db
from services.fakepay_service import analyze_screenshot
from routers.ocr_verification import run_ocr_verification
from services.ai_explanation import get_ai_explanation

router = APIRouter()
MAX_SIZE = 10 * 1024 * 1024  # 10MB


def merge_results(visual: dict, ocr: dict) -> dict:
    """
    Merge visual analysis + OCR verification into one final result.

    Logic:
    - If OCR finds FAKE (IFSC invalid / date old) → always FAKE regardless of visual
    - If visual finds FAKE (browser chrome / wrong dimensions) → FAKE
    - If both say SAFE → SAFE with high confidence
    - OCR evidence items are prepended (more authoritative)
    """
    visual_score = visual.get("fraud_score", 0)
    ocr_score = ocr.get("fraud_score", 0)
    ocr_verdict = ocr.get("overall_verdict", "UNKNOWN")
    failed = ocr.get("failed_checks", [])
    passed = ocr.get("passed_checks", [])

    # Build OCR evidence items
    ocr_evidence = []
    for fc in failed:
        ocr_evidence.append({
            "type": f"ocr_{fc['field'].lower()}",
            "title": f"OFFICIAL CHECK FAILED: {fc['field']}",
            "detail": fc["detail"],
            "severity": "CRITICAL" if fc.get("weight", 0) >= 30 else "HIGH",
            "score": fc.get("weight", 20)
        })
    for pc in passed:
        ocr_evidence.append({
            "type": f"ocr_{pc['field'].lower()}",
            "title": f"Verified: {pc['field']}",
            "detail": pc["detail"],
            "severity": "CLEAR",
            "score": 0
        })

    # Add OCR summary evidence item
    if ocr.get("ocr_available") and ocr.get("fields_extracted"):
        extracted = ocr.get("fields_extracted", {})
        field_list = ", ".join(f"{k.upper()}={v}" for k, v in extracted.items())
        ocr_evidence.insert(0, {
            "type": "ocr_extraction",
            "title": f"OCR Extracted {len(extracted)} Fields",
            "detail": f"Fields read from screenshot: {field_list}",
            "severity": "INFO",
            "score": 0
        })
    elif not ocr.get("ocr_available"):
        ocr_evidence.insert(0, {
            "type": "ocr_extraction",
            "title": "OCR Not Available",
            "detail": "Could not extract text from this screenshot. Visual-only analysis used.",
            "severity": "INFO",
            "score": 0
        })

    # OCR evidence goes FIRST (most authoritative)
    combined_evidence = ocr_evidence + visual.get("evidence", [])

    # Adjust titles to show percentage of fraud
    for item in combined_evidence:
        score = item.get("score", 0)
        if score > 0:
            if "Fraud" not in item["title"] and "%" not in item["title"]:
                item["title"] = f"{item['title']} ({score}% Fraud)"

    # Score combination logic
    if ocr_verdict == "FAKE" and ocr_score >= 40:
        # OCR has hard proof (invalid IFSC, old date) — this overrides visual
        final_score = max(visual_score, ocr_score)
        # If visual also agrees → boost confidence
        if visual_score >= 40:
            final_score = min(100, (visual_score + ocr_score) / 2 + 15)
        verdict = "FAKE"
        confidence = "CRITICAL" if final_score >= 75 else "HIGH"

    elif visual_score >= 55:
        # Visual caught it (browser chrome, wrong dimensions)
        final_score = visual_score
        # OCR adds confirmation if it found issues too
        if ocr_score > 0:
            final_score = min(100, visual_score + ocr_score * 0.3)
        verdict = "FAKE"
        confidence = "CRITICAL" if final_score >= 75 else "HIGH"

    elif (ocr_verdict == "SUSPICIOUS" and ocr_score >= 25) or (visual_score >= 31 and visual_score < 55):
        final_score = max(visual_score, ocr_score * 0.6)
        verdict = "SUSPICIOUS"
        confidence = "MEDIUM"

    else:
        # Both say safe/unverified
        final_score = max(visual_score, ocr_score * 0.3)
        if ocr_verdict == "VERIFIED":
            # All fields passed official check — extra confidence boost
            verdict = "SAFE"
            confidence = "HIGH"
            final_score = min(final_score, 20)  # cap score low when verified
        else:
            verdict = "SAFE"
            confidence = "MEDIUM" if final_score > 15 else "HIGH"

    return {
        "verdict": verdict,
        "secure": "Yes" if verdict == "SAFE" else "No",
        "fraud_score": round(final_score, 1),
        "confidence_level": confidence,
        "detected_app": visual.get("detected_app", "unknown"),
        "is_dark_theme": visual.get("is_dark_theme", False),
        "evidence": combined_evidence,
        "ocr_fields": ocr.get("fields_extracted", {}),
        "ocr_summary": ocr.get("summary", ""),
        "processing_time_ms": visual.get("processing_time_ms", 0) + ocr.get("processing_ms", 0),
        "scan_type": "fakepay"
    }


@router.post("/scan")
async def scan_upi_screenshot(
    file: UploadFile = File(...),
    device_id: str = Form(default="anonymous")
):
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP images supported")

    image_bytes = await file.read()

    if len(image_bytes) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    # ── Layer 1 & 2: Run in Parallel to Save Time ──
    visual_result, ocr_result = await asyncio.gather(
        analyze_screenshot(image_bytes),
        run_ocr_verification(image_bytes)
    )

    # ── Merge both layers ──
    result = merge_results(visual_result, ocr_result)

    # ── AI Explanation (uses merged result) ──
    result["ai_explanation"] = await get_ai_explanation(result)

    # ── Save to Supabase ──
    try:
        supabase = db()
        supabase.table("users").upsert({
            "device_id": device_id,
            "last_active": "now()"
        }, on_conflict="device_id").execute()

        scan_record = supabase.table("scans").insert({
            "user_device_id": device_id,
            "scan_type": "fakepay",
            "input_filename": file.filename,
            "input_size_bytes": len(image_bytes),
            "verdict": result["verdict"],
            "fraud_score": result["fraud_score"],
            "confidence_level": result["confidence_level"],
            "evidence": result["evidence"],
            "ai_explanation": result["ai_explanation"],
            "metadata": {
                "detected_app": result.get("detected_app", "unknown"),
                "ocr_fields": result.get("ocr_fields", {}),
                "ocr_summary": result.get("ocr_summary", "")
            },
            "processing_time_ms": result["processing_time_ms"]
        }).execute()

        if scan_record.data:
            result["scan_id"] = scan_record.data[0]["id"]
        if result["verdict"] == "FAKE":
            supabase.rpc("increment_user_scams", {"p_device_id": device_id}).execute()
    except Exception:
        result["scan_id"] = str(uuid.uuid4())

    return result


@router.get("/demo")
async def get_demo_result():
    """Pre-built demo for hackathon presentation — works offline"""
    return {
        "verdict": "FAKE",
        "secure": "No",
        "fraud_score": 91.5,
        "confidence_level": "CRITICAL",
        "detected_app": "paytm",
        "is_dark_theme": False,
        "ocr_fields": {
            "ifsc": "PYTMO123456",
            "utr": "101552086410",
            "upi_id": "9012348882@paytm",
            "amount_digits": 15000.0,
            "amount_words": "Fifteen Thousand",
            "date_str": "15 Jan 2021"
        },
        "ocr_summary": "2/5 fields FAILED official verification — strong evidence of fake receipt.",
        "ai_explanation": "This Paytm receipt is FAKE. The IFSC code 'PYTMO123456' does not exist in RBI's official database — it uses letter 'O' instead of digit '0'. The payment date is from 2021, over 4 years ago. Do NOT release any goods.",
        "evidence": [
            {
                "type": "ocr_extraction",
                "title": "OCR Extracted 6 Fields",
                "detail": "Fields read: IFSC=PYTMO123456, UTR=101552086410, UPI_ID=9012348882@paytm, AMOUNT=₹15,000, DATE=15 Jan 2021",
                "severity": "INFO", "score": 0
            },
            {
                "type": "ocr_ifsc",
                "title": "OFFICIAL CHECK FAILED: IFSC (40% Fraud)",
                "detail": "IFSC 'PYTMO123456' uses letter 'O' in position 5 instead of digit '0'. All valid IFSC codes have ZERO at position 5. This IFSC does not exist in RBI database.",
                "severity": "CRITICAL", "score": 40
            },
            {
                "type": "ocr_date",
                "title": "OFFICIAL CHECK FAILED: DATE (25% Fraud)",
                "detail": "Payment date '15 Jan 2021' is 5 years ago. A 1,884-day-old receipt is NOT valid proof of a recent payment.",
                "severity": "HIGH", "score": 25
            },
            {
                "type": "ocr_utr",
                "title": "Verified: UTR",
                "detail": "UTR '101552086410' is exactly 12 digits — valid NPCI format.",
                "severity": "CLEAR", "score": 0
            },
            {
                "type": "ocr_upi_id",
                "title": "Verified: UPI_ID",
                "detail": "UPI ID '@paytm' is an officially registered NPCI payment handle.",
                "severity": "CLEAR", "score": 0
            },
            {
                "type": "phone_authenticity",
                "title": "Not a Real Phone Screenshot (100% Fraud)",
                "detail": "Aspect ratio 1.19 is too wide for a phone (real phones: 1.85-2.25). Image is 608×726 — web-generated receipt.",
                "severity": "CRITICAL", "score": 100
            }
        ],
        "processing_time_ms": 2341,
        "scan_id": "demo-scan-001",
        "scan_type": "fakepay"
    }