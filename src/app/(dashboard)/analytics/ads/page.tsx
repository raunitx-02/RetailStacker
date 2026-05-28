"use client";
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Zap, TrendingUp, TrendingDown, Play, Pause, Trash2, X, Sparkles, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

interface Campaign {
  name: string;
  type: string;
  spend: number;
  revenue: number;
  acos: number;
  roas: number;
  clicks: number;
  impressions: number;
  ctr: string;
  status: "Active" | "Paused";
}

interface Suggestion {
  id: number;
  campaign: string;
  action: "Increase bid" | "Decrease bid" | "Pause keyword";
  keyword: string;
  current: string;
  suggested: string;
  reason: string;
  applied: boolean;
}

const DEFAULT_CAMPAIGNS: Campaign[] = [
  { name: "Bamboo Board - Auto", type: "Auto", spend: 1840, revenue: 8920, acos: 20.6, roas: 4.85, clicks: 2841, impressions: 48200, ctr: "5.9%", status: "Active" },
  { name: "Bamboo Board - Exact KW", type: "Exact", spend: 2310, revenue: 14100, acos: 16.4, roas: 6.10, clicks: 3812, impressions: 89400, ctr: "4.3%", status: "Active" },
  { name: "Water Bottle - Broad", type: "Broad", spend: 980, revenue: 3240, acos: 30.2, roas: 3.31, clicks: 1892, impressions: 41200, ctr: "4.6%", status: "Active" },
  { name: "Yoga Mat - Sponsored Brand", type: "SB", spend: 1240, revenue: 6800, acos: 18.2, roas: 5.48, clicks: 2104, impressions: 62800, ctr: "3.3%", status: "Active" },
  { name: "Desk Lamp - Phrase Match", type: "Phrase", spend: 640, revenue: 1920, acos: 33.3, roas: 3.00, clicks: 1204, impressions: 28900, ctr: "4.2%", status: "Paused" },
  { name: "Kitchen Utensil - Product Targeting", type: "PAT", spend: 520, revenue: 3100, acos: 16.8, roas: 5.96, clicks: 892, impressions: 19800, ctr: "4.5%", status: "Active" },
];

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { id: 1, campaign: "Bamboo Board - Auto", action: "Increase bid", keyword: "bamboo cutting board", current: "₹68", suggested: "₹86", reason: "Conversion rate +34% above average", applied: false },
  { id: 2, campaign: "Water Bottle - Broad", action: "Decrease bid", keyword: "cheap water bottle", current: "₹54", suggested: "₹32", reason: "ACoS is 58% — not profitable", applied: false },
  { id: 3, campaign: "Yoga Mat - Sponsored Brand", action: "Pause keyword", keyword: "fitness mat generic", current: "₹37", suggested: "₹0", reason: "0 conversions in 120 clicks", applied: false },
];

const chartData = [
  { day: "Mon", spend: 980, revenue: 4820 }, { day: "Tue", spend: 1240, revenue: 6100 },
  { day: "Wed", spend: 1100, revenue: 5400 }, { day: "Thu", spend: 1380, revenue: 7200 },
  { day: "Fri", spend: 1520, revenue: 8100 }, { day: "Sat", spend: 1820, revenue: 9400 },
  { day: "Sun", spend: 1490, revenue: 7800 },
];

const statusBadge: Record<string, string> = { "Active": "badge-success", "Paused": "badge-warning" };
const typeBadge: Record<string, string> = { "Auto": "badge-blue", "Exact": "badge-success", "Broad": "badge-accent", "Phrase": "badge-purple", "SB": "badge-warning", "PAT": "badge-blue" };

