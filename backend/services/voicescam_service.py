"""
VoiceScam Shield Service — CALIBRATED VERSION
Fixed thresholds based on real audio diagnostic.

Diagnostic results from actual test files:
  AI Voice:    ZCR_std=0.00045  Pitch_CV=0.024  Pause_std=10ms
  Human Voice: ZCR_std=0.00433  Pitch_CV=0.088  Pause_std=34ms
  Bank Scam:   ZCR_std=0.00048  Pitch_CV=0.045  Pause_std=39ms
  Real Call:   ZCR_std=0.00359  Pitch_CV=0.142  Pause_std=49ms
"""

import io
import wave
import time
import numpy as np
from typing import Tuple


def load_audio(audio_bytes: bytes) -> Tuple[np.ndarray, int]:
    """Load audio — tries librosa first, falls back to stdlib wave"""
    try:
        import librosa
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050, mono=True)
        return y, sr
    except Exception:
        pass

    try:
        with wave.open(io.BytesIO(audio_bytes), 'r') as f:
            frames = f.readframes(f.getnframes())
            sr = f.getframerate()
            channels = f.getnchannels()
            sampwidth = f.getsampwidth()

        if sampwidth == 2:
            y = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
        elif sampwidth == 1:
            y = (np.frombuffer(frames, dtype=np.uint8).astype(np.float32) - 128) / 128.0
        else:
            raise ValueError(f"Unsupported sample width: {sampwidth}")

        if channels == 2:
            y = y[::2]

        if sr != 22050 and sr > 0:
            new_len = int(len(y) * 22050 / sr)
            y = np.interp(np.linspace(0, len(y)-1, new_len), np.arange(len(y)), y)
            sr = 22050

        return y, sr
    except Exception as e:
        raise ValueError(f"Could not load audio: {e}")


def analyze_zcr_variance(y: np.ndarray, sr: int) -> dict:
    """
    ZCR standard deviation — strongest single AI detector.
    AI voices: std ~0.0005 (robotic consistency)
    Human voices: std ~0.004+ (natural variation)
    Threshold: 0.002 separates them cleanly.
    """
    FRAME, HOP = 1024, 512
    n_frames = (len(y) - FRAME) // HOP
    zcr_vals = []

    for i in range(n_frames):
        frame = y[i*HOP: i*HOP+FRAME]
        if len(frame) < FRAME:
            break
        zcr = np.sum(np.abs(np.diff(np.sign(frame)))) / (2*FRAME)
        zcr_vals.append(zcr)

    if not zcr_vals:
        return {"is_suspicious": False, "ai_score": 20, "zcr_std": 0,
                "detail": "Insufficient frames for ZCR analysis."}

    zcr_std = float(np.std(zcr_vals))

    if zcr_std < 0.001:
        return {"zcr_std": round(zcr_std, 6), "is_suspicious": True, "ai_score": 90,
                "detail": f"Voice crossing rate is robotically consistent (std={zcr_std:.5f}). Strong AI synthesis indicator."}
    elif zcr_std < 0.002:
        return {"zcr_std": round(zcr_std, 6), "is_suspicious": True, "ai_score": 65,
                "detail": f"Voice crossing rate is suspiciously uniform (std={zcr_std:.5f}). Natural voices show more variation."}
    elif zcr_std < 0.003:
        return {"zcr_std": round(zcr_std, 6), "is_suspicious": False, "ai_score": 30,
                "detail": f"Voice crossing rate is borderline (std={zcr_std:.5f}). Could be quiet environment or mild cloning."}
    else:
        return {"zcr_std": round(zcr_std, 6), "is_suspicious": False, "ai_score": 5,
                "detail": f"Voice crossing rate shows natural human variation (std={zcr_std:.5f})."}


