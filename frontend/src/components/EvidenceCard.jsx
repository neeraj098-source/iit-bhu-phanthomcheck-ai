import React from 'react';
import { getSeverityColor } from '../api/phantomcheck';

export default function EvidenceCard({ evidence }) {
    const color = getSeverityColor(evidence.severity);

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderLeft: `4px solid ${color}`,
            borderBottom: '1px solid var(--border)',
            borderTop: '1px solid var(--border)',
            borderRight: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
        }}>
            <div style={{ fontSize: '20px', color }}>
                {evidence.severity === 'CLEAR' ? '✓' : '⚠'}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '15px' }}>{evidence.title}</h4>
                    <span className="verdict-badge" style={{ background: `${color}20`, color, fontSize: '10px' }}>
                        {evidence.severity}
                    </span>
                </div>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13px', lineHeight: 1.4 }}>
                    {evidence.detail}
                </p>
            </div>
        </div>
    );
}