export default function AdsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeStep, setOptimizeStep] = useState(0);

  // New campaign form states
  const [newCamName, setNewCamName] = useState("");
  const [newCamType, setNewCamType] = useState("Auto");
  const [newCamBudget, setNewCamBudget] = useState("50");
  const [newCamTargetAcos, setNewCamTargetAcos] = useState("25");

  // Load from localStorage
  useEffect(() => {
    try {
      const savedCampaigns = localStorage.getItem("retailstacker_ppc_campaigns");
      if (savedCampaigns) {
        setCampaigns(JSON.parse(savedCampaigns));
      } else {
        setCampaigns(DEFAULT_CAMPAIGNS);
        localStorage.setItem("retailstacker_ppc_campaigns", JSON.stringify(DEFAULT_CAMPAIGNS));
      }

      const savedSuggestions = localStorage.getItem("retailstacker_ppc_suggestions");
      if (savedSuggestions) {
        setSuggestions(JSON.parse(savedSuggestions));
      } else {
        setSuggestions(DEFAULT_SUGGESTIONS);
        localStorage.setItem("retailstacker_ppc_suggestions", JSON.stringify(DEFAULT_SUGGESTIONS));
      }
    } catch (e) {
      console.error(e);
      setCampaigns(DEFAULT_CAMPAIGNS);
      setSuggestions(DEFAULT_SUGGESTIONS);
    }
  }, []);

  const saveToStorage = (updatedCams: Campaign[], updatedSugs?: Suggestion[]) => {
    setCampaigns(updatedCams);
    localStorage.setItem("retailstacker_ppc_campaigns", JSON.stringify(updatedCams));
    if (updatedSugs) {
      setSuggestions(updatedSugs);
      localStorage.setItem("retailstacker_ppc_suggestions", JSON.stringify(updatedSugs));
    }
  };

  const toggleStatus = (index: number) => {
    const updated = [...campaigns];
    updated[index].status = updated[index].status === "Active" ? "Paused" : "Active";
    saveToStorage(updated);
  };

  const deleteCampaign = (index: number) => {
    const updated = campaigns.filter((_, i) => i !== index);
    saveToStorage(updated);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamName.trim()) return;

    const budget = parseFloat(newCamBudget) || 20;
    const targetAcos = parseFloat(newCamTargetAcos) || 25;

    const newCampaign: Campaign = {
      name: newCamName,
      type: newCamType,
      spend: 0,
      revenue: 0,
      acos: 0,
      roas: 0,
      clicks: 0,
      impressions: 0,
      ctr: "0.0%",
      status: "Active",
    };

    const updated = [newCampaign, ...campaigns];
    saveToStorage(updated);

    // Reset fields
    setNewCamName("");
    setNewCamType("Auto");
    setNewCamBudget("50");
    setNewCamTargetAcos("25");
    setIsModalOpen(false);

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
  };

  const handleApplySuggestion = (sugId: number) => {
    const updatedSugs = suggestions.map(s => s.id === sugId ? { ...s, applied: true } : s);
    
    // Simulate campaign budget/bid adjust reflection
    const sug = suggestions.find(s => s.id === sugId);
    let updatedCams = [...campaigns];
    if (sug) {
      updatedCams = campaigns.map(c => {
        if (c.name === sug.campaign) {
          // Adjust stats a bit to reflect the optimization
          return {
            ...c,
            acos: Math.max(12, Math.round((c.acos * 0.95) * 10) / 10),
            roas: Math.round((c.roas * 1.05) * 100) / 100,
          };
        }
        return c;
      });
    }

    saveToStorage(updatedCams, updatedSugs);
    confetti({ particleCount: 30, spread: 40 });
  };

  const handleAutoOptimize = () => {
    if (isOptimizing || suggestions.every(s => s.applied)) return;
    setIsOptimizing(true);
    setOptimizeStep(0);

    const interval = setInterval(() => {
      setOptimizeStep(prev => {
        const next = prev + 1;
        if (next >= 3) {
          clearInterval(interval);
          setTimeout(() => {
            // Apply all
            const updatedSugs = suggestions.map(s => ({ ...s, applied: true }));
            const updatedCams = campaigns.map(c => ({
              ...c,
              acos: Math.max(10, Math.round((c.acos * 0.88) * 10) / 10),
              roas: Math.round((c.roas * 1.15) * 100) / 100,
            }));
            saveToStorage(updatedCams, updatedSugs);
            setIsOptimizing(false);
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 }
            });
          }, 600);
          return 3;
        }
        return next;
      });
    }, 1000);
  };

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const activeCamsCount = campaigns.filter(c => c.status === "Active").length;
  const avgAcos = campaigns.length > 0 ? (campaigns.reduce((s, c) => s + c.acos, 0) / campaigns.length).toFixed(1) : "0.0";
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Ads (Adtomic PPC)</h1>
          <p className="page-subtitle">AI-powered PPC management — automate bids, reduce ACoS, and maximize ROAS</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button 
            className="btn-ghost" 
            style={{ display: "flex", alignItems: "center", gap: 8 }}
            onClick={handleAutoOptimize}
            disabled={isOptimizing || suggestions.every(s => s.applied)}
          >
            <Zap size={15} color="var(--accent)" />
            {isOptimizing ? `Optimizing (${Math.round((optimizeStep/3)*100)}%)` : suggestions.every(s => s.applied) ? "Bids Fully Optimized" : "Auto-Optimize Bids"}
          </button>
          <button className="btn-accent" onClick={() => setIsModalOpen(true)}>+ Create Campaign</button>
        </div>
      </div>

      {/* OVERVIEW STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Ad Spend", value: `₹${totalSpend.toLocaleString("en-IN")}`, color: "var(--danger)" },
          { label: "Total Ad Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, color: "var(--success)" },
          { label: "Avg ACoS", value: `${avgAcos}%`, color: parseFloat(avgAcos) < 20 ? "var(--success)" : "var(--warning)" },
          { label: "Active Campaigns", value: `${activeCamsCount} / ${campaigns.length}`, color: "var(--blue)" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* WEEKLY CHART */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>Weekly Ad Performance</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 20 }}>Spend vs. Revenue by day this week</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`} />
            <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10 }} formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]} />
            <Legend wrapperStyle={{ color: "var(--text-secondary)", fontSize: 13 }} />
            <Bar dataKey="spend" fill="var(--danger)" radius={[4, 4, 0, 0]} name="Ad Spend" opacity={0.8} />
            <Bar dataKey="revenue" fill="var(--success)" radius={[4, 4, 0, 0]} name="Ad Revenue" opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CAMPAIGNS TABLE */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 20 }}>Active Campaigns</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>CAMPAIGN</th>
                <th>TYPE</th>
                <th>SPEND</th>
                <th>REVENUE</th>
                <th>ACoS</th>
                <th>ROAS</th>
                <th>CLICKS</th>
                <th>STATUS</th>
                <th style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
                    No campaigns tracking. Click "+ Create Campaign" to launch a campaign.
                  </td>
                </tr>
              ) : (
                campaigns.map((c, i) => (
                  <tr key={c.name + i}>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 13 }}>{c.name}</td>
                    <td><span className={`badge ${typeBadge[c.type] || "badge-blue"}`} style={{ fontSize: 11 }}>{c.type}</span></td>
                    <td style={{ color: "var(--danger)", fontWeight: 600 }}>₹{c.spend.toLocaleString("en-IN")}</td>
                    <td style={{ color: "var(--success)", fontWeight: 700 }}>₹{c.revenue.toLocaleString("en-IN")}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: c.acos === 0 ? "var(--text-muted)" : c.acos < 20 ? "var(--success)" : c.acos < 30 ? "var(--warning)" : "var(--danger)" }}>
                        {c.acos > 0 ? `${c.acos}%` : "—"}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--blue)" }}>{c.roas > 0 ? `${c.roas}x` : "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{c.clicks.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${statusBadge[c.status]}`} style={{ cursor: "pointer" }} onClick={() => toggleStatus(i)}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button 
                          className="btn-ghost" 
                          style={{ padding: 6, minWidth: 0 }}
                          onClick={() => toggleStatus(i)}
                          title={c.status === "Active" ? "Pause Campaign" : "Activate Campaign"}
                        >
                          {c.status === "Active" ? <Pause size={14} /> : <Play size={14} color="var(--success)" />}
                        </button>
                        <button 
                          className="btn-ghost" 
                          style={{ padding: 6, minWidth: 0, color: "var(--danger)" }}
                          onClick={() => deleteCampaign(i)}
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

      {/* AI SUGGESTIONS */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>AI Bid Optimization Suggestions</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Based on your 30-day performance data</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {suggestions.every(s => s.applied) ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px", border: "1px dashed var(--success)", borderRadius: 12, background: "rgba(16,185,129,0.05)" }}>
              <Sparkles size={24} color="var(--success)" />
              <div style={{ fontWeight: 700, color: "var(--success)" }}>All Recommendations Applied!</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Next sync scan runs automatically tomorrow morning. All campaign bids are fully optimized.</div>
            </div>
          ) : (
            suggestions.map((s) => (
              <div 
                key={s.id} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 16, 
                  padding: "14px 18px", 
                  borderRadius: 12, 
                  background: s.applied ? "rgba(16, 185, 129, 0.05)" : "rgba(0,0,0,0.2)", 
                  border: s.applied ? "1px solid var(--success)" : "1px solid var(--border)",
                  opacity: s.applied ? 0.7 : 1,
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: 10, 
                  background: s.applied ? "rgba(16,185,129,0.2)" : s.action === "Increase bid" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center" 
                }}>
                  {s.applied ? (
                    <CheckCircle2 size={16} color="var(--success)" />
                  ) : s.action === "Increase bid" ? (
                    <TrendingUp size={16} color="var(--success)" />
                  ) : (
                    <TrendingDown size={16} color="var(--danger)" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                    {s.campaign} — <span style={{ color: "var(--text-muted)" }}>{s.keyword}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{s.reason}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.current}</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>→</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s.action === "Increase bid" ? "var(--success)" : "var(--danger)" }}>{s.suggested}</span>
                  <button 
                    className="btn-accent" 
                    style={{ fontSize: 12, padding: "6px 14px" }}
                    onClick={() => handleApplySuggestion(s.id)}
                    disabled={s.applied}
                  >
                    {s.applied ? "Applied" : "Apply"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: CREATE CAMPAIGN */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-card" style={{ width: 440, padding: 28, position: "relative" }}>
            <button 
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              onClick={() => setIsModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Create New PPC Campaign</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Launch customized programmatic ad triggers inside seller portals.</p>

            <form onSubmit={handleCreateCampaign} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Campaign Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Bamboo Board - Exact KW Match" 
                  value={newCamName}
                  onChange={e => setNewCamName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Target Strategy</label>
                  <select className="input-field" value={newCamType} onChange={e => setNewCamType(e.target.value)}>
                    <option>Auto</option>
                    <option>Exact</option>
                    <option>Broad</option>
                    <option>Phrase</option>
                    <option>SB</option>
                    <option>PAT</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Daily Budget (₹)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={newCamBudget}
                    onChange={e => setNewCamBudget(e.target.value)}
                    min="5"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Target ACoS (%)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={newCamTargetAcos}
                  onChange={e => setNewCamTargetAcos(e.target.value)}
                  min="1"
                  max="100"
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-accent" style={{ flex: 1 }}>Launch Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY: OPTIMIZING PROGRESS */}
      {isOptimizing && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110 }}>
          <div style={{ textAlign: "center", maxWidth: 380, padding: 30 }}>
            <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 24px" }}>
              {/* Spinning loading border */}
              <div style={{ 
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%", 
                borderRadius: "50%", border: "4px solid rgba(255,255,255,0.05)", borderTopColor: "var(--accent)", 
                animation: "spin 1s linear infinite" 
              }} />
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={28} className="animate-pulse" color="var(--accent)" />
              </div>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>AI Adtomic Bids Optimizer</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Applying target suggestions to active seller accounts...</p>
            
            {/* Progress line */}
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, height: 6, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ background: "var(--accent)", height: "100%", width: `${(optimizeStep / 3) * 100}%`, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
              {optimizeStep === 0 && "Parsing bid histories..."}
              {optimizeStep === 1 && "Recalculating target ACoS margins..."}
              {optimizeStep === 2 && "Synchronizing API portal adjustments..."}
              {optimizeStep === 3 && "Completing sync updates..."}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic spinning animation helper */}
      <style jsx global>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
