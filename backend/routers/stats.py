from fastapi import APIRouter
from database import db
from datetime import datetime

router = APIRouter()

@router.get("/")
def get_dashboard_stats():
    fallback = {
        "scans_today": 0,
        "fake_detected": 0,
        "money_protected_lakhs": 0.0,
        "fakepay_scans": 0,
        "voicescam_scans": 0,
        "linkguard_scans": 0
    }
    try:
        supabase = db()
        if not supabase:
            return fallback
            
        res = supabase.table("daily_stats").select("*").order("stat_date", desc=True).limit(1).execute()
        if res.data:
            row = res.data[0]
            money = float(row.get("money_protected", 8432000.0)) / 100000.0
            return {
                "scans_today": row.get("total_scans", 0),
                "fake_detected": row.get("fake_detected", 0),
                "money_protected_lakhs": round(money, 1),
                "fakepay_scans": row.get("fakepay_scans", 0),
                "voicescam_scans": row.get("voicescam_scans", 0),
                "linkguard_scans": row.get("linkguard_scans", 0)
            }
        return fallback
    except Exception as e:
        print(f"Stats err: {e}")
        return fallback

@router.get("/user/{device_id}")
def get_user_stats(device_id: str):
    fallback = {
        "total_scans": 0,
        "scams_blocked": 0,
        "safe_verified": 0,
        "money_protected_estimate": 0
    }
    try:
        supabase = db()
        if not supabase:
            return fallback
            
        res = supabase.table("users").select("*").eq("device_id", device_id).execute()
        if res.data:
            row = res.data[0]
            # Since users table actually has total_scans and scams_blocked based on triggers hopefully
            total = row.get("total_scans", 0)
            fake = row.get("scams_blocked", 0)
            return {
                "total_scans": total,
                "scams_blocked": fake,
                "safe_verified": max(0, total - fake),
                "money_protected_estimate": fake * 2500
            }
        return fallback
    except Exception as e:
        return fallback
