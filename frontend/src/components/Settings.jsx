import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';

export default function Settings({ onBack }) {
    const { language, setLanguage, theme, setTheme } = useApp();
    const t = translations[language];

    return (
        <div style={{ padding: '20px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>
                    ←
                </button>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Settings</h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Language</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Choose your preferred language</div>
                    </div>
                    <button
                        onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold' }}>
                        {language === "en" ? "English" : "हिंदी"}
                    </button>
                </div>

                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Theme</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Light or Dark mode appearance</div>
                    </div>
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                        {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
                    </button>
                </div>

                <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    PhantomCheck AI v1.0.0
                </div>
            </div>
        </div>
    );
}
