import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function TrainingPlan() {
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState({});

  useEffect(() => {
    api.get("/training/me").then(({ data }) => setPlan(data.plan)).catch((err) => setError(err.response?.data?.message || "Could not load training plan"));
  }, []);

  if (error) return <div className="container" style={{ padding: 40 }}><div className="error-banner">{error}</div></div>;
  if (!plan) return <div className="container" style={{ padding: 40 }}>Loading…</div>;

  return (
    <div className="container" style={{ padding: "32px 20px 60px", maxWidth: 720 }}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Training Plan</h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 24 }}>
        Drills matched to your current weakest skills, from your recorded games.
      </p>

      {plan.length === 0 && (
        <div className="card">
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            Log a few more games with performance stats and we'll build a plan around your weakest skills.
          </p>
        </div>
      )}

      {plan.map((item) => (
        <div className="card" key={item.key} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span className={`pill pill-${item.priority.toLowerCase()}`}>{item.priority} PRIORITY</span>
              <h2 style={{ fontSize: 18, marginTop: 8 }}>{["🥇", "🥈", "🥉"][item.rank - 1] || ""} {item.skill}</h2>
            </div>
            <div className="mono" style={{ textAlign: "right", fontSize: 14 }}>{item.current}% → {item.target}%</div>
          </div>

          {item.drills.length === 0 ? (
            <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 12 }}>No drills catalogued for this skill yet.</p>
          ) : (
            <div style={{ marginTop: 16 }}>
              {item.drills.map((d) => {
                const isOpen = open[d._id];
                return (
                  <div key={d._id} style={{ borderTop: "1px solid var(--border)", padding: "12px 0" }}>
                    <button
                      onClick={() => setOpen((o) => ({ ...o, [d._id]: !o[d._id] }))}
                      style={{ background: "none", border: "none", padding: 0, width: "100%", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{d.name}</div>
                        <div className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                          {d.difficulty} · {d.durationMinutes} min · {d.requiredPlayers} player{d.requiredPlayers > 1 ? "s" : ""}
                        </div>
                      </div>
                      <span style={{ fontSize: 18, color: "var(--ink-soft)" }}>{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <ol style={{ marginTop: 10, paddingLeft: 20, fontSize: 14, color: "var(--ink-soft)" }}>
                        {d.instructions.map((step, i) => <li key={i} style={{ marginBottom: 4 }}>{step}</li>)}
                      </ol>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
