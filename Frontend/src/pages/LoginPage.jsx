import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    if (user) return <Navigate to="/" replace />;

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email.trim(), password);
            navigate(location.state?.from?.pathname || "/", { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <form className="card auth-card" onSubmit={handleSubmit}>
                <h1>Log in</h1>
                <p className="muted">Compare London routes by historical recorded-crime exposure.</p>
                <label>
                    Email
                    <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Password
                    <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                {error && <p className="error-text" role="alert">{error}</p>}
                <button className="button primary block" disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>
                <p className="muted">
                    No account yet? <Link to="/register">Create one</Link>
                </p>
            </form>
        </div>
    );
}
