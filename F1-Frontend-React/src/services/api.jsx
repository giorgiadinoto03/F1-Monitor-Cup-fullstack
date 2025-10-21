// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request(path, { params, method = "GET", body } = {}) {
    const url = new URL(path, API_URL);
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
        });
    }
    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
    }
    return res.json();
}

export const api = {
    getDrivers: (params) => request("/api/drivers/", { params }),
    getTeams: (params) => request("/api/teams/", { params }),
    getRaces: (params) => request("/api/races/", { params }),
    getNextRace: () => request("/api/races/next/"),
    getSessions: (params) => request("/api/sessions/", { params }),
    getResults: (params) => request("/api/results/", { params }),
};