"use client";
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { X } from "lucide-react";
import confetti from "canvas-confetti";

interface NicheCompetitor {
  brand: string;
  revenue: number;
  share: number;
  rank: number;
  change: string;
  color: string;
}

interface Niche {
  id: string;
  name: string;
  keyword: string;
  marketSize: number;
  yourShare: number;
  totalCompetitors: number;
  growthRate: string;
  shareData: { name: string; value: number; color: string }[];
  volumeData: { month: string; vol: number }[];
  competitors: NicheCompetitor[];
}

const DEFAULT_NICHES: Niche[] = [
  {
    id: "bamboo",
    name: "Bamboo Cutting Boards",
    keyword: "bamboo cutting board",
    marketSize: 294000,
    yourShare: 18.4,
    totalCompetitors: 142,
    growthRate: "+12.3%",
    shareData: [
      { name: "EcoHome (You)", value: 18.4, color: "var(--accent)" },
      { name: "ChefLine Pro", value: 14.2, color: "var(--blue)" },
      { name: "KitchenPro", value: 12.8, color: "var(--purple)" },
      { name: "BambooKing", value: 9.1, color: "var(--success)" },
      { name: "CutMaster", value: 7.6, color: "var(--warning)" },
      { name: "Others", value: 37.9, color: "#334155" },
    ],
    volumeData: [
      { month: "Nov", vol: 48200 }, { month: "Dec", vol: 89400 }, { month: "Jan", vol: 32100 },
      { month: "Feb", vol: 29800 }, { month: "Mar", vol: 41200 }, { month: "Apr", vol: 54800 },
      { month: "May", vol: 61200 },
    ],
    competitors: [
      { brand: "EcoHome (You)", revenue: 54280, share: 18.4, rank: 1, change: "+2.1%", color: "var(--accent)" },
      { brand: "ChefLine Pro", revenue: 41800, share: 14.2, rank: 2, change: "+0.8%", color: "var(--blue)" },
      { brand: "KitchenPro", revenue: 37600, share: 12.8, rank: 3, change: "-1.3%", color: "var(--purple)" },
      { brand: "BambooKing", revenue: 26700, share: 9.1, rank: 4, change: "+0.3%", color: "var(--success)" },
      { brand: "CutMaster", revenue: 22300, share: 7.6, rank: 5, change: "-0.5%", color: "var(--warning)" },
    ]
  },
  {
    id: "bottles",
    name: "Insulated Water Bottles",
    keyword: "insulated metal bottle",
    marketSize: 450000,
    yourShare: 11.2,
    totalCompetitors: 284,
    growthRate: "+18.9%",
    shareData: [
      { name: "HydroFit", value: 24.1, color: "var(--blue)" },
      { name: "EcoHome (You)", value: 11.2, color: "var(--accent)" },
      { name: "ThermoKing", value: 16.5, color: "var(--purple)" },
      { name: "IronFlask", value: 14.8, color: "var(--success)" },
      { name: "SwellLife", value: 8.4, color: "var(--warning)" },
      { name: "Others", value: 25.0, color: "#334155" },
    ],
    volumeData: [
      { month: "Nov", vol: 88000 }, { month: "Dec", vol: 114000 }, { month: "Jan", vol: 72000 },
      { month: "Feb", vol: 68000 }, { month: "Mar", vol: 82000 }, { month: "Apr", vol: 96000 },
      { month: "May", vol: 104000 },
    ],
    competitors: [
      { brand: "HydroFit", revenue: 108450, share: 24.1, rank: 1, change: "+3.4%", color: "var(--blue)" },
      { brand: "ThermoKing", revenue: 74250, share: 16.5, rank: 2, change: "-1.1%", color: "var(--purple)" },
      { brand: "IronFlask", revenue: 66600, share: 14.8, rank: 3, change: "+2.0%", color: "var(--success)" },
      { brand: "EcoHome (You)", revenue: 50400, share: 11.2, rank: 4, change: "+1.5%", color: "var(--accent)" },
      { brand: "SwellLife", revenue: 37800, share: 8.4, rank: 5, change: "-0.9%", color: "var(--warning)" },
    ]
  },
  {
    id: "yoga",
    name: "Eco Non-Slip Yoga Mats",
    keyword: "eco yoga mat non slip",
    marketSize: 185000,
    yourShare: 6.4,
    totalCompetitors: 95,
    growthRate: "+8.1%",
    shareData: [
      { name: "LuluFlex", value: 31.2, color: "var(--purple)" },
      { name: "MandukaPrime", value: 22.8, color: "var(--blue)" },
      { name: "GaiamZen", value: 15.4, color: "var(--success)" },
      { name: "EcoHome (You)", value: 6.4, color: "var(--accent)" },
      { name: "MatPro", value: 4.8, color: "var(--warning)" },
      { name: "Others", value: 19.4, color: "#334155" },
    ],
    volumeData: [
      { month: "Nov", vol: 24000 }, { month: "Dec", vol: 38000 }, { month: "Jan", vol: 42000 },
      { month: "Feb", vol: 35000 }, { month: "Mar", vol: 31000 }, { month: "Apr", vol: 36000 },
      { month: "May", vol: 39000 },
    ],
    competitors: [
      { brand: "LuluFlex", revenue: 57720, share: 31.2, rank: 1, change: "+4.1%", color: "var(--purple)" },
      { brand: "MandukaPrime", revenue: 42180, share: 22.8, rank: 2, change: "-2.3%", color: "var(--blue)" },
      { brand: "GaiamZen", revenue: 28490, share: 15.4, rank: 3, change: "+0.9%", color: "var(--success)" },
      { brand: "EcoHome (You)", revenue: 11840, share: 6.4, rank: 4, change: "+0.5%", color: "var(--accent)" },
      { brand: "MatPro", revenue: 8880, share: 4.8, rank: 5, change: "-0.2%", color: "var(--warning)" },
    ]
  }
];

