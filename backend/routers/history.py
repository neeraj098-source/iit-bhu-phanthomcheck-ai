from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from database import db

router = APIRouter()

@router.get("/")
def get_history(
    device_id: str,
    limit: int = 20,
    scan_type: Optional[str] = None,
    verdict: Optional[str] = None
):
    limit = min(100, limit)
    try:
        supabase = db()
        if not supabase:
            return {"scans": [], "total": 0}
            
        query = supabase.table("scans").select("*", count="exact").eq("user_device_id", device_id)
        if scan_type:
            query = query.eq("scan_type", scan_type)
        if verdict:
            query = query.eq("verdict", verdict)
            
        res = query.order("created_at", desc=True).limit(limit).execute()
        return {"scans": res.data, "total": res.count if res.count else len(res.data)}
    except Exception as e:
        print(f"Supabase err: {e}")
        return {"scans": [], "total": 0}

@router.get("/{scan_id}")
def get_scan(scan_id: str):
    try:
        supabase = db()
        if not supabase:
            raise HTTPException(status_code=404, detail="DB Error")
            
        res = supabase.table("scans").select("*").eq("id", scan_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Scan not found")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/report/{scan_id}")
def report_scan(scan_id: str, device_id: str = Query(...), description: str = Query(...)):
    try:
        supabase = db()
        if not supabase:
            raise HTTPException(status_code=500, detail="DB Error")
            
        report_data = {
            "scan_id": scan_id,
            "user_device_id": device_id,
            "report_type": "user_report",
            "description": description
        }
        res = supabase.table("reports").insert(report_data).execute()
        if res.data:
            return {"success": True, "reference_number": res.data[0]["reference_number"], "message": "Report submitted successfully."}
        raise HTTPException(status_code=500, detail="Failed to insert report")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
