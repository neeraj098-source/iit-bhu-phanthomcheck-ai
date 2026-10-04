from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from database import db
from services.voicescam_service import analyze_voice
from services.ai_explanation import get_ai_explanation

router = APIRouter()

@router.post("/scan")
async def scan(file: UploadFile = File(...), device_id: str = Form("anonymous")):
    if not (file.content_type.startswith("audio/") or file.content_type.startswith("video/")):
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}. Must be audio.")
        
    audio_bytes = await file.read()
    if len(audio_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 20MB.")
        
    result = await analyze_voice(audio_bytes)
    result["ai_explanation"] = await get_ai_explanation(result)
    
    try:
        supabase = db()
        if supabase:
            supabase.table("users").upsert({"device_id": device_id}, on_conflict="device_id").execute()
            
            scan_data = {
                "user_device_id": device_id,
                "scan_type": result["scan_type"],
                "input_filename": file.filename,
                "input_size_bytes": len(audio_bytes),
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
    except Exception as e:
        print(f"Supabase error: {e}")
        result["scan_id"] = "local-scan-" + str(result["processing_time_ms"])
        
    return result
