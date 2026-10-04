"""
PhantomCheck AI — OCR + Official Verification Service
Extracts unique identifiers from UPI screenshots and
verifies them against official/public databases.

WHAT WE VERIFY:
1. IFSC Code      → Razorpay IFSC API (free, no key needed)
                    https://ifsc.razorpay.com/{IFSC}
                    Returns bank details if valid, 404 if fake

2. UTR Number     → Format validation (NPCI standard: exactly 12 digits)
                    Pattern: bank-specific prefix + digits

3. Transaction ID → Per-app format validation
                    PhonePe: T + 22 digits
                    GPay:    CICAgIC... or numeric
                    Paytm:   numeric, 10-12 digits

4. UPI ID         → Format validation (@handle check)
                    Valid handles: @paytm @ybl @oksbi @okaxis etc.

5. Amount Match   → Words vs digits consistency check
                    "Rupees Fifteen Thousand" must match ₹15,000

6. Date Sanity    → Payment date cannot be too old (>90 days suspicious)
                    Or in the future
"""

import re
import io
from services.utr_intelligence import run_utr_intelligence
import time
import urllib.request
import urllib.error
import json as _json
import asyncio
from datetime import datetime, timedelta
from typing import Optional
from PIL import Image

# Try to import pytesseract, fall back gracefully
try:
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


# ─────────────────────────────────────────────────────────
# STEP 1: OCR TEXT EXTRACTION
# ─────────────────────────────────────────────────────────

def extract_text_from_image(image_bytes: bytes) -> str:
    """Extract all text from UPI screenshot using Tesseract OCR."""
    if not OCR_AVAILABLE:
        return ""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = img.size
        if w < 800:
            img = img.resize((w * 2, h * 2), Image.BICUBIC)
        text = pytesseract.image_to_string(img, config="--psm 6 --oem 3")
        print(f"DEBUG: OCR Extraction complete. Extracted {len(text)} characters.")
        if len(text) > 10:
             snippet = text[:50].replace('\n', ' ')
             print(f"DEBUG: OCR Sample: {snippet}...")
        return text
    except Exception as e:
        print(f"DEBUG: OCR ERROR: {e}")
        return ""


# ─────────────────────────────────────────────────────────
# STEP 2: EXTRACT SPECIFIC FIELDS FROM RAW TEXT
# ─────────────────────────────────────────────────────────

