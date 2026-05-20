"use client";
import React, { useState, useEffect } from "react";
import { Mail, Plus, Play, Pause, Eye, Trash2, X, Check, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import confetti from "canvas-confetti";

interface FollowUpCampaign {
  id: number;
  name: string;
  trigger: string;
  sent: number;
  opened: number;
  reviews: number;
  status: "Active" | "Paused";
}

const DEFAULT_CAMPAIGNS: FollowUpCampaign[] = [
  { id: 1, name: "Post-Purchase Thank You", trigger: "3 days after delivery", sent: 4821, opened: 2891, reviews: 312, status: "Active" },
  { id: 2, name: "Review Request — Happy Path", trigger: "5 days after delivery", sent: 3204, opened: 1923, reviews: 287, status: "Active" },
  { id: 3, name: "Re-engagement Sequence", trigger: "30 days after purchase", sent: 1842, opened: 891, reviews: 74, status: "Paused" },
  { id: 4, name: "Product Feedback Loop", trigger: "7 days after delivery", sent: 2341, opened: 1432, reviews: 198, status: "Active" },
  { id: 5, name: "Holiday Special Campaign", trigger: "Manually triggered", sent: 892, opened: 634, reviews: 41, status: "Paused" },
];

const TEMPLATES = [
  { name: "Classic Thank You", type: "Thank You", opens: "47%", subject: "Thank you for your order! 🎉", preview: "Hi [First Name], we noticed you received your order recently. We wanted to extend our sincerest gratitude..." },
  { name: "Friendly Review Ask", type: "Review Request", opens: "39%", subject: "How is your new purchase? 😊", preview: "Hello [First Name], we hope you are loving your brand new bamboo cutting board! Could you take 60 seconds to leave..." },
  { name: "Problem Solver", type: "Issue Resolution", opens: "52%", subject: "Is everything okay with your order?", preview: "Dear [First Name], customer satisfaction is our absolute priority. If you experienced any issue or damage..." },
];

const STATS_DATA = [
  { date: "May 14", sent: 380, opens: 168, reviews: 28 },
  { date: "May 15", sent: 440, opens: 190, reviews: 32 },
  { date: "May 16", sent: 410, opens: 182, reviews: 30 },
  { date: "May 17", sent: 530, opens: 239, reviews: 41 },
  { date: "May 18", sent: 490, opens: 220, reviews: 38 },
  { date: "May 19", sent: 580, opens: 262, reviews: 49 },
  { date: "May 20", sent: 640, opens: 288, reviews: 52 },
];

export default function FollowUpPage() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "templates" | "stats">("campaigns");
  const [campaigns, setCampaigns] = useState<FollowUpCampaign[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activePreview, setActivePreview] = useState<typeof TEMPLATES[0] | null>(null);

  // Form states
  const [newCamName, setNewCamName] = useState("");
  const [newCamTrigger, setNewCamTrigger] = useState("3 days after delivery");
  const [newCamTemplate, setNewCamTemplate] = useState("Classic Thank You");

  // Load state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("neon10_followup_campaigns");
      if (saved) {
        setCampaigns(JSON.parse(saved));
      } else {
        setCampaigns(DEFAULT_CAMPAIGNS);
        localStorage.setItem("neon10_followup_campaigns", JSON.stringify(DEFAULT_CAMPAIGNS));
      }
    } catch (e) {
      console.error(e);
      setCampaigns(DEFAULT_CAMPAIGNS);
    }
  }, []);

  const saveToStorage = (updated: FollowUpCampaign[]) => {
    setCampaigns(updated);
    localStorage.setItem("neon10_followup_campaigns", JSON.stringify(updated));
  };

  const toggleCampaignStatus = (id: number) => {
    const updated = campaigns.map(c => c.id === id ? { ...c, status: (c.status === "Active" ? "Paused" : "Active") as FollowUpCampaign["status"] } : c);
    saveToStorage(updated);
  };

  const deleteCampaign = (id: number) => {
    const updated = campaigns.filter(c => c.id !== id);
    saveToStorage(updated);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamName.trim()) return;

    const newCampaign: FollowUpCampaign = {
      id: Date.now(),
      name: newCamName,
      trigger: newCamTrigger,
      sent: 0,
      opened: 0,
      reviews: 0,
      status: "Active",
    };

    const updated = [newCampaign, ...campaigns];
    saveToStorage(updated);

    // Reset
    setNewCamName("");
    setNewCamTrigger("3 days after delivery");
    setNewCamTemplate("Classic Thank You");
    setShowModal(false);

    confetti({ particleCount: 60, spread: 45, origin: { y: 0.8 } });
  };

  // Calculations
  const totalSent = statsDataSum("sent");
  const totalReviews = statsDataSum("reviews");
  const avgOpenRate = "44.2%";

  function statsDataSum(key: "sent" | "reviews") {
    return STATS_DATA.reduce((sum, item) => sum + item[key], 0) * 20; // scaled representative totals
  }

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Follow-Up Email Automation</h1>
          <p className="page-subtitle">Automate custom review capture sequences and proactive buyer support communications</p>
        </div>
        <button 
          className="btn-accent" 
          onClick={() => setShowModal(true)} 
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Plus size={15} /> Create Campaign
        </button>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Emails Dispatched (30d)", value: totalSent.toLocaleString(), color: "var(--blue)" },
          { label: "Average Open Rate", value: avgOpenRate, color: "var(--success)" },
          { label: "Generated Feedback Reviews", value: totalReviews.toLocaleString(), color: "var(--accent)" },
          { label: "Unsubscribe Margin", value: "0.8%", color: "var(--danger)" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* TABS SELECTORS */}
      <div className="tabs" style={{ marginBottom: 20, maxWidth: 360 }}>
        {(["campaigns", "templates", "stats"] as const).map(t => (
          <button 
            key={t} 
            className={`tab ${activeTab === t ? "active" : ""}`} 
            onClick={() => setActiveTab(t)} 
            style={{ textTransform: "capitalize" }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* CAMPAIGNS VIEW */}
      {activeTab === "campaigns" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>CAMPAIGN</th>
                  <th>TRIGGER</th>
                  <th>SENT</th>
                  <th>OPEN RATE</th>
                  <th>REVIEWS</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
                      No follow-up email campaigns configured. Click "+ Create Campaign" to launch.
                    </td>
                  </tr>
                ) : (
                  campaigns.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{c.trigger}</td>
                      <td style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{c.sent.toLocaleString()}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: c.sent > 0 ? `${Math.round((c.opened / c.sent) * 100)}%` : "0%", 
                                background: "var(--blue)" 
                              }} 
                            />
                          </div>
                          <span style={{ fontSize: 13, color: "var(--blue)", fontWeight: 600 }}>
                            {c.sent > 0 ? `${Math.round((c.opened / c.sent) * 100)}%` : "0%"}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: "var(--accent)", fontWeight: 700 }}>{c.reviews}</td>
                      <td>
                        <span 
                          className={`badge ${c.status === "Active" ? "badge-success" : "badge-warning"}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleCampaignStatus(c.id)}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button 
                            className="btn-ghost" 
                            style={{ padding: 6, minWidth: 0 }}
                            onClick={() => toggleCampaignStatus(c.id)}
                            title={c.status === "Active" ? "Pause Sequence" : "Activate Sequence"}
                          >
                            {c.status === "Active" ? <Pause size={14} /> : <Play size={14} color="var(--success)" />}
                          </button>
                          <button 
                            className="btn-ghost" 
                            style={{ padding: 6, minWidth: 0, color: "var(--danger)" }}
                            onClick={() => deleteCampaign(c.id)}
                            title="Delete Campaign"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEMPLATES CARDS */}
      {activeTab === "templates" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {TEMPLATES.map(t => (
            <div key={t.name} className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span className="badge badge-blue">{t.type}</span>
                  <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 700 }}>Avg Open: {t.opens}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 12 }}>{t.name}</h3>
                <div style={{ 
                  background: "rgba(0,0,0,0.2)", 
                  borderRadius: 10, 
                  padding: 16, 
                  fontSize: 13, 
                  color: "var(--text-muted)", 
                  lineHeight: 1.7, 
                  marginBottom: 16, 
                  maxHeight: 120, 
                  overflow: "hidden", 
                  textOverflow: "ellipsis" 
                }}>
                  <strong style={{ color: "var(--text-secondary)" }}>Subject:</strong> {t.subject}<br />
                  <strong style={{ color: "var(--text-secondary)" }}>Preview:</strong> {t.preview}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  className="btn-accent" 
                  style={{ flex: 1, fontSize: 13 }}
                  onClick={() => {
                    setNewCamName(`${t.name} Auto`);
                    setNewCamTemplate(t.name);
                    setShowModal(true);
                  }}
                >
                  Use Template
                </button>
                <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setActivePreview(t)}>Preview</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PERFORMANCE GRAPH */}
      {activeTab === "stats" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Daily Automated Volume</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>Daily outbound deliveries, opens, and feedback review loops</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={STATS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10 }} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="sent" stroke="var(--blue)" strokeWidth={2} name="Emails Sent" activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="opens" stroke="var(--success)" strokeWidth={2} name="Opens" />
              <Line type="monotone" dataKey="reviews" stroke="var(--accent)" strokeWidth={2} name="Reviews Captured" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* DIALOG: CREATE CAMPAIGN */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(8px)" }}>
          <div className="glass-card" style={{ padding: 32, width: 480, maxWidth: "90vw", position: "relative" }}>
            <button 
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)", marginBottom: 6 }}>Create Outbound Campaign</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Configure automatic review triggers based on transaction milestones.</p>

            <form onSubmit={handleCreateCampaign} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 6 }}>Campaign Name</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. Bamboo Board Delivery Loop" 
                  value={newCamName}
                  onChange={e => setNewCamName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 6 }}>Trigger Timing</label>
                <select className="input-field" value={newCamTrigger} onChange={e => setNewCamTrigger(e.target.value)}>
                  <option>3 days after delivery</option>
                  <option>5 days after delivery</option>
                  <option>7 days after delivery</option>
                  <option>Immediately after order purchase</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 6 }}>Mail Template Preset</label>
                <select className="input-field" value={newCamTemplate} onChange={e => setNewCamTemplate(e.target.value)}>
                  {TEMPLATES.map(t => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-accent" style={{ flex: 1 }}>Launch Outbox</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: VIEW PREVIEW TEMPLATE */}
      {activePreview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(8px)" }}>
          <div className="glass-card" style={{ padding: 32, width: 480, maxWidth: "90vw", position: "relative" }}>
            <button 
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              onClick={() => setActivePreview(null)}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)", marginBottom: 4 }}>Template: {activePreview.name}</h2>
            <span className="badge badge-success" style={{ marginBottom: 20 }}>Open rate: {activePreview.opens}</span>

            <div style={{ background: "rgba(0,0,0,0.25)", padding: 18, borderRadius: 12, border: "1px solid var(--border)", fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)" }}>
              <div style={{ marginBottom: 10 }}><strong style={{ color: "var(--text-primary)" }}>Subject:</strong> {activePreview.subject}</div>
              <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0" }} />
              <div>{activePreview.preview}</div>
            </div>

            <button className="btn-accent" style={{ width: "100%", marginTop: 20 }} onClick={() => setActivePreview(null)}>Close Preview</button>
          </div>
        </div>
      )}
    </div>
  );
}
