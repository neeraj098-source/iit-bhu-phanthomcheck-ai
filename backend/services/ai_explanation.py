"""
AI Explanation Service — Using Groq (FREE, no credit card)
"""

import os
from groq import AsyncGroq

async def get_ai_explanation(scan_result: dict) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return _fallback_explanation(scan_result)

    client = AsyncGroq(api_key=api_key)

    verdict    = scan_result.get("verdict", "UNKNOWN")
    score      = scan_result.get("fraud_score", 0)
    scan_type  = scan_result.get("scan_type", "unknown")
    evidence   = scan_result.get("evidence", [])

    high = [e for e in evidence if e.get("severity") in ["HIGH","CRITICAL"]]
    evidence_summary = "\n".join(
        [f"- {e['title']}: {e['detail']}" for e in high[:3]]
    )

    prompt = f"""You are PhantomCheck AI, a fraud detection assistant for Indian users.

A {scan_type} scan completed:
- Verdict: {verdict}
- Fraud Score: {score}/100
- Key Evidence:
{evidence_summary}

Write a SHORT (2-3 sentence) plain English explanation:
1. State clearly if safe or dangerous
2. Mention top 1-2 specific reasons why
3. End with one clear action to take
4. Use simple words — no technical jargon
5. Under 60 words total
Do NOT use bullet points."""

    try:
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",  # fastest free model
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception:
        return _fallback_explanation(scan_result)


def _fallback_explanation(scan_result: dict) -> str:
    verdict   = scan_result.get("verdict", "UNKNOWN")
    score     = scan_result.get("fraud_score", 50)
    scan_type = scan_result.get("scan_type", "scan")

    if verdict == "FAKE":
        if scan_type == "fakepay":
            return f"This payment screenshot is FAKE ({score}% confidence). Digital tampering was detected in the amount field. Do NOT release goods based on this screenshot."
        elif scan_type == "linkguard":
            return f"This link is dangerous ({score}% confidence). It impersonates a trusted service to steal your data. Do not click or share."
        else:
            return f"This audio shows AI voice cloning signs ({score}% confidence). Do not share OTPs or personal info with this caller."
    elif verdict == "SUSPICIOUS":
        return "This has suspicious characteristics. Verify through official channels before proceeding."
    else:
        return "This appears genuine. No significant threats were detected."