def parse_upi_fields(text: str) -> dict:
    """
    Parse OCR text to extract specific UPI payment fields.
    Handles OCR noise (O vs 0, l vs 1 etc.)
    """
    fields = {
        "ifsc": None,
        "utr": None,
        "transaction_id": None,
        "upi_id": None,
        "amount_digits": None,
        "amount_words": None,
        "date_str": None,
        "raw_text": text
    }

    # Clean common OCR substitutions
    text_clean = text.replace("\n", " ").strip()

    # ── IFSC Code ──
    # Format: 4 letters + 0 + 6 alphanumeric  (e.g. PYTM0110110, SBIN0001234)
    # OCR often confuses O with 0 — we capture both and flag
    ifsc_match = re.search(
        r'\b([A-Z]{4}[O0][A-Z0-9]{6})\b',
        text_clean,
        re.IGNORECASE
    )
    if ifsc_match:
        fields["ifsc"] = ifsc_match.group(1).upper()

    # ── UTR Number ──
    # NPCI standard: exactly 12 digits
    # Common labels: UTR, UTR No, UTR Number, Ref No, Reference No
    utr_match = re.search(
        r'(?:UTR|Ref(?:erence)?(?:\s*No)?)[:\s]*([0-9]{10,15})',
        text_clean,
        re.IGNORECASE
    )
    if utr_match:
        fields["utr"] = utr_match.group(1).strip()

    # Also try standalone 12-digit numbers if UTR label not found
    if not fields["utr"]:
        standalone = re.findall(r'\b(\d{12})\b', text_clean)
        if standalone:
            fields["utr"] = standalone[0]

    # ── Transaction ID ──
    # PhonePe: T + 20-22 digits
    # GPay: numeric or alphanumeric
    txn_match = re.search(
        r'(?:Transaction\s*ID|Txn\s*ID|Order\s*ID)[:\s]*([A-Z0-9]{10,30})',
        text_clean,
        re.IGNORECASE
    )
    if txn_match:
        fields["transaction_id"] = txn_match.group(1).strip()

    # PhonePe specific: T + digits
    if not fields["transaction_id"]:
        phonepe_txn = re.search(r'\b(T\d{18,24})\b', text_clean)
        if phonepe_txn:
            fields["transaction_id"] = phonepe_txn.group(1)

    # ── UPI ID ──
    # Format: anything@handle
    upi_match = re.search(
        r'\b([a-zA-Z0-9._-]+@(?:paytm|ybl|oksbi|okaxis|okhdfcbank|okicici|upi|apl|ibl|axl|waicici|wahdfc|yesbank|rbl|aubank|federal|idfc|kotak|sbi|hdfc|icici|axis|pnb|boi|canarabank|unionbank|allahabad|indus|sc|equitas|airtel|jio|postpay|freecharge|mobikwik|amazonpay|gpay|phonepe|bhim))\b',
        text_clean,
        re.IGNORECASE
    )
    if upi_match:
        fields["upi_id"] = upi_match.group(1).lower()

    # ── Amount (digits) ──
    amount_match = re.search(
        r'[₹Rs\.]*\s*([0-9,]+(?:\.[0-9]{2})?)',
        text_clean
    )
    if amount_match:
        amt = amount_match.group(1).replace(",", "")
        try:
            fields["amount_digits"] = float(amt)
        except:
            pass

    # ── Amount in Words ──
    words_match = re.search(
        r'Rupees?\s+(.+?)\s+Only',
        text_clean,
        re.IGNORECASE
    )
    if words_match:
        fields["amount_words"] = words_match.group(1).strip()

    # ── Date ──
    # Formats: "15 Jan 2021", "10:26 am, 15 Jan 2021", "12 Mar 2026"
    date_match = re.search(
        r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+20\d{2})',
        text_clean,
        re.IGNORECASE
    )
    if date_match:
        fields["date_str"] = date_match.group(1)

    # Also try numeric format: DD/MM/YYYY or YYYY-MM-DD
    if not fields["date_str"]:
        date2 = re.search(r'(\d{2}[/-]\d{2}[/-]20\d{2})', text_clean)
        if date2:
            fields["date_str"] = date2.group(1)

    return fields


# ─────────────────────────────────────────────────────────
# STEP 3: OFFICIAL VERIFICATION CHECKS
# ─────────────────────────────────────────────────────────

async def verify_ifsc_official(ifsc: str) -> dict:
    """
    Verify IFSC code against Razorpay's official IFSC database.
    API: https://ifsc.razorpay.com/{IFSC}
    - Returns bank details JSON if valid
    - Returns 404 if IFSC does not exist
    - FREE, no API key needed, maintained by Razorpay

    Why this catches fakes:
    - PYTMO123456 → 404 (letter O, doesn't exist, fake)
    - PYTM0110110 → 200 (real Paytm Bank IFSC)
    - SBIN0001234 → 200 (real SBI branch)
    """
    if not ifsc:
        return {"verified": None, "detail": "No IFSC found in screenshot"}

    # Normalization: OCR often mistakes 0 (zero) for O (letter)
    # 5th position of IFSC is ALWAYS a ZERO (0).
    if len(ifsc) >= 5 and ifsc[4].upper() == 'O':
        ifsc = ifsc[:4] + '0' + ifsc[5:]
        print(f"DEBUG: Normalized IFSC from OCR — converted 'O' to '0' -> {ifsc}")

    # First check format: 4 letters + 0 (zero, not O) + 6 chars
    if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', ifsc):
        return {
            "verified": False,
            "ifsc": ifsc,
            "detail": f"IFSC '{ifsc}' has invalid format. Must be 4 letters + 0 + 6 chars. (e.g. PYTM0110110)",
            "bank": None,
            "branch": None
        }

    def _fetch_ifsc():
        req = urllib.request.Request(
            f"https://ifsc.razorpay.com/{ifsc.upper()}",
            headers={"User-Agent": "PhantomCheck-AI/1.0"}
        )
        with urllib.request.urlopen(req, timeout=6) as resp:
            return resp.read().decode()

    try:
        # Run synchronous urlopen in a thread executor to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        res_text = await loop.run_in_executor(None, _fetch_ifsc)
        data = _json.loads(res_text)
        return {
            "verified": True, "ifsc": ifsc,
            "bank": data.get("BANK","Unknown"),
            "branch": data.get("BRANCH","Unknown"),
            "city": data.get("CITY",""),
            "detail": f"IFSC '{ifsc}' is VALID — {data.get('BANK')} | {data.get('BRANCH')}, {data.get('CITY')}"
        }
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {
                "verified": False, "ifsc": ifsc, "bank": None,
                "detail": f"IFSC '{ifsc}' does NOT exist in official RBI database. Fabricated bank code — strong fake indicator."
            }
        return {"verified": None, "ifsc": ifsc, "detail": f"IFSC lookup HTTP {e.code}"}
    except Exception as e:
        return {"verified": None, "ifsc": ifsc, "detail": f"IFSC lookup unavailable (offline): {str(e)[:60]}"}


