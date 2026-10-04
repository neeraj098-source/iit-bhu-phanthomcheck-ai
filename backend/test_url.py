import requests; res = requests.post("http://localhost:8000/api/linkguard/scan", json={"url": "http://google.com", "device_id": "test"}); print(res.status_code, res.text)
