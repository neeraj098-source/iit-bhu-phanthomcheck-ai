import React, { useState, useRef } from 'react';
import { useScan } from '../hooks/useScan';
import ScanningScreen from './ScanningScreen';
import ResultScreen from './ResultScreen';

export default function FakePayScanner({ onBack }) {
    const { scan, result, loading, error, progress, reset, runDemo, report } = useScan("fakepay");
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    if (loading) return <ScanningScreen progress={progress} scanType="fakepay" />;
    if (result) return <ResultScreen result={result} onBack={reset} onReport={(id) => report(id, "User reported FakePay")} />;

    const handleFileSelect = (file) => {
        if (!file) return;
        setSelectedFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    return (
        <div style={{ padding: '20px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button className="btn-ghost" style={{ width: '40px', height: '40px', padding: 0, marginRight: '16px' }} onClick={onBack}>
                    ←
                </button>
                <h2 style={{ fontSize: '20px', margin: 0 }}>FakePay Detector</h2>
            </div>

            <div
                style={{
                    border: `2px ${dragOver ? 'solid' : 'dashed'} var(--accent)`,
                    borderRadius: '16px',
                    background: dragOver ? 'rgba(0,245,160,0.1)' : 'var(--bg-card)',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '16px'
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                />

                {preview ? (
                    <img src={preview} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px' }} />
                ) : (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--accent)' }}>📥</div>
                        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Drop UPI Screenshot Here</p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Supports PhonePe, GPay, Paytm, BHIM</p>
                    </>
                )}
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>
                Supported formats: JPEG, PNG, WEBP (Max 10MB)
            </p>

            {error && (
                <div style={{ background: 'rgba(255,59,59,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                    className="btn-primary"
                    disabled={!selectedFile}
                    onClick={() => scan(selectedFile)}
                >
                    Scan Screenshot
                </button>
                <button className="btn-ghost" onClick={runDemo}>
                    Run Demo
                </button>
            </div>
        </div>
    );
}