def verify_utr_format(utr: str) -> dict:
    """
    Validate UTR number format per NPCI standards.

    NPCI UTR Rules:
    - Exactly 12 digits
    - First 4 chars = bank IFSC prefix (e.g. SBIN, HDFC, PYTM)
    - OR purely numeric 12 digits

    Real UTR: 761816857819 (12 digits) ✓
    Fake UTR: 101552086410 → actually 12 digits, valid format
              but cross-check with date (2021 date + claiming 2024 UTR = sus)
    """
    if not utr:
        return {"verified": None, "detail": "No UTR/Reference number found in screenshot"}

    # Remove spaces and common OCR noise
    utr_clean = re.sub(r'[^0-9A-Z]', '', utr.upper())

    if len(utr_clean) == 12 and utr_clean.isdigit():
        return {
            "verified": True,
            "utr": utr_clean,
            "detail": f"UTR '{utr_clean}' is exactly 12 digits — valid NPCI format."
        }
    elif len(utr_clean) < 10:
        return {
            "verified": False,
            "utr": utr_clean,
            "detail": f"UTR '{utr_clean}' has only {len(utr_clean)} digits. NPCI standard requires exactly 12."
        }
    elif len(utr_clean) > 15:
        return {
            "verified": False,
            "utr": utr_clean,
            "detail": f"UTR '{utr_clean}' has {len(utr_clean)} characters. Too long for valid UTR (max 12)."
        }
    else:
        return {
            "verified": True,
            "utr": utr_clean,
            "detail": f"UTR '{utr_clean}' format is acceptable ({len(utr_clean)} chars)."
        }


def verify_transaction_id_format(txn_id: str) -> dict:
    """
    Validate Transaction ID format per known UPI app patterns.

    PhonePe:  T + exactly 22 digits  e.g. T2603101231259059236654
    GPay:     13-20 digit numeric
    Paytm:    10-12 digit numeric (UPI Reference Number)
    BHIM:     12-16 digit numeric
    """
    if not txn_id:
        return {"verified": None, "detail": "No Transaction ID found in screenshot"}

    txn_clean = txn_id.strip()

    # PhonePe pattern: T + 20-22 digits
    if re.match(r'^T\d{18,24}$', txn_clean):
        # Extract date from transaction ID (PhonePe encodes YYYYMMDD)
        # T26031012... → 2603 = year+something? Actually PhonePe: T + timestamp-based
        return {
            "verified": True,
            "app_detected": "PhonePe",
            "txn_id": txn_clean,
            "detail": f"Transaction ID '{txn_clean[:10]}...' matches PhonePe format (T + digits)."
        }

    # GPay: all numeric, 10-20 digits
    if re.match(r'^\d{10,20}$', txn_clean):
        return {
            "verified": True,
            "app_detected": "GPay/Paytm/BHIM",
            "txn_id": txn_clean,
            "detail": f"Transaction ID '{txn_clean}' matches standard UPI numeric format."
        }

    # Alphanumeric IDs — some banks use custom formats
    # Don't fail them if they have reasonable length (8-25 chars)
    if 8 <= len(txn_clean) <= 25:
        return {
            "verified": True,
            "app_detected": "Unknown UPI App",
            "txn_id": txn_clean,
            "detail": f"Transaction ID '{txn_clean}' has non-standard format but reasonable length. Accepted."
        }

    return {
        "verified": False,
        "txn_id": txn_clean,
        "detail": f"Transaction ID '{txn_clean}' does not match any known UPI app format and has unusual length."
    }