def analyze_pitch_cv(y: np.ndarray, sr: int) -> dict:
    """
    Pitch Coefficient of Variation — second strongest detector.
    AI voices: CV ~0.02-0.04 (too regular — like a metronome)
    Human voices: CV ~0.09-0.14 (natural pitch wander)
    Threshold: 0.07 cleanly separates the two groups.
    """
    FRAME, HOP = 1024, 256
    pitch_vals = []
    n_frames = (len(y) - FRAME) // HOP
    min_lag, max_lag = sr//500, sr//70

    for i in range(0, n_frames, 2):
        frame = y[i*HOP: i*HOP+FRAME]
        if len(frame) < FRAME or np.max(np.abs(frame)) < 0.01:
            continue
        corr = np.correlate(frame, frame, mode='full')[FRAME-1:]
        d = np.diff(corr)
        starts = np.where((d[:-1] < 0) & (d[1:] >= 0))[0]
        valid = starts[(starts >= min_lag) & (starts <= max_lag)]
        if len(valid) > 0:
            freq = sr / (valid[0] + 1)
            if 70 < freq < 500:
                pitch_vals.append(freq)

    if len(pitch_vals) < 10:
        return {"is_suspicious": False, "ai_score": 25, "pitch_cv": 0,
                "detail": "Insufficient pitch data for reliable analysis."}

    pa = np.array(pitch_vals)
    cv = float(np.std(pa) / (np.mean(pa) + 1e-6))

    if cv < 0.05:
        return {"pitch_cv": round(cv, 4), "is_suspicious": True, "ai_score": 85,
                "detail": f"Pitch variation CV={cv:.4f} is far below human range (>0.08). Typical of TTS/cloned voice."}
    elif cv < 0.07:
        return {"pitch_cv": round(cv, 4), "is_suspicious": True, "ai_score": 55,
                "detail": f"Pitch variation CV={cv:.4f} is suspiciously regular. Borderline synthetic."}
    elif cv < 0.09:
        return {"pitch_cv": round(cv, 4), "is_suspicious": False, "ai_score": 20,
                "detail": f"Pitch variation CV={cv:.4f} is slightly monotone but within acceptable human range."}
    else:
        return {"pitch_cv": round(cv, 4), "is_suspicious": False, "ai_score": 5,
                "detail": f"Pitch variation CV={cv:.4f} shows natural human expression."}


def analyze_pause_regularity(y: np.ndarray, sr: int) -> dict:
    """
    Pause interval standard deviation.
    AI voices: std ~10ms (mechanical timing)
    Human voices: std ~34-50ms (natural rhythm)
    Threshold: 20ms
    """
    FRAME, HOP = 512, 256
    n_frames = (len(y) - FRAME) // HOP
    rms_vals = []

    for i in range(n_frames):
        frame = y[i*HOP: i*HOP+FRAME]
        if len(frame) < FRAME:
            break
        rms_vals.append(np.sqrt(np.mean(frame**2)))

    if len(rms_vals) < 10:
        return {"is_suspicious": False, "ai_score": 5, "detail": "Too short to analyze pause patterns."}

    rms = np.array(rms_vals)
    threshold = np.percentile(rms, 25)
    in_speech = rms >= threshold
    transitions = np.diff(in_speech.astype(int))
    speech_ends = np.where(transitions == -1)[0]
    speech_starts = np.where(transitions == 1)[0]

    gaps_ms = []
    for end_idx in speech_ends:
        next_starts = speech_starts[speech_starts > end_idx]
        if len(next_starts) > 0:
            gap_ms = (next_starts[0] - end_idx) * HOP / sr * 1000
            if gap_ms > 30:
                gaps_ms.append(gap_ms)

    if len(gaps_ms) < 2:
        return {"is_suspicious": False, "ai_score": 5, "detail": "Insufficient pauses for analysis."}

    gap_std = float(np.std(gaps_ms))
    gap_mean = float(np.mean(gaps_ms))

    if gap_std < 15:
        return {"gap_std_ms": round(gap_std, 1), "gap_mean_ms": round(gap_mean, 1),
                "is_suspicious": True, "ai_score": 80,
                "detail": f"Pause intervals are robotically consistent (std={gap_std:.1f}ms). AI voices use mechanical timing."}
    elif gap_std < 22:
        return {"gap_std_ms": round(gap_std, 1), "gap_mean_ms": round(gap_mean, 1),
                "is_suspicious": True, "ai_score": 45,
                "detail": f"Pause timing is somewhat regular (std={gap_std:.1f}ms). Human pauses typically vary by >30ms."}
    else:
        return {"gap_std_ms": round(gap_std, 1), "gap_mean_ms": round(gap_mean, 1),
                "is_suspicious": False, "ai_score": 5,
                "detail": f"Pause variation (std={gap_std:.1f}ms) is consistent with natural human speech."}


