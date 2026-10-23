import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HealthPill from "./HealthPill";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <NavLink to="/" className="brand">
                    <img src="/favicon.svg" alt="" width="26" height="26" />
                    SafeWay London
                </NavLink>
                <HealthPill />
                <nav className="nav-links">
                    {user && <NavLink to="/" end>Plan</NavLink>}
                    {user && <NavLink to="/history">History</NavLink>}
                    <NavLink to="/about">About the data</NavLink>
                    <NavLink to="/help">Help</NavLink>
                    {user ? (
                        <button className="link-button" onClick={handleLogout} title={user.email}>
                            Log out
                        </button>
                    ) : (
                        <NavLink to="/login">Log in</NavLink>
                    )}
                </nav>
            </div>
        </header>
    );
}