export default function MarketTrackerPage() {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [selectedNicheId, setSelectedNicheId] = useState("bamboo");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New market states
  const [newNicheName, setNewNicheName] = useState("");
  const [newNicheKeyword, setNewNicheKeyword] = useState("");
  const [newNicheMarketSize, setNewNicheMarketSize] = useState("200000");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("retailstacker_market_tracker_niches");
      if (saved) {
        setNiches(JSON.parse(saved));
      } else {
        setNiches(DEFAULT_NICHES);
        localStorage.setItem("retailstacker_market_tracker_niches", JSON.stringify(DEFAULT_NICHES));
      }
    } catch (e) {
      console.error(e);
      setNiches(DEFAULT_NICHES);
    }
  }, []);

  const handleCreateMarket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNicheName.trim() || !newNicheKeyword.trim()) return;

    const size = parseFloat(newNicheMarketSize) || 100000;
    const generatedId = newNicheName.toLowerCase().replace(/\s+/g, "-");

    // Generate competitive shares summing up to 100%
    const yourShare = 5 + Math.floor(Math.random() * 15); // 5% - 20%
    const comp1 = 20 + Math.floor(Math.random() * 10);
    const comp2 = 15 + Math.floor(Math.random() * 10);
    const comp3 = 10 + Math.floor(Math.random() * 8);
    const comp4 = 8 + Math.floor(Math.random() * 6);
    const sumSpecified = yourShare + comp1 + comp2 + comp3 + comp4;
    const others = Math.max(5, 100 - sumSpecified);

    const brands = [
      { name: "EcoHome (You)", value: yourShare, color: "var(--accent)" },
      { name: "AlphaBrands", value: comp1, color: "var(--blue)" },
      { name: "BetaGoods", value: comp2, color: "var(--purple)" },
      { name: "ZetaLine", value: comp3, color: "var(--success)" },
      { name: "DeltaPro", value: comp4, color: "var(--warning)" },
      { name: "Others", value: others, color: "#334155" }
    ];

    // Sort competitors by revenue share
    const competitorsList: NicheCompetitor[] = brands
      .filter(b => b.name !== "Others")
      .map(b => ({
        brand: b.name,
        revenue: Math.round((size * (b.value / 100)) * 10) / 10,
        share: b.value,
        rank: 1, // Will set below
        change: `${(Math.random() * 4 - 2) >= 0 ? "+" : ""}${(Math.random() * 3).toFixed(1)}%`,
        color: b.color
      }))
      .sort((a, b) => b.share - a.share)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    const newNiche: Niche = {
      id: generatedId,
      name: newNicheName,
      keyword: newNicheKeyword.toLowerCase(),
      marketSize: size,
      yourShare: yourShare,
      totalCompetitors: 40 + Math.floor(Math.random() * 200),
      growthRate: `+${(Math.random() * 15 + 2).toFixed(1)}%`,
      shareData: brands,
      volumeData: [
        { month: "Nov", vol: Math.round(size * 0.12) },
        { month: "Dec", vol: Math.round(size * 0.22) },
        { month: "Jan", vol: Math.round(size * 0.08) },
        { month: "Feb", vol: Math.round(size * 0.07) },
        { month: "Mar", vol: Math.round(size * 0.10) },
        { month: "Apr", vol: Math.round(size * 0.14) },
        { month: "May", vol: Math.round(size * 0.17) },
      ],
      competitors: competitorsList
    };

    const updated = [...niches, newNiche];
    setNiches(updated);
    localStorage.setItem("retailstacker_market_tracker_niches", JSON.stringify(updated));
    setSelectedNicheId(generatedId);

    // Reset
    setNewNicheName("");
    setNewNicheKeyword("");
    setNewNicheMarketSize("200000");
    setIsModalOpen(false);

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
  };

  const activeNiche = niches.find(n => n.id === selectedNicheId) || niches[0];

  if (!activeNiche) {
    return <div style={{ color: "var(--text-muted)", padding: 40, textAlign: "center" }}>Initializing tracker niche database...</div>;
  }

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Market Tracker</h1>
          <p className="page-subtitle">Niche-level intelligence — track market share, volume trends, and competitor movements</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select 
            className="input-field" 
            style={{ width: "auto", cursor: "pointer" }}
            value={selectedNicheId}
            onChange={e => setSelectedNicheId(e.target.value)}
          >
            {niches.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
          <button className="btn-accent" onClick={() => setIsModalOpen(true)}>+ Track New Market</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Market Size (Monthly)", value: `₹${activeNiche.marketSize.toLocaleString()}`, color: "var(--accent)" },
          { label: "Your Market Share", value: `${activeNiche.yourShare}%`, color: "var(--success)" },
          { label: "Total Competitors", value: activeNiche.totalCompetitors, color: "var(--blue)" },
          { label: "Market Growth", value: activeNiche.growthRate, color: "var(--purple)" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Pie Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>Market Share Distribution</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 16 }}>Top sellers by estimated revenue share</p>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={activeNiche.shareData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                  {activeNiche.shareData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}%`, "Share"]} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              {activeNiche.shareData.map(d => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>{d.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginLeft: "auto" }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Volume Trend */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>Market Volume Trend</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 16 }}>Monthly total search volume for the keyword: <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>{activeNiche.keyword}</span></p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activeNiche.volumeData}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--purple)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 10 }} formatter={(v: any) => [v.toLocaleString(), "Sales"]} />
              <Area type="monotone" dataKey="vol" stroke="var(--purple)" strokeWidth={2} fill="url(#volGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COMPETITORS TABLE */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 20 }}>Competitor Intelligence</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>RANK</th>
                <th>BRAND</th>
                <th>EST. REVENUE</th>
                <th>MARKET SHARE</th>
                <th>SHARE CHANGE</th>
              </tr>
            </thead>
            <tbody>
              {activeNiche.competitors.map(c => (
                <tr key={c.brand} style={{ background: c.brand.includes("You") ? "rgba(255,107,53,0.04)" : undefined }}>
                  <td style={{ fontWeight: 800, fontSize: 18, color: c.brand.includes("You") ? "var(--accent)" : "var(--text-muted)" }}>#{c.rank}</td>
                  <td style={{ fontWeight: 600, color: c.brand.includes("You") ? "var(--accent)" : "var(--text-primary)" }}>{c.brand}</td>
                  <td style={{ fontWeight: 700, color: "var(--success)" }}>₹{c.revenue.toLocaleString()}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-bar-fill" style={{ width: `${c.share}%`, background: c.brand.includes("You") ? "var(--accent)" : "var(--blue)" }} />
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{c.share}%</span>
                    </div>
                  </td>
                  <td style={{ color: c.change.startsWith("+") ? "var(--success)" : "var(--danger)", fontWeight: 700 }}>{c.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TRACK NEW MARKET */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-card" style={{ width: 440, padding: 28, position: "relative" }}>
            <button 
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              onClick={() => setIsModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Track New Niche Market</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Establish target share parameters and competitor analytics triggers.</p>

            <form onSubmit={handleCreateMarket} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Niche Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Silicone Baking Mats" 
                  value={newNicheName}
                  onChange={e => setNewNicheName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Primary Keyword</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. baking sheet silicone" 
                  value={newNicheKeyword}
                  onChange={e => setNewNicheKeyword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Monthly Market Volume Size (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={newNicheMarketSize}
                  onChange={e => setNewNicheMarketSize(e.target.value)}
                  min="5000"
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-accent" style={{ flex: 1 }}>Track Niche</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
