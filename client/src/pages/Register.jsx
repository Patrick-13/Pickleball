import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/auth/register", form);
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
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Create account</h1>
        <p style={{ color: "var(--ink-soft)", marginTop: 0, marginBottom: 24, fontSize: 14 }}>Start tracking your game.</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={set("name")} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set("email")} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set("password")} minLength={8} required />
          </div>
          <button className="btn btn-accent btn-block" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
        </form>
        <p style={{ fontSize: 13, marginTop: 20, textAlign: "center", color: "var(--ink-soft)" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
