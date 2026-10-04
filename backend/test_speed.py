import asyncio
import httpx
import time

async def test_linkguard_speed():
    url = "https://sbi-secure-login.xyz/verify-account"
    payload = {
        "url": url,
        "device_id": "test-device-123"
    }
    
    start_time = time.time()
    try:
        async with httpx.AsyncClient() as client:
            print(f"Scanning: {url}...")
            resp = await client.post("http://localhost:8000/api/linkguard/scan", json=payload, timeout=30.0)
            
            end_time = time.time()
            duration = end_time - start_time
            
            if resp.status_code == 200:
                data = resp.json()
                print("\n✅ Success!")
                print(f"Total time: {duration:.2f} seconds")
                print(f"Backend processing_time_ms: {data.get('processing_time_ms')}")
                print(f"Verdict: {data.get('verdict')}")
                print(f"Fraud Score: {data.get('fraud_score')}")
                print(f"AI Explanation: {data.get('ai_explanation')}")
            else:
                print(f"❌ Error {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_linkguard_speed())