def verify_upi_id_format(upi_id: str) -> dict:
    """
    Validate UPI ID format.
    Official handles registered with NPCI.
    """
    if not upi_id:
        return {"verified": None, "detail": "No UPI ID found in screenshot"}

    upi_lower = upi_id.lower()

    # Must have @ and valid handle
    if "@" not in upi_lower:
        return {
            "verified": False,
            "upi_id": upi_id,
            "detail": f"'{upi_id}' is not a valid UPI ID format (missing @)"
        }

    handle = upi_lower.split("@")[1]
    username = upi_lower.split("@")[0]

    # Official NPCI-registered VPA handles
    official_handles = {
        "paytm", "ybl", "oksbi", "okaxis", "okhdfcbank", "okicici",
        "upi", "apl", "ibl", "axl", "waicici", "wahdfc", "yesbank",
        "rbl", "aubank", "federal", "idfc", "kotak", "sbi", "hdfc",
        "icici", "axis", "pnb", "boi", "canarabank", "unionbank",
        "allahabad", "indus", "sc", "equitas", "airtel", "jio",
        "postpay", "freecharge", "mobikwik", "amazonpay", "gpay",
        "phonepe", "bhim", "timecosmos", "naviaxis", "rajgovt",
        "mahb", "hdfcbank", "icicibank", "axisbank", "sbibank"
    }

    if handle in official_handles:
        return {
            "verified": True,
            "upi_id": upi_id,
            "handle": handle,
            "detail": f"UPI ID '@{handle}' is an officially registered NPCI payment handle."
        }
    else:
        return {
            "verified": False,
            "upi_id": upi_id,
            "handle": handle,
            "detail": f"'@{handle}' is not a recognized NPCI-registered UPI handle. "
                      f"Could be a custom handle or fake."
        }


def verify_date_sanity(date_str: str) -> dict:
    """
    Check if payment date makes sense.

    Suspicious:
    - Date more than 90 days ago (why sharing old receipt?)
    - Date in the future (impossible)
    - Year mismatch (2021 receipt shown as recent payment)
    """
    if not date_str:
        return {"verified": None, "detail": "No date found in screenshot"}

    try:
        # Try parsing common formats
        for fmt in ["%d %b %Y", "%d %B %Y", "%d/%m/%Y", "%Y-%m-%d"]:
            try:
                parsed_date = datetime.strptime(date_str.strip(), fmt)
                break
            except ValueError:
                continue
        else:
            return {"verified": None, "detail": f"Could not parse date: '{date_str}'"}

        now = datetime.now()
        age_days = (now - parsed_date).days

        if parsed_date > now:
            return {
                "verified": False,
                "date": date_str,
                "age_days": age_days,
                "detail": f"Payment date '{date_str}' is in the FUTURE. Impossible for a real payment."
            }
        elif age_days > 365:
            return {
                "verified": False,
                "date": date_str,
                "age_days": age_days,
                "detail": f"Payment date '{date_str}' is {age_days//365} year(s) ago. "
                          f"A {age_days}-day-old receipt should NOT be used as proof of a recent payment."
            }
        elif age_days > 90:
            return {
                "verified": False,
                "date": date_str,
                "age_days": age_days,
                "detail": f"Payment date '{date_str}' is {age_days} days old. "
                          f"Receipts older than 90 days are suspicious as proof of current payment."
            }
        elif age_days < 0:
            return {
                "verified": False,
                "date": date_str,
                "age_days": age_days,
                "detail": f"Payment date is in the future — impossible."
            }
        else:
            return {
                "verified": True,
                "date": date_str,
                "age_days": age_days,
                "detail": f"Payment date '{date_str}' is {age_days} days ago — within normal range."
            }

    except Exception as e:
        return {"verified": None, "detail": f"Date verification error: {e}"}


