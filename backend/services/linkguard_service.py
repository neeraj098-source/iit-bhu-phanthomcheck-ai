import os
import hashlib
import re
import urllib.parse
import json as _json
import time
import asyncio
import base64
import httpx

def normalize_url(url: str) -> str:
    if not url.startswith("http://") and not url.startswith("https://"):
        return "https://" + url
    return url

def hash_url(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()

def analyze_domain_structure(url: str) -> dict:
    score = 0
    evidence = []
    
    try:
        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc.lower()
        path = parsed.path.lower()
    except Exception:
        return {"score": 100, "evidence": [{"type": "invalid_url", "title": "Invalid URL", "detail": "Could not parse URL", "severity": "CRITICAL", "score": 100.0}]}

    # 0. Official Whitelist (-100 points, auto-SAFE)
    # Common Indian gov and official bank root domains
    whitelist = [
        'gov.in', 'nic.in', 'rbi.org.in', 'onlinesbi.sbi', 'icicibank.com', 
        'hdfcbank.com', 'axisbank.com', 'isro.gov.in', 'irctc.co.in',
        'phonepe.com', 'paytm.com', 'google.com', 'microsoft.com'
    ]
    if any(domain == w or domain.endswith('.' + w) for w in whitelist):
        return {"score": -100, "evidence": [{"type": "official_domain", "title": "Verified Official Domain", "detail": "This is a recognized official government or financial institution domain.", "severity": "CLEAR", "score": 0.0}]}

    # 1. Suspicious TLD check (+35 points)
    flagged_tlds = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.click', '.loan', '.site', '.online', '.ws', '.info', '.biz']
    if any(domain.endswith(tld) for tld in flagged_tlds):
        score += 40 # Increased from 35
        evidence.append({
            "type": "suspicious_tld",
            "title": "Suspicious Domain Extension",
            "detail": f"Uses a TLD ({domain.split('.')[-1]}) commonly used in phishing scams.",
            "severity": "HIGH",
            "score": 40.0
        })

    # 2. Lookalike domain check (+60 points)
    brands = [
        'sbi', 'hdfc', 'icici', 'axis', 'phonepe', 'paytm', 'gpay', 'googlepay', 
        'bhim', 'upi', 'npci', 'rbi', 'irctc', 'trai', 'aadhaar', 'amazon', 
        'flipkart', 'ajio', 'lenskart', 'nykaa', 'zomato', 'swiggy', 'tataneu'
    ]
    official_brand_domains = [
        'onlinesbi.sbi', 'sbi.co.in', 'hdfcbank.com', 'icicibank.com', 
        'axisbank.com', 'phonepe.com', 'paytm.com', 'irctc.co.in', 
        'amazon.in', 'flipkart.com', 'google.com'
    ]
    
    for brand in brands:
        if brand in domain:
            # If the domain contains the brand but isn't an official match
            if not any(domain == d or domain.endswith('.' + d) for d in official_brand_domains):
                score += 65 # Increased to 65 (auto SUSPICIOUS at least)
                evidence.append({
                    "type": "lookalike_domain",
                    "title": f"Impersonation Detected: {brand.upper()}",
                    "detail": f"Domain contains the '{brand}' brand name but is not an official domain.",
                    "severity": "CRITICAL",
                    "score": 65.0
                })
                break

    # 3. Excessive subdomains check (+25 points)
    parts = domain.split('.')
    if len(parts) > 4:
        score += 25
        evidence.append({
            "type": "excessive_subdomains",
            "title": "Excessive Subdomains",
            "detail": "Domain uses many subdomains to hide real origin.",
            "severity": "MEDIUM",
            "score": 25.0
        })

    # 4. IP address as domain (+40 points)
    if re.match(r"^(\d{1,3}\.){3}\d{1,3}(:\d+)?$", domain):
        score += 40
        evidence.append({
            "type": "ip_domain",
            "title": "IP Address Used as Domain",
            "detail": "Legitimate sites rarely use raw IP addresses.",
            "severity": "HIGH",
            "score": 40.0
        })

    # 5. Suspicious keywords (+25 points)
    keywords = [
        'login', 'verify', 'kyc', 'otp', 'secure', 'update', 'confirm', 
        'account', 'blocked', 'suspended', 'bonus', 'reward', 'prize', 'offer'
    ]
    path_hit = any(kw in path for kw in keywords)
    domain_hit = any(kw in domain for kw in keywords)
    
    if path_hit or domain_hit:
        score += 30 # Increased from 25
        source = "domain and path" if (path_hit and domain_hit) else ("domain" if domain_hit else "path")
        evidence.append({
            "type": "suspicious_keywords",
            "title": f"High-Risk Keywords in {source.capitalize()}",
            "detail": f"The URL contains terms frequently used to trick users in KYC/Banking scams.",
            "severity": "HIGH",
            "score": 30.0
        })

    # 6. HTTP check (+20 points)
    if parsed.scheme == "http":
        score += 20
        evidence.append({
            "type": "http_no_ssl",
            "title": "Connection Not Secure",
            "detail": "Uses HTTP instead of HTTPS.",
            "severity": "HIGH",
            "score": 20.0
        })
    else:
        evidence.append({
            "type": "ssl_present",
            "title": "Connection Secure",
            "detail": "Uses HTTPS.",
            "severity": "CLEAR",
            "score": 0.0
        })

    return {"score": score, "evidence": evidence}

async def check_virustotal(url: str) -> dict | None:
    api_key = os.getenv("VIRUSTOTAL_API_KEY")
    if not api_key:
        return None
    try:
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://www.virustotal.com/api/v3/urls/{url_id}",
                headers={"x-apikey": api_key},
                timeout=8.0
            )
            if resp.status_code == 200:
                data = resp.json()
                stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                return {
                    "malicious_engines": stats.get("malicious", 0),
                    "suspicious_engines": stats.get("suspicious", 0),
                    "total_engines": sum(stats.values()) or 1
                }
    except Exception:
        return None

