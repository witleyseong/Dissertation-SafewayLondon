import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// sends the user to the login page if there is no session
export default function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    return children;
}