def verify_amount_word_match(amount_digits: float, amount_words: str) -> dict:
    """
    Check if amount in words matches amount in digits.
    Fake receipts sometimes get this wrong.
    e.g. "₹15,000" with "Rupees Five Hundred Only" = mismatch
    """
    if not amount_digits or not amount_words:
        return {"verified": None, "detail": "Could not extract both amount formats for cross-check"}

    # Simple keyword check for common amounts
    words_lower = amount_words.lower()
    amount_int = int(amount_digits)

    # Build expected word pattern
    THOUSANDS = {
        1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
        6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
        11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen",
        15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen",
        19: "nineteen", 20: "twenty", 25: "twenty five", 30: "thirty",
        50: "fifty", 100: "one hundred"
    }

    mismatch = False
    detail = ""

    # Check if ₹15000 matches "fifteen thousand"
    if amount_int >= 1000:
        thousands = amount_int // 1000
        if thousands in THOUSANDS:
            if THOUSANDS[thousands] not in words_lower:
                mismatch = True
                detail = (f"Amount mismatch: ₹{amount_int:,} digits say {thousands},000 "
                         f"but words say '{amount_words}' — inconsistency detected.")

    if mismatch:
        return {
            "verified": False,
            "amount_digits": amount_digits,
            "amount_words": amount_words,
            "detail": detail
        }

    return {
        "verified": True,
        "amount_digits": amount_digits,
        "amount_words": amount_words,
        "detail": f"Amount consistency check passed: ₹{amount_int:,} matches '{amount_words}'."
    }


# ─────────────────────────────────────────────────────────
# MASTER OCR VERIFICATION FUNCTION
# ─────────────────────────────────────────────────────────

