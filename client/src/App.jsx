import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import NewGame from "./pages/NewGame.jsx";
import Profile from "./pages/Profile.jsx";
import TrainingPlan from "./pages/TrainingPlan.jsx";
import PaddleRecommendations from "./pages/PaddleRecommendations.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { user } = useAuth();
  return (
    <div className="app-shell">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/games/new" element={<ProtectedRoute><NewGame /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/training" element={<ProtectedRoute><TrainingPlan /></ProtectedRoute>} />
        <Route path="/paddles" element={<ProtectedRoute><PaddleRecommendations /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
