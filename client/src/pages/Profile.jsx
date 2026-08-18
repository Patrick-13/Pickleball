import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

export default function Profile() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/players/me").then(({ data }) => setData(data)).catch((err) => setError(err.response?.data?.message || "Load failed"));
  }, []);

  async function updateField(key, value) {
    setSaving(true);
    setMsg("");
    try {
      const { data: player } = await api.patch("/players/me", { [key]: value });
      setData((d) => ({ ...d, player: { ...d.player, ...player } }));
      setMsg("Saved");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="container" style={{ padding: 40 }}><div className="error-banner">{error}</div></div>;
  if (!data) return <div className="container" style={{ padding: 40 }}>Loading…</div>;

  const { player, levelUp } = data;

  return (
    <div className="container" style={{ padding: "32px 20px 60px", maxWidth: 640 }}>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>{player.user?.name}'s Profile</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, marginBottom: 16 }}>Play Details</h2>
        <div className="field">
          <label>Preferred Hand</label>
          <select value={player.preferredHand} onChange={(e) => updateField("preferredHand", e.target.value)}>
            <option value="RIGHT">Right</option>
            <option value="LEFT">Left</option>
          </select>
        </div>
        <div className="field">
          <label>Play Style</label>
          <select value={player.playStyle} onChange={(e) => updateField("playStyle", e.target.value)}>
            <option value="BALANCED">Balanced</option>
            <option value="AGGRESSIVE">Aggressive</option>
            <option value="DEFENSIVE">Defensive</option>
            <option value="COUNTER_ATTACKER">Counter-Attacker</option>
          </select>
        </div>
        {msg && <p style={{ color: "var(--success)", fontSize: 13 }}>{msg}</p>}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, marginBottom: 16 }}>Ratings</h2>
        <div className="stat-row"><div className="stat-label">App Rating</div><div className="mono">{player.ratings.appRating.toFixed(2)}</div></div>
        <div className="stat-row"><div className="stat-label">Singles</div><div className="mono">{player.ratings.singles.toFixed(2)}</div></div>
        <div className="stat-row"><div className="stat-label">Doubles</div><div className="mono">{player.ratings.doubles.toFixed(2)}</div></div>
        <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 12 }}>
          App Rating is derived from your recorded games and is separate from external systems like DUPR.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 15, marginBottom: 16 }}>Training Plan</h2>
        {levelUp.length === 0 ? (
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Log more games with performance stats to unlock a training plan.</p>
        ) : (
          levelUp.map((item) => (
            <div key={item.key} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <span className={`pill pill-${item.priority.toLowerCase()}`}>{item.priority} PRIORITY</span>
              <div style={{ fontWeight: 700, marginTop: 8, fontSize: 15 }}>{item.skill}</div>
              <div className="mono" style={{ fontSize: 13, color: "var(--ink-soft)" }}>Current {item.current}% → Target {item.target}%</div>
            </div>
          ))
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Link to="/training" className="btn btn-outline" style={{ borderColor: "var(--ink)", fontSize: 12, padding: "8px 14px" }}>Full training plan</Link>
          <Link to="/paddles" className="btn btn-outline" style={{ borderColor: "var(--ink)", fontSize: 12, padding: "8px 14px" }}>Paddle recommendations</Link>
        </div>
      </div>
    </div>
  );
}
