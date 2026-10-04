import React, { useState } from 'react';
import { useHistory, useStats } from '../hooks/useScan';
import { getVerdictDisplay, getSeverityColor } from '../api/phantomcheck';

export default function ScanHistory({ onBack }) {
    const [activeTab, setActiveTab] = useState('All');

    const filters = {
        scan_type: activeTab === 'Links' ? 'linkguard' : 'all',
        verdict: activeTab === 'Fake' ? 'FAKE' : activeTab === 'Safe' ? 'SAFE' : 'all'
    };

    const { history, loading } = useHistory(filters);
    const { userStats } = useStats();

    const getIcon = (type) => {
        switch (type) {
            case 'fakepay': return '💳';
            case 'linkguard': return '🔗';
            case 'voicescam': return '🎙️';
            default: return '📄';
        }
    };

    const getTimeAgo = (dateStr) => {
        const min = Math.round((new Date() - new Date(dateStr)) / 60000);
        if (min < 60) return `${min} mins ago`;
        const hrs = Math.round(min / 60);
        if (hrs < 24) return `${hrs} hrs ago`;
        return `${Math.round(hrs / 24)} days ago`;
    };

    return (
        <div style={{ padding: '20px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button className="btn-ghost" style={{ width: '40px', height: '40px', padding: 0, marginRight: '16px' }} onClick={onBack}>
                    ←
                </button>
                <h2 style={{ fontSize: '20px', margin: 0 }}>Scan History</h2>
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '8px' }}>
                {['All', 'Fake', 'Safe', 'Links'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '6px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                            background: activeTab === tab ? 'var(--accent)' : 'var(--bg-card)',
                            color: activeTab === tab ? '#000' : 'var(--text-muted)',
                            fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{userStats.total_scans || 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Scans</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--danger)' }}>{userStats.scams_blocked || 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scams Blocked</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)' }}>₹{userStats.money_protected_estimate || 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Money Protected</div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>Loading history...</div>
            ) : history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: '64px', opacity: 0.2, marginBottom: '16px' }}>🛡️</div>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>No scans yet. Stay safe out there.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '80px' }}>
                    {history.map(scan => {
                        const display = getVerdictDisplay(scan.verdict);
                        return (
                            <div key={scan.id} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ fontSize: '24px' }}>{getIcon(scan.scan_type)}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ color: 'white', fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {scan.input_filename || scan.input_url || 'Voice Recording'}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                                        {getTimeAgo(scan.created_at)}
                                    </div>
                                </div>
                                <div>
                                    <span className="verdict-badge" style={{ background: display.bgColor, color: display.color }}>
                                        {scan.verdict}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
