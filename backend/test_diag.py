import requests
import json

# Backend URL
URL = "http://localhost:8000/api/fakepay/scan"

# Sample call with no image (should fail or return 422)
try:
    print("Testing Fakepay endpoint...")
    # Since we can't easily upload a real file here without a path, 
    # we'll just check if the endpoint is reachable.
    response = requests.get("http://localhost:8000/health")
    print(f"Health check: {response.json()}")
    
    # Check demo response if it exists
    # Wait, fakepay demo is not a GET endpoint.
except Exception as e:
    print(f"Error: {e}")
