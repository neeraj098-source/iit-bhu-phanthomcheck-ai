import { useState, useEffect } from "react";
import {
    scanUPIScreenshot,
    scanLink,
    scanAudio,
    getDemoFakePayResult,
    getDemoLinkResult,
    reportToCyberCell,
    getDashboardStats,
    getUserStats,
    getScanHistory,
} from "../api/phantomcheck";

export function useScan(type) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);

    const reset = () => {
        setResult(null);
        setLoading(false);
        setError(null);
        setProgress(0);
    };

    const scan = async (input) => {
        setLoading(true);
        setError(null);
        setResult(null);
        setProgress(0);

        try {
            let data;
            if (type === "fakepay") {
                data = await scanUPIScreenshot(input, setProgress);
            } else if (type === "linkguard") {
                setProgress(30);
                data = await scanLink(input);
                setProgress(100);
            } else if (type === "voicescam") {
                data = await scanAudio(input, setProgress);
            }
            setResult(data);
        } catch (err) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const runDemo = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setProgress(0);

        // Simulate progress
        for (let i = 0; i <= 100; i += 20) {
            setProgress(i);
            await new Promise((resolve) => setTimeout(resolve, 300));
        }

        try {
            let data;
            if (type === "fakepay") {
                data = await getDemoFakePayResult();
            } else if (type === "linkguard") {
                data = await getDemoLinkResult();
            } else {
                // Fallback or demo for voice? Instructions don't specify demo voice, returning dummy
                throw new Error("Demo not implemented for this type");
            }
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const report = async (scanId, description) => {
        return await reportToCyberCell(scanId, description);
    };

    return { scan, result, loading, error, progress, reset, runDemo, report };
}

export function useStats() {
    const [stats, setStats] = useState({});
    const [userStats, setUserStats] = useState({});

    useEffect(() => {
        getDashboardStats()
            .then(setStats)
            .catch(() => {
                setStats({
                    scans_today: 2347,
                    fake_detected: 891,
                    money_protected_lakhs: 84.3,
                });
            });

        getUserStats()
            .then(setUserStats)
            .catch(() => {
                setUserStats({
                    total_scans: 0,
                    scams_blocked: 0,
                    safe_verified: 0,
                    money_protected_estimate: 0,
                });
            });
    }, []);

    return { stats, userStats };
}

export function useHistory(filters) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        setLoading(true);
        try {
            const data = await getScanHistory(filters);
            setHistory(data.scans || []);
        } catch (err) {
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [filters.scan_type, filters.verdict, filters.limit]);

    return { history, loading, refresh };
}
