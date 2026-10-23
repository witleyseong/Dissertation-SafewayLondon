// small fetch wrapper used by every API call

const BASE_URL = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "safeway_token";

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(token) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {
        // storage blocked (private mode), the session just won't survive a reload
    }
}

// called when the server says the token is not valid any more
let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
    onUnauthorized = handler;
}

async function request(path, { method = "GET", body, auth = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError("Could not reach the server. Is the backend running?", 0);
    }

    let data = null;
    try {
        data = await response.json();
    } catch {
        // empty or non-JSON body
    }

    if (!response.ok) {
        if (auth && response.status === 401) onUnauthorized();
        const message = data?.error || `Request failed (${response.status})`;
        throw new ApiError(message, response.status);
    }
    return data;
}

export const api = {
    register: (email, password) => request("/api/auth/register", { method: "POST", body: { email, password } }),
    login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
    planJourney: (from, to) => request("/api/journey", { method: "POST", body: { from, to }, auth: true }),
    history: () => request("/api/journey/history", { auth: true }),
    health: () => request("/api/health"),
};
