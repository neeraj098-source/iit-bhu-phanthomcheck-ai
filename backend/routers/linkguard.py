from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import db
from services.linkguard_service import analyze_link, hash_url
from services.ai_explanation import get_ai_explanation
from datetime import datetime

router = APIRouter()

class LinkRequest(BaseModel):
    url: str
    device_id: str

@router.post("/scan")
async def scan(req: LinkRequest):
    if len(req.url) < 4:
        raise HTTPException(status_code=400, detail="URL too short.")
        
    url_hash = hash_url(req.url)
    
    try:
        supabase = db()
        if supabase:
            # Check cache
            cache_res = supabase.table("link_cache").select("*").eq("url_hash", url_hash).execute()
            if cache_res.data:
                cached = cache_res.data[0]
                expires = datetime.fromisoformat(cached["expires_at"].replace("Z", "+00:00"))
                if datetime.now(expires.tzinfo) < expires:
                    cached_result = {
                        "verdict": cached["verdict"],
                        "fraud_score": float(cached["fraud_score"]),
                        "evidence": cached["evidence"],
                        "from_cache": True,
                        "scan_type": "linkguard",
                        "confidence_level": "CRITICAL" if float(cached["fraud_score"]) >= 85 else "HIGH" if float(cached["fraud_score"]) >= 65 else "MEDIUM" if float(cached["fraud_score"]) >= 40 else "HIGH"
                    }
                    cached_result["ai_explanation"] = await get_ai_explanation(cached_result)
                    
                    try:
                        # Log scan even if cached
                        supabase.table("users").upsert({"device_id": req.device_id}, on_conflict="device_id").execute()
                        scan_data = {
                            "user_device_id": req.device_id,
                            "scan_type": "linkguard",
                            "input_url": req.url,
                            "verdict": cached["verdict"],
                            "fraud_score": cached["fraud_score"],
                            "evidence": cached["evidence"],
                            "ai_explanation": cached_result["ai_explanation"]
                        }
                        db_res = supabase.table("scans").insert(scan_data).execute()
                        if db_res.data:
                            cached_result["scan_id"] = db_res.data[0]["id"]
                    except Exception:
                        pass
                    if "scan_id" not in cached_result:
                         import uuid
                         cached_result["scan_id"] = str(uuid.uuid4())
                    
                    return cached_result
    except Exception as e:
        print(f"Supabase cache err: {e}")
        
    result = await analyze_link(req.url)
    result["ai_explanation"] = await get_ai_explanation(result)
    
    try:
        supabase = db()
        if supabase:
            supabase.table("users").upsert({"device_id": req.device_id}, on_conflict="device_id").execute()
            
            scan_data = {
                "user_device_id": req.device_id,
                "scan_type": result["scan_type"],
                "input_url": req.url,
                "verdict": result["verdict"],
                "fraud_score": result["fraud_score"],
                "confidence_level": result["confidence_level"],
                "evidence": result["evidence"],
                "ai_explanation": result["ai_explanation"],
                "processing_time_ms": result["processing_time_ms"]
            }
            db_res = supabase.table("scans").insert(scan_data).execute()
            if db_res.data:
                result["scan_id"] = db_res.data[0]["id"]
                
            # Upsert into cache
            import datetime as dt
            db_cache = {
                "url_hash": url_hash,
                "url": req.url,
                "verdict": result["verdict"],
                "fraud_score": result["fraud_score"],
                "evidence": result["evidence"],
                "cached_at": dt.datetime.utcnow().isoformat(),
                "expires_at": (dt.datetime.utcnow() + dt.timedelta(days=1)).isoformat()
            }
            supabase.table("link_cache").upsert(db_cache, on_conflict="url_hash").execute()
            
    except Exception as e:
        print(f"Supabase scan error: {e}")
        result["scan_id"] = "local-scan-" + str(result["processing_time_ms"])
        
    return result

@router.get("/demo")
def demo_linkguard():
    return {
        "verdict": "FAKE",
        "fraud_score": 88.5,
        "confidence_level": "CRITICAL",
        "url_analyzed": "https://sbi-secure-login.xyz/verify-account",
        "ai_explanation": "This link impersonates SBI Bank and is designed to steal your login credentials. The domain is not an official SBI website. Do not click this link.",
        "evidence": [
            {"type":"lookalike_domain","title":"Lookalike Domain Detected", "detail":"Domain impersonates SBI. Legitimate sites don't use brand names in non-official domains.","severity":"CRITICAL"},
            {"type":"suspicious_tld","title":"Suspicious Domain Extension: .xyz", "detail":"The .xyz extension is commonly used in phishing domains.","severity":"HIGH"},
            {"type":"suspicious_path","title":"Suspicious URL Path", "detail":"Path contains: verify, account.","severity":"MEDIUM"},
            {"type":"virustotal","title":"Flagged by 12 Security Engines", "detail":"VirusTotal: 12/67 engines flagged as malicious.","severity":"CRITICAL"}
        ],
        "processing_time_ms": 924,
        "scan_id": "demo-link-001",
        "scan_type": "linkguard"
    }
