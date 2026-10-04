import asyncio
import os
import sys

# Add backend to path so we can import services
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.linkguard_service import analyze_link

async def test_scenarios():
    scenarios = [
        {
            "name": "Official SBI Domain",
            "url": "https://onlinesbi.sbi/personal/dashboard.html",
            "expected": "SAFE"
        },
        {
            "name": "Lookalike PhonePe Phishing",
            "url": "http://phonepe-reward-claim.online/verify-otp",
            "expected": "FAKE"
        },
        {
            "name": "Suspicious TLD with KYC keyword",
            "url": "https://verify-account-update.xyz",
            "expected": "FAKE"
        },
        {
            "name": "Generic Business Site",
            "url": "https://digital-marketing-agency.com",
            "expected": "SAFE"
        }
    ]

    print(f"{'URL':<45} | {'Verdict':<10} | {'Score':<6} | {'Status'}")
    print("-" * 80)

    for s in scenarios:
        try:
            # We use analyze_link which calls external APIs. 
            # In a test environment, these might timeout or fail if keys are missing, 
            # but structural analysis should still work.
            result = await analyze_link(s["url"])
            verdict = result["verdict"]
            score = result["fraud_score"]
            status = "✅ PASS" if verdict == s["expected"] else "❌ FAIL"
            
            print(f"{s['url'][:45]:<45} | {verdict:<10} | {score:<6} | {status}")
            if verdict != s["expected"]:
                 print(f"   Reasoning: {result.get('evidence', [])}")
        except Exception as e:
            print(f"Error testing {s['url']}: {e}")

if __name__ == "__main__":
    asyncio.run(test_scenarios())
