import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "var(--ball)" : "var(--line)",
    fontWeight: 600,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    textDecoration: "none",
  });

  return (
    <header style={{ background: "var(--court)", padding: "16px 0" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "var(--line)", fontFamily: "var(--font-display)", fontSize: 18 }}>
          KITCHEN <span style={{ color: "var(--ball)" }}>LINE</span>
        </div>
        {user && (
          <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <NavLink to="/" style={linkStyle} end>Dashboard</NavLink>
            <NavLink to="/games/new" style={linkStyle}>Log Game</NavLink>
            <NavLink to="/leaderboard" style={linkStyle}>Leaderboard</NavLink>
            <NavLink to="/training" style={linkStyle}>Training</NavLink>
            <NavLink to="/paddles" style={linkStyle}>Paddles</NavLink>
            <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
            <button
              className="btn btn-outline"
              style={{ borderColor: "var(--line)", color: "var(--line)", padding: "8px 14px" }}
              onClick={() => { logout(); navigate("/login"); }}
            >
              Log out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
