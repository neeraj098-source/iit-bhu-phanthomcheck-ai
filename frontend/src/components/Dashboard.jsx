import React from 'react';
import { useStats } from '../hooks/useScan';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';

export default function Dashboard({ onNavigate }) {
    const { stats } = useStats();
    const { language, setLanguage, theme, setTheme, isMobileView, setIsMobileView } = useApp();
    const t = translations[language];

    const features = [
        { id: "fakepay", icon: "💳", title: t.fakePayDetector, subtitle: t.uploadUPI, badge: t.mostUsed },
        { id: "linkguard", icon: "🔗", title: t.linkGuard, subtitle: t.checkLink, badge: null },
        { id: "voicescam", icon: "🎙️", title: t.voiceScamShield, subtitle: t.detectAI, badge: "NEW" }
    ];

    return (
        <div style={{ padding: '20px', paddingBottom: '100px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>🛡️</span>
                    <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 700, letterSpacing: '-0.5px', color: theme === 'dark' ? 'white' : '#0A0E1A' }}>{t.phantomCheck}</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Language Trigger */}
                    <button
                        onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        {language.toUpperCase()}
                    </button>

                    {/* Desktop/Mobile View Trigger */}
                    <button
                        onClick={() => setIsMobileView(!isMobileView)}
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                        {isMobileView ? "🖥️" : "📱"}
                    </button>

                    {/* Theme Trigger */}
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>

                    <button style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                        🔔
                    </button>
                    <button onClick={() => onNavigate('settings')} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                        ⚙️
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', margin: '0 0 8px 0', lineHeight: 1.2, color: theme === 'dark' ? 'white' : '#0A0E1A' }}>{t.whatCheck}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>{t.resultsIn}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                {features.map(f => (
                    <div
                        key={f.id}
                        className="card"
                        style={{ display: 'flex', alignItems: 'center', padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                        onClick={() => onNavigate(f.id)}
                    >
                        <div style={{ fontSize: '32px', marginRight: '16px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                            {f.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {f.title}
                                {f.badge && <span style={{ background: 'var(--accent)', color: '#000', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{f.badge}</span>}
                            </h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>{f.subtitle}</p>
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>➔</div>
                    </div>
                ))}
            </div>

            <div>
                <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>NETWORK STATS TODAY</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div className="card" style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                            {stats.scans_today?.toLocaleString() || '-'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scans Today</div>
                    </div>
                    <div className="card" style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
                            ₹{stats.money_protected_lakhs || '-'}L
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Saved</div>
                    </div>
                    <div className="card" style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                            3 sec
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avg Time</div>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Navigation */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: theme === 'dark' ? 'rgba(10, 14, 26, 0.9)' : 'rgba(243, 244, 246, 0.9)', backdropFilter: 'blur(10px)',
                borderTop: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-around', padding: '16px 20px 24px'
            }}>
                {/* Mobile viewport sizing assumed */}
                <div style={{ textAlign: 'center', cursor: 'pointer', color: 'var(--accent)' }} onClick={() => onNavigate('home')}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏠</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{t.home}</div>
                </div>
                <div style={{ textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => onNavigate('history')}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>📋</div>
                    <div style={{ fontSize: '10px' }}>{t.history}</div>
                </div>
                <div style={{ textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => onNavigate('report')}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>🚩</div>
                    <div style={{ fontSize: '10px' }}>Report</div>
                </div>
                <div style={{ textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => onNavigate('settings')}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>⚙️</div>
                    <div style={{ fontSize: '10px' }}>Settings</div>
                </div>
            </div>
        </div>
    );
}
