import React, { useEffect, useState } from 'react';
import { getVerdictDisplay } from '../api/phantomcheck';

export default function FraudGauge({ score, verdict }) {
    const [offset, setOffset] = useState(339.292); // 2 * PI * 54
    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        // Animate to score
        setTimeout(() => {
            const loadOffset = circumference - (score / 100) * circumference;
            setOffset(loadOffset);
        }, 100);
    }, [score, circumference]);

    let color = 'var(--safe)';
    if (score >= 65) color = 'var(--danger)';
    else if (score >= 40) color = 'var(--warning)';

    const display = getVerdictDisplay(verdict);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                <svg fill="none" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        stroke="var(--border)"
                        strokeWidth="8"
                    />
                    <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        stroke={color}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFF' }}>
                        {score}<span style={{ fontSize: '16px' }}>%</span>
                    </span>
                </div>
            </div>
            <div style={{
                marginTop: '12px',
                color: display.color,
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '1px'
            }}>
                {display.label}
            </div>
        </div>
    );
}
