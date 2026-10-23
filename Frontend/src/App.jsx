import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";
import HistoryPage from "./pages/HistoryPage";
import LoginPage from "./pages/LoginPage";
import NavigationPage from "./pages/NavigationPage";
import NotFoundPage from "./pages/NotFoundPage";
import PlannerPage from "./pages/PlannerPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
    return (
        <>
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
                    <Route path="/navigate" element={<ProtectedRoute><NavigationPage /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
        </>
    );
}
