import React, { useState } from 'react';
import { useScan } from '../hooks/useScan';
import ScanningScreen from './ScanningScreen';
import ResultScreen from './ResultScreen';

export default function LinkGuard({ onBack }) {
    const { scan, result, loading, error, progress, reset, runDemo } = useScan("linkguard");
    const [url, setUrl] = useState('');

    if (loading) return <ScanningScreen progress={progress} scanType="linkguard" />;
    if (result) return <ResultScreen result={result} onBack={reset} />;

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setUrl(text);
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    };

    return (
        <div style={{ padding: '20px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button className="btn-ghost" style={{ width: '40px', height: '40px', padding: 0, marginRight: '16px' }} onClick={onBack}>
                    ←
                </button>
                <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔗 LinkGuard
                </h2>
            </div>

            <div style={{ background: 'rgba(255, 184, 0, 0.1)', borderLeft: '4px solid var(--warning)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--warning)', fontWeight: 600 }}>
                    ⚠ AI phishing links are rising 340% in India
                </p>
            </div>

            <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste suspicious link here..."
                    style={{
                        width: '100%',
                        background: 'var(--bg-card)',
                        border: '2px solid var(--border)',
                        padding: '16px 48px 16px 16px',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                    onClick={handlePaste}
                    style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '20px'
                    }}
                    title="Paste from clipboard"
                >
                    📋
                </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                {['sbi-secure-login.xyz', 'bit.ly/win-iphone', 'trai-kyc.tk'].map(example => (
                    <button
                        key={example}
                        onClick={() => setUrl(`https://${example}`)}
                        style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '999px',
                            padding: '6px 12px', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer'
                        }}
                    >
                        {example}
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>WHAT WE CHECK</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {['SSL Certificate', 'Domain Age', 'Malware DB', 'Redirect Chains', 'Lookalike Detection', 'Server Location'].map(feature => (
                        <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'white' }}>
                            <span style={{ color: 'var(--accent)' }}>✓</span> {feature}
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div style={{ background: 'rgba(255,59,59,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                    className="btn-primary"
                    disabled={url.length < 4}
                    onClick={() => scan(url)}
                >
                    Check This Link
                </button>
                <button className="btn-ghost" onClick={runDemo}>
                    Run Demo
                </button>
            </div>
        </div>
    );
}