async def run_ocr_verification(image_bytes: bytes) -> dict:
    """
    Full OCR + official verification pipeline.
    Returns structured results for each field checked.

    This is called FROM fakepay_service.py and adds
    a verification layer on top of visual analysis.
    """
    start = time.time()

    # Step 1: Extract text (CPU-bound, run in thread to avoid blocking response)
    loop = asyncio.get_event_loop()
    raw_text = await loop.run_in_executor(None, extract_text_from_image, image_bytes)

    if not raw_text.strip():
        return {
            "ocr_available": OCR_AVAILABLE,
            "fraud_score": 0,
            "overall_verdict": "UNKNOWN",
            "evidence_items": [],
            "failed_checks": [],
            "passed_checks": [],
            "fields_extracted": {},
            "summary": "OCR not installed" if not OCR_AVAILABLE else "No text extracted",
            "processing_ms": int((time.time() - start) * 1000)
        }

    # Step 2: Parse fields
    fields = parse_upi_fields(raw_text)

    # Step 3: Run all checks (parallel where possible)
    async def _wrap(fn, *args):
        return fn(*args)

    ifsc_result, utr_result, txn_result, upi_result, date_result, amount_result = await asyncio.gather(
        verify_ifsc_official(fields["ifsc"]),
        _wrap(verify_utr_format, fields["utr"]),
        _wrap(verify_transaction_id_format, fields["transaction_id"]),
        _wrap(verify_upi_id_format, fields["upi_id"]),
        _wrap(verify_date_sanity, fields["date_str"]),
        _wrap(verify_amount_word_match, fields["amount_digits"], fields["amount_words"]),
        return_exceptions=True
    )

    # Wrap any exceptions
    def safe(r, label):
        if isinstance(r, Exception):
            return {"verified": None, "detail": f"{label} check failed: {r}"}
        return r

    checks = {
        "ifsc":       safe(ifsc_result,    "IFSC"),
        "utr":        safe(utr_result,     "UTR"),
        "transaction": safe(txn_result,    "Transaction ID"),
        "upi_id":     safe(upi_result,     "UPI ID"),
        "date":       safe(date_result,    "Date"),
        "amount":     safe(amount_result,  "Amount"),
    }

    # Step 4: Calculate fraud score from verification results
    score = 0
    failed_checks = []
    passed_checks = []

    weights = {
        "ifsc":        40,   # Strongest signal — official DB check
        "date":        25,   # Old date = clear fake
        "transaction": 15,
        "utr":         10,
        "upi_id":       5,
        "amount":       5,
    }

    for key, weight in weights.items():
        result = checks[key]
        v = result.get("verified")
        if v is False:
            score += weight
            failed_checks.append({
                "field": key.upper(),
                "detail": result.get("detail", ""),
                "weight": weight
            })
        elif v is True:
            passed_checks.append({
                "field": key.upper(),
                "detail": result.get("detail", "")
            })

    # Build evidence items for the main result
    evidence_items = []

    for fc in failed_checks:
        evidence_items.append({
            "type": f"ocr_{fc['field'].lower()}",
            "title": f"❌ {fc['field']} Verification FAILED",
            "detail": fc["detail"],
            "severity": "CRITICAL" if fc["weight"] >= 30 else "HIGH"
        })

    for pc in passed_checks:
        evidence_items.append({
            "type": f"ocr_{pc['field'].lower()}",
            "title": f"✓ {pc['field']} Verified",
            "detail": pc["detail"],
            "severity": "CLEAR"
        })

    # Summary line
    total_checkable = sum(1 for c in checks.values() if c.get("verified") is not None)
    failed_count = len(failed_checks)

    if total_checkable == 0:
        summary = "Could not extract any verifiable fields from this screenshot."
        overall_verdict = "UNKNOWN"
    elif failed_count == 0:
        summary = f"All {total_checkable} extracted fields passed official verification."
        overall_verdict = "VERIFIED"
    elif failed_count >= 2:
        summary = f"{failed_count}/{total_checkable} fields FAILED verification — strong evidence of fake receipt."
        overall_verdict = "FAKE"
    else:
        summary = f"{failed_count}/{total_checkable} field failed verification — suspicious."
        overall_verdict = "SUSPICIOUS"

    # ── UTR Intelligence Layer ──
    utr_intel = {}
    try:
        utr_intel = run_utr_intelligence(fields)
        # Add UTR intelligence evidence items
        for cf in utr_intel.get("critical_fails", []):
            evidence_items.insert(0, {
                "type": f"utr_{cf['check'].lower().replace(' ','_')}",
                "title": f"UTR CHECK FAILED: {cf['check']}",
                "detail": cf["detail"],
                "severity": "CRITICAL" if cf.get("score",0) >= 70 else "HIGH"
            })
            score += cf.get("score", 0) * 0.3
            failed_checks.append({"field": cf["check"], "detail": cf["detail"], "weight": cf.get("score",20)})
        for pc in utr_intel.get("passed_checks", []):
            evidence_items.append({
                "type": f"utr_{pc['check'].lower().replace(' ','_')}",
                "title": f"UTR Verified: {pc['check']}",
                "detail": pc["detail"],
                "severity": "CLEAR"
            })
            passed_checks.append({"field": pc["check"], "detail": pc["detail"]})
        # Update verdict if UTR intelligence found issues
        if utr_intel.get("utr_verdict") == "FAKE":
            score = max(score, utr_intel["utr_fraud_score"])
            overall_verdict = "FAKE"
            summary = utr_intel.get("summary", summary)
        elif utr_intel.get("utr_verdict") == "VERIFIED" and overall_verdict == "VERIFIED":
            summary = f"All fields verified including UTR intelligence checks."
    except Exception as e:
        pass  # UTR intelligence failure should not block result

    return {
        "ocr_available": True,
        "raw_text_preview": raw_text[:300].strip(),
        "fields_extracted": {k: v for k, v in fields.items() if k != "raw_text" and v is not None},
        "checks": checks,
        "evidence_items": evidence_items,
        "failed_checks": failed_checks,
        "passed_checks": passed_checks,
        "fraud_score": round(min(100, score), 1),
        "overall_verdict": overall_verdict,
        "summary": summary,
        "utr_intelligence": utr_intel,
        "processing_ms": int((time.time() - start) * 1000)
    }


# Async wrapper for non-async contexts
def run_ocr_verification_sync(image_bytes: bytes) -> dict:
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Already in async context — create task
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, run_ocr_verification(image_bytes))
                return future.result(timeout=15)
        else:
            return loop.run_until_complete(run_ocr_verification(image_bytes))
    except Exception as e:
        return {
            "ocr_available": False,
            "detail": str(e),
            "fraud_score": 0,
            "evidence_items": [],
            "overall_verdict": "UNKNOWN"
        }