async def check_urlscan(url: str) -> dict | None:
    api_key = os.getenv("URLSCAN_API_KEY")
    if not api_key:
        return None
    try:
        async with httpx.AsyncClient() as client:
            # Start scan
            submit_resp = await client.post(
                "https://urlscan.io/api/v1/scan/",
                headers={"API-Key": api_key, "Content-Type": "application/json"},
                json={"url": url, "visibility": "unlisted"},
                timeout=10.0
            )
            if submit_resp.status_code != 200:
                return None
                
            data = submit_resp.json()
            verdict_url = data.get("api")
            if not verdict_url:
                return None
            
            # Poll for result (Wait 3s, then check every 2s, max 3 times)
            # This is much faster than a hardcoded 8s sleep
            await asyncio.sleep(3)
            for _ in range(4):
                result_resp = await client.get(verdict_url, timeout=10.0)
                if result_resp.status_code == 200:
                    rdata = result_resp.json()
                    verdicts = rdata.get("verdicts", {}).get("overall", {})
                    return {
                        "malicious": verdicts.get("malicious", False),
                        "score": verdicts.get("score", 0),
                        "categories": verdicts.get("categories", []),
                        "screenshot": rdata.get("screenshot")
                    }
                await asyncio.sleep(2)
    except Exception:
        return None

async def check_phishtank(url: str) -> bool:
    api_key = os.getenv("PHISHTANK_API_KEY", "")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://checkurl.phishtank.com/checkurl/",
                data={"url": url, "format": "json", "app_key": api_key},
                timeout=8.0
            )
            if resp.status_code == 200:
                data = resp.json()
                return data.get("results", {}).get("in_database", False) and data.get("results", {}).get("valid", False)
    except Exception:
        return False

