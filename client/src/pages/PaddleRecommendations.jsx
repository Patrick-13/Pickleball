import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function PaddleRecommendations() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/paddles/recommendations/me").then(({ data }) => setData(data)).catch((err) => setError(err.response?.data?.message || "Could not load recommendations"));
  }, []);

  if (error) return <div className="container" style={{ padding: 40 }}><div className="error-banner">{error}</div></div>;
  if (!data) return <div className="container" style={{ padding: 40 }}>Loading…</div>;

  return (
    <div className="container" style={{ padding: "32px 20px 60px", maxWidth: 760 }}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Paddle Recommendations</h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 24 }}>
        Scored against your actual stats — a weighted match, not a "buy the most expensive one" list.
      </p>

      {data.message && (
        <div className="card"><p style={{ color: "var(--ink-soft)", fontSize: 14 }}>{data.message}</p></div>
      )}

      {data.needs && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Your Player Profile</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", textTransform: "uppercase" }}>Power</div>
              <div style={{ fontWeight: 700 }}>{data.needs.profile.power}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", textTransform: "uppercase" }}>Control</div>
              <div style={{ fontWeight: 700 }}>{data.needs.profile.control}</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 12 }}>
            This is derived from your dink, third-shot drop, drive, serve, and volley success rates —
            not self-reported.
          </p>
        </div>
      )}

      {data.recommendations?.map((rec, i) => (
        <div className="card" key={rec.paddle._id} style={{ marginBottom: 16, display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: i === 0 ? "var(--ball)" : "var(--court)",
            color: i === 0 ? "var(--ink)" : "var(--line)", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, flexShrink: 0,
          }}>
            {rec.matchPercent}%
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h2 style={{ fontSize: 17 }}>{rec.paddle.brand} {rec.paddle.model}</h2>
              {rec.paddle.price && <span className="mono" style={{ fontSize: 14, color: "var(--ink-soft)" }}>${rec.paddle.price}</span>}
            </div>
            <div style={{ display: "flex", gap: 16, margin: "8px 0", fontSize: 12, color: "var(--ink-soft)" }}>
              <span>Power {rec.paddle.power}/10</span>
              <span>Control {rec.paddle.control}/10</span>
              <span>Spin {rec.paddle.spin}/10</span>
              <span>Sweet Spot {rec.paddle.sweetSpot}/10</span>
            </div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, color: "var(--ink-soft)" }}>
              {rec.reasons.map((r, ri) => <li key={ri}>✓ {r}</li>)}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