def analyze_spectral_complexity(y: np.ndarray, sr: int) -> dict:
    """Spectral energy variance — supporting signal (10% weight)"""
    FRAME, HOP = 1024, 512
    spec_vars = []
    n_frames = (len(y) - FRAME) // HOP

    for i in range(n_frames):
        frame = y[i*HOP: i*HOP+FRAME]
        if len(frame) < FRAME:
            break
        windowed = frame * np.hanning(FRAME)
        spec = np.abs(np.fft.rfft(windowed))
        spec_vars.append(float(np.var(spec)))

    if not spec_vars:
        return {"is_suspicious": False, "ai_score": 10}

    svc = float(np.std(spec_vars) / (np.mean(spec_vars) + 1e-6))

    if svc < 0.20:
        return {"spectral_cv": round(svc, 4), "is_suspicious": True, "ai_score": 60,
                "detail": f"Spectral energy is too uniform across frames (CV={svc:.3f}). Suggests synthesized audio."}
    else:
        return {"spectral_cv": round(svc, 4), "is_suspicious": False, "ai_score": 5,
                "detail": f"Spectral complexity (CV={svc:.3f}) shows natural speech variation."}


# ─────────────────────────────────────────────────────
# MASTER FUNCTION
# Weights: ZCR=40%, Pitch=35%, Pause=15%, Spectral=10%
# ─────────────────────────────────────────────────────

async def analyze_voice(audio_bytes: bytes) -> dict:
    start_time = time.time()
    evidence = []
    weighted_scores = []

    try:
        y, sr = load_audio(audio_bytes)
    except ValueError as e:
        return {
            "verdict": "ERROR", "fraud_score": 0, "confidence_level": "LOW",
            "evidence": [{"type": "error", "title": "Audio Load Failed",
                          "detail": str(e), "severity": "INFO"}],
            "processing_time_ms": 100, "scan_type": "voicescam"
        }

    # ── ZCR Variance (40%) ──
    try:
        zcr = analyze_zcr_variance(y, sr)
        weighted_scores.append(zcr["ai_score"] * 0.40)
        evidence.append({
            "type": "zcr_variance",
            "title": "Unnatural Voice Texture" if zcr["is_suspicious"] else "Voice Texture Natural",
            "detail": zcr["detail"],
            "severity": "HIGH" if zcr["ai_score"] >= 80 else ("MEDIUM" if zcr["ai_score"] >= 50 else "CLEAR")
        })
    except Exception:
        weighted_scores.append(20 * 0.40)

    # ── Pitch CV (35%) ──
    try:
        pitch = analyze_pitch_cv(y, sr)
        weighted_scores.append(pitch["ai_score"] * 0.35)
        evidence.append({
            "type": "pitch_regularity",
            "title": "Abnormal Pitch Regularity" if pitch["is_suspicious"] else "Natural Pitch Variation",
            "detail": pitch["detail"],
            "severity": "HIGH" if pitch["ai_score"] >= 70 else ("MEDIUM" if pitch["ai_score"] >= 40 else "CLEAR")
        })
    except Exception:
        weighted_scores.append(20 * 0.35)

    # ── Pause Regularity (15%) ──
    try:
        pause = analyze_pause_regularity(y, sr)
        weighted_scores.append(pause["ai_score"] * 0.15)
        if pause["is_suspicious"]:
            evidence.append({
                "type": "pause_patterns",
                "title": "Mechanical Pause Pattern",
                "detail": pause["detail"],
                "severity": "MEDIUM"
            })
        else:
            evidence.append({
                "type": "pause_patterns",
                "title": "Natural Pause Timing",
                "detail": pause["detail"],
                "severity": "CLEAR"
            })
    except Exception:
        weighted_scores.append(10 * 0.15)

    # ── Spectral Complexity (10%) ──
    try:
        spectral = analyze_spectral_complexity(y, sr)
        weighted_scores.append(spectral["ai_score"] * 0.10)
        if spectral["is_suspicious"]:
            evidence.append({
                "type": "spectral_complexity",
                "title": "Unnatural Spectral Pattern",
                "detail": spectral["detail"],
                "severity": "MEDIUM"
            })
    except Exception:
        weighted_scores.append(10 * 0.10)

    final_score = round(sum(weighted_scores), 1)

    if final_score >= 60:
        verdict = "FAKE"
        confidence = "CRITICAL" if final_score >= 80 else "HIGH"
    elif final_score >= 38:
        verdict = "SUSPICIOUS"
        confidence = "MEDIUM"
    else:
        verdict = "SAFE"
        confidence = "HIGH"

    return {
        "verdict": verdict,
        "fraud_score": final_score,
        "confidence_level": confidence,
        "evidence": evidence,
        "processing_time_ms": int((time.time() - start_time) * 1000),
        "scan_type": "voicescam"
    }