import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// same rules as the backend (authController.js)
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export default function RegisterPage() {
    const { user, register } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    if (user) return <Navigate to="/" replace />;

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        if (password.length < MIN_PASSWORD_LENGTH) return setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
        if (password.length > MAX_PASSWORD_LENGTH) return setError(`Password must be at most ${MAX_PASSWORD_LENGTH} characters.`);
        if (password !== confirm) return setError("Passwords do not match.");

        setLoading(true);
        try {
            await register(email.trim(), password);
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <form className="card auth-card" onSubmit={handleSubmit}>
                <h1>Create account</h1>
                <label>
                    Email
                    <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Password
                    <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <small className="muted">At least {MIN_PASSWORD_LENGTH} characters.</small>
                </label>
                <label>
                    Confirm password
                    <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </label>
                {error && <p className="error-text" role="alert">{error}</p>}
                <button className="button primary block" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
                <p className="muted">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    );
}
