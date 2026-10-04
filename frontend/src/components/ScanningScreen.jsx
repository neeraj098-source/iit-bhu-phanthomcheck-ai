import React, { useState, useEffect } from 'react';

const MESSAGES = {
    fakepay: [
        "Analyzing pixel metadata...",
        "Checking font consistency...",
        "Running ELA forensics...",
        "Verifying amount field..."
    ],
    linkguard: [
        "Resolving domain...",
        "Checking VirusTotal database...",
        "Analyzing redirect chains...",
        "Scanning for lookalikes..."
    ],
    voicescam: [
        "Loading audio waveform...",
        "Analyzing pitch patterns...",
        "Checking MFCC variance...",
        "Detecting pause anomalies..."
    ]
};

export default function ScanningScreen({ progress, scanType }) {
    const [msgIndex, setMsgIndex] = useState(0);
    const messages = MESSAGES[scanType] || MESSAGES.fakepay;

    useEffect(() => {
        const timer = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length);
        }, 1500);
        return () => clearInterval(timer);
    }, [messages.length]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            {/* Animated Shield outline */}
            <div style={{
                position: 'relative', width: '120px', height: '140px',
                marginBottom: '40px'
            }}>
                {/* Outer rotating dashed ring */}
                <svg viewBox="0 0 100 100" style={{
                    position: 'absolute', top: '-10px', left: '-10px', width: '140px', height: '140px',
                    animation: 'spin 4s linear infinite'
                }}>
                    <circle cx="50" cy="50" r="48" fill="none" stroke="var(--accent)"
                        strokeWidth="1" strokeDasharray="5,5" opacity="0.5" />
                </svg>

                {/* Shield path base */}
                <svg viewBox="0 0 24 24" style={{
                    width: '100%', height: '100%', fill: 'none', stroke: 'var(--border)', strokeWidth: '1'
                }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>

                {/* Shield fill growing with progress */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, width: '100%',
                    height: `${progress}%`, overflow: 'hidden',
                    transition: 'height 0.3s'
                }}>
                    <svg viewBox="0 0 24 24" style={{
                        position: 'absolute', bottom: 0, width: '120px', height: '140px',
                        fill: 'var(--accent)', opacity: 0.2
                    }}>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </div>
            </div>

            <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '16px' }}>
                {Math.round(progress)}%
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '16px', minHeight: '20px' }}>
                {messages[msgIndex]}
            </div>

            <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
