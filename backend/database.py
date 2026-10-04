"""Supabase singleton client"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
_client: Client = None

def db() -> Client | None:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        if not url or not key:
            print("WARNING: Supabase URL or SERVICE_KEY missing in .env. Database operations will be skipped.")
            return None
        try:
            _client = create_client(url, key)
        except Exception as e:
            print(f"ERROR: Failed to initialize Supabase client: {e}")
            return None
    return _client
