import React from 'react';
import FraudGauge from './FraudGauge';
import EvidenceCard from './EvidenceCard';
import { getVerdictDisplay } from '../api/phantomcheck';

export default function ResultScreen({ result, onBack, onReport }) {
    if (!result) return null;

    const display = getVerdictDisplay(result.verdict);

    return (
        <div style={{ paddingBottom: '100px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* TOP SECTION */}
            <div style={{
                background: display.bgColor,
                padding: '60px 20px 40px',
                textAlign: 'center',
                borderBottom: `1px solid ${display.color}30`
            }}>
                <div style={{
                    fontSize: '48px', color: display.color, marginBottom: '16px',
                    animation: 'pulse 2s infinite'
                }}>
                    {display.icon}
                </div>
                <h1 style={{ color: display.color, fontSize: '28px', marginBottom: '8px' }}>
                    {display.message}
                </h1>
                
                {result.secure && (
                    <div style={{
                        marginTop: '12px',
                        marginBottom: '16px',
                        display: 'inline-block',
                        padding: '10px 24px',
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${result.secure === 'Yes' ? '#00C48C' : '#FF3B3B'}50`,
                        borderRadius: '30px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: result.secure === 'Yes' ? '#00C48C' : '#FF3B3B',
                        backdropFilter: 'blur(10px)'
                    }}>
                        SECURE: {result.secure.toUpperCase()}
                    </div>
                )}

                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Analyzed in {result.processing_time_ms}ms
                </p>
            </div>

            <div style={{ padding: '20px' }}>
                {/* FRAUD SCORE */}
                <div className="card" style={{ marginTop: '-40px', position: 'relative', zIndex: 10, textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '10px' }}>FRAUD SCORE</h3>
                    <FraudGauge score={result.fraud_score} verdict={result.verdict} />
                    <div style={{ marginTop: '10px' }}>
                        <span className="verdict-badge" style={{ background: '#1E2D40', color: 'white' }}>
                            CONFIDENCE {result.confidence_level}
                        </span>
                    </div>
                </div>

                {/* OCR FIELDS VERIFICATION */}
                {result.ocr_fields && Object.keys(result.ocr_fields).length > 0 && (
                    <div className="card" style={{ marginTop: '20px', borderLeft: '4px solid #8B9AB0' }}>
                        <h3 style={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>
                            Fields verified from screenshot:
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {Object.entries(result.ocr_fields).map(([key, value]) => {
                                // Determine if this field passed or failed by checking evidence
                                const isFail = result.evidence?.some(e => e.type === `ocr_${key}` && e.severity !== 'CLEAR' && e.severity !== 'INFO');
                                const isPass = result.evidence?.some(e => e.type === `ocr_${key}` && e.severity === 'CLEAR');
                                const icon = isFail ? '❌' : (isPass ? '✅' : '➖');

                                return (
                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{key.toUpperCase()}:</span>
                                        <span style={{ color: isFail ? 'var(--danger)' : 'white' }}>
                                            {String(value)} <span style={{ marginLeft: '4px' }}>{icon}</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* AI EXPLANATION */}
                {result.ai_explanation && (
                    <div className="card" style={{ marginTop: '20px', borderLeft: '4px solid var(--accent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '20px' }}>🤖</span>
                            <h3 style={{ fontSize: '14px', color: 'white', margin: 0 }}>PhantomCheck AI Analysis</h3>
                        </div>
                        <p style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.5, margin: 0 }}>
                            {result.ai_explanation}
                        </p>
                    </div>
                )}

                {/* EVIDENCE */}
                <div style={{ marginTop: '30px' }}>
                    <h3 style={{ fontSize: '16px', color: 'white', marginBottom: '16px' }}>
                        Evidence Found ({result.evidence?.length || 0})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {result.evidence?.map((ev, i) => (
                            <div key={i} style={{ animation: `slideUp 0.4s ease forwards`, animationDelay: `${i * 0.1}s`, opacity: 0, transform: 'translateY(20px)' }}>
                                <EvidenceCard evidence={ev} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ACTIONS */}
                <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {result.verdict === 'FAKE' && (
                        <>
                            <button className="btn-primary" style={{ background: 'var(--danger)', color: 'white' }}
                                onClick={() => onReport && onReport(result.scan_id)}>
                                Report to Cyber Cell
                            </button>
                            <button className="btn-ghost" onClick={() => navigator.clipboard.writeText(`WARNING: PhantomCheck AI detected a ${result.fraud_score}% scam risk. Do not trust.`)}>
                                Share Warning
                            </button>
                        </>
                    )}
                    <button className="btn-ghost" onClick={onBack}>
                        Scan Another
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scan ID: {result.scan_id}</span>
                </div>
            </div>

            <style>{`
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
}
