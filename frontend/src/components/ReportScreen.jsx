import React, { useState } from 'react';

export default function ReportScreen({ onBack }) {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Report submitted successfully! File ID: ${Math.floor(Math.random() * 100000)}`);
        onBack();
    };

    return (
        <div style={{ padding: '20px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>
                    ←
                </button>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Report Incident</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card">
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Incident Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        placeholder="e.g. Received fake GPay text"
                        style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                    />
                </div>

                <div className="card">
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Detailed Description</label>
                    <textarea
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        required
                        rows={5}
                        placeholder="Please describe what happened..."
                        style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', resize: 'none' }}
                    />
                </div>

                <button type="submit" className="btn-primary">
                    Submit to Cyber Cell
                </button>
            </form>
        </div>
    );
}
