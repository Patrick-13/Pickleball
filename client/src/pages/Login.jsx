import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/login", { email, password });
      login(data.token, data.user, data.player);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--court)" }}>
      <div className="card" style={{ width: 380 }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Welcome back</h1>
        <p style={{ color: "var(--ink-soft)", marginTop: 0, marginBottom: 24, fontSize: 14 }}>Log in to see your game.</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-accent btn-block" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
        </form>
        <p style={{ fontSize: 13, marginTop: 20, textAlign: "center", color: "var(--ink-soft)" }}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
