import React, { useState, useRef } from 'react';
import { useScan } from '../hooks/useScan';
import ScanningScreen from './ScanningScreen';
import ResultScreen from './ResultScreen';

export default function VoiceScam({ onBack }) {
    const { scan, result, loading, error, progress, reset } = useScan("voicescam");
    const [activeTab, setActiveTab] = useState("upload");
    const [recording, setRecording] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    if (loading) return <ScanningScreen progress={progress} scanType="voicescam" />;
    if (result) return <ResultScreen result={result} onBack={reset} />;

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
                setAudioFile(file);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setRecording(true);
        } catch (err) {
            console.error("Mic access denied", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    return (
        <div style={{ padding: '20px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button className="btn-ghost" style={{ width: '40px', height: '40px', padding: 0, marginRight: '16px' }} onClick={onBack}>
                    ←
                </button>
                <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎙️ VoiceScam Shield
                </h2>
            </div>

            <div style={{ background: 'rgba(255, 184, 0, 0.1)', borderLeft: '4px solid var(--warning)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--warning)', fontWeight: 600 }}>
                    ⚠ AI voice cloning scams increased 340% in India (2024)
                </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                <button
                    style={{
                        flex: 1, padding: '12px 0', background: 'transparent', border: 'none',
                        color: activeTab === 'upload' ? 'var(--accent)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'upload' ? '2px solid var(--accent)' : '2px solid transparent',
                        fontWeight: 600, fontSize: '15px', cursor: 'pointer'
                    }}
                    onClick={() => setActiveTab('upload')}
                >
                    Upload File
                </button>
                <button
                    style={{
                        flex: 1, padding: '12px 0', background: 'transparent', border: 'none',
                        color: activeTab === 'record' ? 'var(--accent)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'record' ? '2px solid var(--accent)' : '2px solid transparent',
                        fontWeight: 600, fontSize: '15px', cursor: 'pointer'
                    }}
                    onClick={() => setActiveTab('record')}
                >
                    Record Live
                </button>
            </div>

            {activeTab === 'upload' && (
                <div style={{
                    border: '2px dashed var(--accent)', borderRadius: '16px', background: 'var(--bg-card)',
                    minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '20px', cursor: 'pointer', marginBottom: '24px'
                }} onClick={() => document.getElementById('audio-upload').click()}>
                    <input
                        id="audio-upload"
                        type="file"
                        accept=".mp3,.wav,.ogg,.m4a"
                        style={{ display: 'none' }}
                        onChange={(e) => setAudioFile(e.target.files[0])}
                    />
                    <div style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--accent)' }}>🎵</div>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Drop Audio File Here</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                        {audioFile ? `Selected: ${audioFile.name}` : 'Supports MP3, WAV, OGG, M4A'}
                    </p>
                </div>
            )}

            {activeTab === 'record' && (
                <div style={{
                    borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                    minHeight: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '30px', marginBottom: '24px'
                }}>
                    <button
                        onClick={recording ? stopRecording : startRecording}
                        style={{
                            width: '80px', height: '80px', borderRadius: '50%', border: 'none',
                            background: recording ? 'transparent' : 'var(--danger)',
                            border: recording ? '4px solid var(--danger)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', marginBottom: '16px',
                            animation: recording ? 'pulse 1s infinite' : 'none',
                            color: 'white', fontSize: '32px'
                        }}
                    >
                        {recording ? '⏹' : '🎙️'}
                    </button>

                    <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '16px' }}>
                        {recording ? "Recording..." : audioFile ? "Saved! Select Analyze" : "00:00"}
                    </div>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                        Play the suspicious call near your phone
                    </p>
                </div>
            )}

            {error && (
                <div style={{ background: 'rgba(255,59,59,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            <button
                className="btn-primary"
                disabled={!audioFile}
                onClick={() => scan(audioFile)}
            >
                Analyze Audio
            </button>

            <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,59,59,0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(255,59,59,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,59,59,0); }
        }
      `}</style>
        </div>
    );
}
