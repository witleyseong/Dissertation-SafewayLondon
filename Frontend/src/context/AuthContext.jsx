import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);
const USER_KEY = "safeway_user";

function loadUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw && getToken() ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveUser(user) {
    try {
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
        else localStorage.removeItem(USER_KEY);
    } catch {
        // ignore, see setToken
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadUser);

    function logout() {
        setToken(null);
        saveUser(null);
        setUser(null);
    }

    // a 401 from any protected call logs the user out
    useEffect(() => {
        setUnauthorizedHandler(logout);
    }, []);

    async function login(email, password) {
        const result = await api.login(email, password);
        setToken(result.token);
        saveUser(result.user);
        setUser(result.user);
    }

    // the register endpoint doesn't return a token, so log in straight after
    async function register(email, password) {
        await api.register(email, password);
        await login(email, password);
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
