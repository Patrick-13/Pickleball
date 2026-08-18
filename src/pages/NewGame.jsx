import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";

// Implements doc section 12: open play should be fast. Step 1-4 (players + score)
// are required; advanced stats are an optional, collapsed "Add Performance Stats" step.
export default function NewGame() {
  const [allPlayers, setAllPlayers] = useState([]);
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [format, setFormat] = useState("DOUBLES");
  const [location, setLocation] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/players/search").then(({ data }) => setAllPlayers(data)).catch(() => {});
  }, []);

  function toggle(list, setList, id) {
    setList((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (teamA.length === 0 || teamB.length === 0) return setError("Pick at least one player per team");
    if (scoreA === "" || scoreB === "" || Number(scoreA) === Number(scoreB)) return setError("Enter a valid, non-tied score");

    setBusy(true);
    try {
      await api.post("/games", {
        sessionType: "OPEN_PLAY",
        format,
        location,
        teamA,
        teamB,
        scoreA: Number(scoreA),
        scoreB: Number(scoreB),
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save game");
    } finally {
      setBusy(false);
    }
  }

  const PlayerPicker = ({ selected, onToggle, exclude }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {allPlayers.filter((p) => !exclude.includes(p._id)).map((p) => (
        <button
          type="button"
          key={p._id}
          onClick={() => onToggle(p._id)}
          className="btn"
          style={{
            padding: "8px 14px", fontSize: 13, textTransform: "none",
            background: selected.includes(p._id) ? "var(--ball)" : "#fff",
            color: "var(--ink)", borderColor: selected.includes(p._id) ? "var(--ball)" : "var(--border)",
          }}
        >
          {p.user?.name || "Player"}
        </button>
      ))}
    </div>
  );

  return (
    <div className="container" style={{ padding: "32px 20px 60px", maxWidth: 640 }}>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Log Open Play</h1>
      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="field">
            <label>Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="SINGLES">Singles</option>
              <option value="DOUBLES">Doubles</option>
              <option value="MIXED_DOUBLES">Mixed Doubles</option>
            </select>
          </div>
          <div className="field">
            <label>Location (optional)</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Davao Pickleball Club" />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Team A</h2>
          <PlayerPicker selected={teamA} onToggle={(id) => toggle(teamA, setTeamA, id)} exclude={teamB} />
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Team B</h2>
          <PlayerPicker selected={teamB} onToggle={(id) => toggle(teamB, setTeamB, id)} exclude={teamA} />
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Score</h2>
          <div style={{ display: "flex", gap: 16 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Team A</label>
              <input type="number" min="0" value={scoreA} onChange={(e) => setScoreA(e.target.value)} required />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Team B</label>
              <input type="number" min="0" value={scoreB} onChange={(e) => setScoreB(e.target.value)} required />
            </div>
          </div>
        </div>

        <button type="button" className="btn btn-outline" style={{ marginBottom: 16 }} onClick={() => setShowAdvanced((s) => !s)}>
          {showAdvanced ? "− Hide Performance Stats" : "+ Add Performance Stats"}
        </button>
        {showAdvanced && (
          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              Advanced per-shot stats (serve, dink, third-shot, etc.) are optional here — the API
              supports an <code>advancedStats</code> array on this same request; wire up per-player
              counters in this panel when you're ready to track that level of detail.
            </p>
          </div>
        )}

        <button className="btn btn-accent btn-block" disabled={busy}>{busy ? "Saving…" : "Save Game"}</button>
      </form>
    </div>
  );
}
