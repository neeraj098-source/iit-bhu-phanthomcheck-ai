const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function getDeviceId() {
    let deviceId = sessionStorage.getItem("pc_device_id");
    if (!deviceId) {
        deviceId = "device_" + Math.random().toString(36).substring(2, 14) + "_" + Date.now();
        sessionStorage.setItem("pc_device_id", deviceId);
    }
    return deviceId;
}

async function apiFetch(endpoint, options = {}) {
    try {
        const res = await fetch(BASE_URL + endpoint, options);
        if (!res.ok) {
            let errorDetail = "Server error";
            try {
                const errorJson = await res.json();
                errorDetail = errorJson.detail || errorDetail;
            } catch (e) {
                // Ignore
            }
            throw new Error(errorDetail);
        }
        return await res.json();
    } catch (err) {
        if (
            err.name === 'TypeError' &&
            (err.message === 'Failed to fetch' ||
             err.message === 'Load failed' ||
             err.message.toLowerCase().includes('network') ||
             err.message.toLowerCase().includes('fetch'))
        ) {
            throw new Error(`Cannot connect to server at ${BASE_URL}. Please ensure the backend is running.`);
        }
        throw err;
    }
}

export async function scanUPIScreenshot(imageFile, onProgress) {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("device_id", getDeviceId());

    if (onProgress) onProgress(10);

    let currentProgress = 10;
    const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress > 85) currentProgress = 85;
        if (onProgress) onProgress(currentProgress);
    }, 400);

    try {
        const result = await apiFetch("/api/fakepay/scan", {
            method: "POST",
            body: formData,
        });
        clearInterval(progressInterval);
        if (onProgress) onProgress(100);
        return result;
    } catch (err) {
        clearInterval(progressInterval);
        throw err;
    }
}

export async function getDemoFakePayResult() {
    return await apiFetch("/api/fakepay/demo");
}

export async function scanLink(url) {
    return await apiFetch("/api/linkguard/scan", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, device_id: getDeviceId() }),
    });
}

export async function getDemoLinkResult() {
    return await apiFetch("/api/linkguard/demo");
}

export async function scanAudio(audioFile, onProgress) {
    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("device_id", getDeviceId());

    if (onProgress) onProgress(10);

    let currentProgress = 10;
    const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 8;
        if (currentProgress > 85) currentProgress = 85;
        if (onProgress) onProgress(currentProgress);
    }, 600);

    try {
        const result = await apiFetch("/api/voicescam/scan", {
            method: "POST",
            body: formData,
        });
        clearInterval(progressInterval);
        if (onProgress) onProgress(100);
        return result;
    } catch (err) {
        clearInterval(progressInterval);
        throw err;
    }
}

export async function getScanHistory(filters = {}) {
    const params = new URLSearchParams({
        device_id: getDeviceId(),
        limit: filters.limit || 20,
    });
    if (filters.scan_type && filters.scan_type !== "all") params.append("scan_type", filters.scan_type);
    if (filters.verdict && filters.verdict !== "all") params.append("verdict", filters.verdict);

    return await apiFetch(`/api/history/?${params.toString()}`);
}

export async function getScanDetail(scanId) {
    return await apiFetch(`/api/history/${scanId}`);
}

export async function reportToCyberCell(scanId, description) {
    const params = new URLSearchParams({
        device_id: getDeviceId(),
        description: description || "User reported this scan as highly suspicious."
    });
    return await apiFetch(`/api/history/report/${scanId}?${params.toString()}`, {
        method: "POST"
    });
}

export async function getDashboardStats() {
    return await apiFetch("/api/stats/");
}

export async function getUserStats() {
    return await apiFetch(`/api/stats/user/${getDeviceId()}`);
}

export function getVerdictDisplay(verdict) {
    switch (verdict) {
        case 'FAKE':
            return { label: "FAKE DETECTED", color: "#FF3B3B", bgColor: "#1A0000", icon: "⚠", message: "Do NOT accept this payment" };
        case 'SAFE':
            return { label: "VERIFIED SAFE", color: "#00C48C", bgColor: "#001A0E", icon: "✓", message: "This appears genuine" };
        case 'SUSPICIOUS':
            return { label: "SUSPICIOUS", color: "#FFB800", bgColor: "#1A1200", icon: "?", message: "Proceed with caution" };
        default:
            return { label: "SCAN ERROR", color: "#8B9AB0", bgColor: "#111827", icon: "!", message: "Could not complete analysis" };
    }
}

export function getSeverityColor(severity) {
    switch (severity) {
        case "CRITICAL": return "#FF3B3B";
        case "HIGH": return "#FF6B35";
        case "MEDIUM": return "#FFB800";
        case "LOW": return "#8B9AB0";
        case "CLEAR": return "#00C48C";
        case "INFO": return "#00F5A0";
        default: return "#8B9AB0";
    }
}
