import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatBar from "../components/StatBar.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [games, setGames] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data: profile } = await api.get("/players/me");
        setData(profile);
        const { data: recentGames } = await api.get(`/games/player/${profile.player._id}`);
        setGames(recentGames.slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || "Could not load your dashboard");
      }
    }
    load();
  }, []);

  if (error) return <div className="container" style={{ padding: 40 }}><div className="error-banner">{error}</div></div>;
  if (!data) return <div className="container" style={{ padding: 40 }}>Loading…</div>;

  const { player, stats, levelUp } = data;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="container" style={{ padding: "32px 20px 60px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>{greeting}, {user?.name?.split(" ")[0]}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="card-dark">
          <div style={{ fontSize: 12, textTransform: "uppercase", opacity: 0.7, letterSpacing: "0.05em" }}>App Rating</div>
          <div className="mono" style={{ fontSize: 34, color: "var(--ball)" }}>{player.ratings.appRating.toFixed(2)}</div>
        </div>
        <div className="card-dark">
          <div style={{ fontSize: 12, textTransform: "uppercase", opacity: 0.7, letterSpacing: "0.05em" }}>Win Rate</div>
          <div className="mono" style={{ fontSize: 34, color: "var(--ball)" }}>{stats.overall.winRate}%</div>
        </div>
        <div className="card-dark">
          <div style={{ fontSize: 12, textTransform: "uppercase", opacity: 0.7, letterSpacing: "0.05em" }}>Games Played</div>
          <div className="mono" style={{ fontSize: 34, color: "var(--ball)" }}>{stats.overall.gamesPlayed}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card">
          <h2 style={{ fontSize: 15, marginBottom: 16 }}>Your Level-Up Priority</h2>
          {levelUp.length === 0 ? (
            <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
              Log a few games with advanced stats and we'll surface where to focus your practice.
            </p>
          ) : (
            levelUp.map((item) => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <span className={`pill pill-${item.priority.toLowerCase()}`}>{item.priority}</span>
                  <div style={{ fontWeight: 600, marginTop: 6 }}>{["🥇", "🥈", "🥉"][item.rank - 1]} {item.skill}</div>
                </div>
                <div className="mono" style={{ textAlign: "right", fontSize: 13 }}>
                  <div>{item.current}% → {item.target}%</div>
                </div>
              </div>
            ))
          )}
          <Link to="/training" className="btn btn-outline" style={{ marginTop: 16, borderColor: "var(--ink)" }}>View training plan</Link>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 15, marginBottom: 16 }}>Recent Performance</h2>
          <StatBar label="Win Rate" value={stats.overall.winRate} />
          {stats.breakdown.map((b) => (
            <StatBar key={b.key} label={b.label} value={b.successRate} />
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 15, marginBottom: 16 }}>Recent Games</h2>
        {games.length === 0 ? (
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            No games yet. <Link to="/games/new">Log your first game</Link> to get started.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--ink-soft)", fontSize: 12, textTransform: "uppercase" }}>
                <th style={{ padding: "6px 0" }}>Date</th>
                <th>Type</th>
                <th>Score</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => {
                const onTeamA = g.teamA.some((p) => p._id === player._id);
                const won = onTeamA ? g.winningTeam === "A" : g.winningTeam === "B";
                return (
                  <tr key={g._id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 0" }}>{new Date(g.date).toLocaleDateString()}</td>
                    <td>{g.sessionType.replace("_", " ")}</td>
                    <td className="mono">{g.scoreA} – {g.scoreB}</td>
                    <td style={{ color: won ? "var(--success)" : "var(--clay)", fontWeight: 600 }}>{won ? "WIN" : "LOSS"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