async def analyze_link(url: str) -> dict:
    start_time = time.time()
    url = normalize_url(url)
    
    structural_analysis = analyze_domain_structure(url)
    struct_score = structural_analysis["score"]
    evidence = structural_analysis["evidence"]
    
    results = await asyncio.gather(
        check_virustotal(url),
        check_urlscan(url),
        check_phishtank(url),
        return_exceptions=True
    )
    
    vt_result = results[0] if not isinstance(results[0], Exception) else None
    urlscan_result = results[1] if not isinstance(results[1], Exception) else None
    phishtank_flagged = results[2] if not isinstance(results[2], Exception) else False

    vt_score = 0
    if vt_result and vt_result.get("malicious_engines", 0) > 0:
        malicious = vt_result["malicious_engines"]
        # Only treat as CRITICAL if 2+ engines flag it to avoid isolated false positives
        if malicious >= 2:
            vt_score = 100
            severity = "CRITICAL"
        else:
            vt_score = 40
            severity = "MEDIUM"
            
        evidence.append({
            "type": "virustotal",
            "title": f"Flagged by {malicious} Scanning Engines",
            "detail": f"VirusTotal analysis confirms {malicious} engine(s) marked this link as malicious.",
            "severity": severity,
            "score": float(vt_score)
        })
            
    urlscan_score = 0
    if urlscan_result:
        if urlscan_result.get("malicious"):
            urlscan_score = 100
            evidence.append({
                "type": "urlscan",
                "title": "Flagged by URLScan.io",
                "detail": "URLScan marked this site as malicious.",
                "severity": "CRITICAL",
                "score": 100.0
            })
        elif urlscan_result.get("score", 0) > 50:
            urlscan_score = 50
            evidence.append({
                "type": "urlscan",
                "title": "Suspicious URLScan Score",
                "detail": f"URLScan generated a risk score of {urlscan_result['score']}.",
                "severity": "HIGH",
                "score": 50.0
            })

    phishtank_score = 0
    if phishtank_flagged:
        phishtank_score = 100
        evidence.append({
            "type": "phishtank",
            "title": "PhishTank Database Match",
            "detail": "Confirmed as a phishing link in the PhishTank community database.",
            "severity": "CRITICAL",
            "score": 100.0
        })

    # Combine all logic.
    api_score = max(vt_score, urlscan_score, phishtank_score)
    
    # 50/50 balance between structural heuristics and API verification
    # This ensures "brand new" phishing links (0 API score) are still caught by heuristics
    final_score = (max(0, struct_score) * 0.5) + (api_score * 0.5)
    
    # CRITICAL OVERRIDES:
    # 1. Any confirmed API match (PhishTank/URLScan/VT 2+) -> At least 85
    if phishtank_flagged or (urlscan_result and urlscan_result.get("malicious")) or vt_score >= 100:
        final_score = max(final_score, 90)
    
    # 2. Lookalike domain with suspicious TLD -> At least 80
    has_lookalike = any(e["type"] == "lookalike_domain" for e in evidence)
    has_sus_tld = any(e["type"] == "suspicious_tld" for e in evidence)
    has_sus_kw = any(e["type"] == "suspicious_keywords" for e in evidence)
    
    if (has_lookalike and has_sus_tld) or (has_lookalike and has_sus_kw):
        final_score = max(final_score, 82)
    elif (has_sus_tld and has_sus_kw):
        final_score = max(final_score, 65) # Enough to trigger FAKE

    final_score = min(100.0, round(final_score, 1))
    
    # Handle auto-safe if score is negative (from whitelist)
    if struct_score <= -50:
        verdict = "SAFE"
        confidence = "HIGH"
        final_score = 0
    elif final_score >= 60:
        verdict = "FAKE"
        confidence = "CRITICAL" if final_score >= 85 else "HIGH"
    elif final_score >= 30:
        verdict = "SUSPICIOUS"
        confidence = "MEDIUM"
    else:
        verdict = "SAFE"
        confidence = "HIGH" if final_score < 15 else "MEDIUM"
        
    proc_time = int((time.time() - start_time) * 1000)
    
    return {
        "verdict": verdict,
        "fraud_score": final_score,
        "confidence_level": confidence,
        "detected_app": "unknown",
        "evidence": evidence,
        "processing_time_ms": proc_time,
        "scan_type": "linkguard"
    }