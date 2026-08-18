import { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Leaderboard() {
  const { player } = useAuth();
  const [rows, setRows] = useState([]);
  const [sortBy, setSortBy] = useState("appRating");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/leaderboard?sortBy=${sortBy}`);
        setRows(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load leaderboard");
      }
    }
    load();
  }, [sortBy]);

  const medalFor = (rank) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null);

  return (
    <div className="container" style={{ padding: "32px 20px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 26 }}>Leaderboard</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`btn ${sortBy === "appRating" ? "btn-accent" : "btn-outline"}`} style={{ padding: "8px 16px", fontSize: 12 }} onClick={() => setSortBy("appRating")}>By Rating</button>
          <button className={`btn ${sortBy === "winRate" ? "btn-accent" : "btn-outline"}`} style={{ padding: "8px 16px", fontSize: 12 }} onClick={() => setSortBy("winRate")}>By Win Rate</button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "var(--court)", color: "var(--line)" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, textTransform: "uppercase" }}>Rank</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, textTransform: "uppercase" }}>Player</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, textTransform: "uppercase" }}>Rating</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, textTransform: "uppercase" }}>Win %</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, textTransform: "uppercase" }}>Games</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--ink-soft)" }}>No ranked players yet — log some games to appear here.</td></tr>
            )}
            {rows.map((r) => {
              const isMe = player && r.id === player._id;
              return (
                <tr key={r.id} style={{ borderTop: "1px solid var(--border)", background: isMe ? "#fbfbe8" : "transparent" }}>
                  <td className="mono" style={{ padding: "12px 16px" }}>{medalFor(r.rank) || `#${r.rank}`}</td>
                  <td style={{ padding: "12px 16px", fontWeight: isMe ? 700 : 500 }}>{r.name}{isMe ? " (you)" : ""}</td>
                  <td className="mono" style={{ padding: "12px 16px", textAlign: "right" }}>{r.appRating.toFixed(2)}</td>
                  <td className="mono" style={{ padding: "12px 16px", textAlign: "right" }}>{r.winRate}%</td>
                  <td className="mono" style={{ padding: "12px 16px", textAlign: "right" }}>{r.gamesPlayed}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
