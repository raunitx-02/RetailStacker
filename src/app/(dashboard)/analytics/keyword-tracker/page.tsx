"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Trash2, X, Plus } from "lucide-react";
import confetti from "canvas-confetti";

interface TrackedKeyword {
  asin: string;
  kw: string;
  vol: number;
  rank: number;
  prev: number;
  change: number;
  peak: number;
  tracked: number;
}

const DEFAULT_KEYWORDS: TrackedKeyword[] = [
  // Bamboo Cutting Board B08XYZ1234
  { asin: "B08XYZ1234", kw: "bamboo cutting board", vol: 48200, rank: 4, prev: 7, change: 3, peak: 2, tracked: 30 },
  { asin: "B08XYZ1234", kw: "cutting board set", vol: 38900, rank: 12, prev: 9, change: -3, peak: 6, tracked: 30 },
  { asin: "B08XYZ1234", kw: "large cutting board", vol: 29400, rank: 8, prev: 11, change: 3, peak: 5, tracked: 30 },
  { asin: "B08XYZ1234", kw: "bamboo kitchen board", vol: 18700, rank: 3, prev: 3, change: 0, peak: 1, tracked: 28 },
  { asin: "B08XYZ1234", kw: "chopping board bamboo", vol: 14200, rank: 6, prev: 14, change: 8, peak: 4, tracked: 25 },
  { asin: "B08XYZ1234", kw: "eco friendly cutting board", vol: 11800, rank: 21, prev: 18, change: -3, peak: 12, tracked: 20 },
  { asin: "B08XYZ1234", kw: "juice groove cutting board", vol: 9200, rank: 1, prev: 2, change: 1, peak: 1, tracked: 30 },
  { asin: "B08XYZ1234", kw: "non slip cutting board", vol: 7800, rank: 15, prev: 22, change: 7, peak: 10, tracked: 15 },
  { asin: "B08XYZ1234", kw: "reversible bamboo board", vol: 6800, rank: 9, prev: 9, change: 0, peak: 7, tracked: 30 },
  { asin: "B08XYZ1234", kw: "sustainable cutting board", vol: 4200, rank: 38, prev: 29, change: -9, peak: 22, tracked: 12 },

  // Water Bottle B09ABC5678
  { asin: "B09ABC5678", kw: "stainless steel water bottle", vol: 54000, rank: 2, prev: 5, change: 3, peak: 1, tracked: 30 },
  { asin: "B09ABC5678", kw: "sports water bottle 32oz", vol: 32100, rank: 7, prev: 6, change: -1, peak: 4, tracked: 30 },
  { asin: "B09ABC5678", kw: "vacuum insulated flask", vol: 24900, rank: 14, prev: 18, change: 4, peak: 10, tracked: 22 },
  { asin: "B09ABC5678", kw: "leakproof bottle metal", vol: 11400, rank: 5, prev: 5, change: 0, peak: 3, tracked: 25 },
  { asin: "B09ABC5678", kw: "gym beverage thermos", vol: 8100, rank: 28, prev: 20, change: -8, peak: 18, tracked: 14 }
];

const getKeywordSeed = (keyword: string) => {
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) {
    hash = keyword.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const Sparkline = ({ rank, keyword }: { rank: number; keyword: string }) => {
  const points = Array.from({ length: 14 }, (_, i) => {
    const seed = getKeywordSeed(keyword + i);
    return Math.max(1, rank + Math.round(((seed % 10) - 5)));
  });
  const max = Math.max(...points);
  const min = Math.min(...points);
  const h = 30;
  const range = max - min || 1;
  const path = points.map((p, i) => `${(i / (points.length - 1)) * 80},${h - (((p - min) / range) * (h - 6) + 3)}`).join(" L ");
  return (
    <svg width="80" height={h} viewBox={`0 0 80 ${h}`} style={{ overflow: "visible" }}>
      <polyline points={path} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function KeywordTrackerPage() {
  const [activeAsin, setActiveAsin] = useState("B08XYZ1234");
  const [allKeywords, setAllKeywords] = useState<TrackedKeyword[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputKeywords, setInputKeywords] = useState("");

  // Load state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("neon10_keyword_tracker");
      if (saved) {
        setAllKeywords(JSON.parse(saved));
      } else {
        setAllKeywords(DEFAULT_KEYWORDS);
        localStorage.setItem("neon10_keyword_tracker", JSON.stringify(DEFAULT_KEYWORDS));
      }
    } catch (e) {
      console.error(e);
      setAllKeywords(DEFAULT_KEYWORDS);
    }
  }, []);

  const saveToStorage = (updated: TrackedKeyword[]) => {
    setAllKeywords(updated);
    localStorage.setItem("neon10_keyword_tracker", JSON.stringify(updated));
  };

  const handleDeleteKeyword = (kwStr: string) => {
    const updated = allKeywords.filter(item => !(item.asin === activeAsin && item.kw === kwStr));
    saveToStorage(updated);
  };

  const handleAddKeywords = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKeywords.trim()) return;

    const phrases = inputKeywords
      .split("\n")
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const newTrackers: TrackedKeyword[] = phrases.map(phrase => {
      const seed = getKeywordSeed(phrase);
      const randomVol = (seed % 45) * 1000 + 500;
      const initialRank = (seed % 95) + 3;
      const change = (seed % 11) - 5;
      const prev = initialRank - change;

      return {
        asin: activeAsin,
        kw: phrase.toLowerCase(),
        vol: randomVol,
        rank: initialRank,
        prev: prev,
        change: change,
        peak: Math.max(1, Math.min(initialRank, prev - 4)),
        tracked: 1,
      };
    });

    // Remove duplicates
    const uniqueNews = newTrackers.filter(n => !allKeywords.some(existing => existing.asin === activeAsin && existing.kw === n.kw));
    if (uniqueNews.length > 0) {
      const updated = [...allKeywords, ...uniqueNews];
      saveToStorage(updated);
      confetti({ particleCount: 50, spread: 45 });
    }

    setInputKeywords("");
    setIsModalOpen(false);
  };

  const currentKeywords = allKeywords.filter(k => k.asin === activeAsin);
  const avgRank = currentKeywords.length > 0 
    ? (currentKeywords.reduce((s, k) => s + k.rank, 0) / currentKeywords.length).toFixed(1) 
    : "0.0";
  const improvedCount = currentKeywords.filter(k => k.change > 0).length;
  const declinedCount = currentKeywords.filter(k => k.change < 0).length;

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Keyword Tracker</h1>
          <p className="page-subtitle">Monitor your organic keyword rankings daily and track SEO performance over time</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select 
            className="input-field" 
            style={{ width: "auto", cursor: "pointer" }}
            value={activeAsin}
            onChange={(e) => setActiveAsin(e.target.value)}
          >
            <option value="B08XYZ1234">B08XYZ1234 — Bamboo Cutting Board</option>
            <option value="B09ABC5678">B09ABC5678 — Stainless Steel Water Bottle</option>
          </select>
          <button className="btn-accent" onClick={() => setIsModalOpen(true)}>+ Add Keywords</button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Keywords Tracked", value: currentKeywords.length, color: "var(--text-secondary)" },
          { label: "Avg Rank", value: currentKeywords.length > 0 ? `#${avgRank}` : "—", color: "var(--blue)" },
          { label: "Improved Today", value: improvedCount, color: "var(--success)" },
          { label: "Declined Today", value: declinedCount, color: "var(--danger)" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* KEYWORDS TABLE */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>KEYWORD</th>
                <th>SEARCH VOLUME</th>
                <th>CURRENT RANK</th>
                <th>PREV. RANK</th>
                <th>CHANGE</th>
                <th>PEAK RANK</th>
                <th>30-DAY TREND</th>
                <th>DAYS TRACKED</th>
                <th style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentKeywords.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
                    No keywords are currently tracked for this ASIN. Click "+ Add Keywords" to begin.
                  </td>
                </tr>
              ) : (
                currentKeywords.map(kw => (
                  <tr key={kw.kw}>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{kw.kw}</td>
                    <td>{kw.vol.toLocaleString()}</td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: 16, color: kw.rank <= 5 ? "var(--success)" : kw.rank <= 15 ? "var(--warning)" : "var(--danger)" }}>
                        #{kw.rank}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>#{kw.prev}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {kw.change > 0 ? (
                          <>
                            <TrendingUp size={14} color="var(--success)" />
                            <span style={{ color: "var(--success)", fontWeight: 700 }}>+{kw.change}</span>
                          </>
                        ) : kw.change < 0 ? (
                          <>
                            <TrendingDown size={14} color="var(--danger)" />
                            <span style={{ color: "var(--danger)", fontWeight: 700 }}>{kw.change}</span>
                          </>
                        ) : (
                          <>
                            <Minus size={14} color="var(--text-muted)" />
                            <span style={{ color: "var(--text-muted)" }}>0</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td style={{ color: "var(--purple)", fontWeight: 700 }}>#{kw.peak}</td>
                    <td><Sparkline rank={kw.rank} keyword={kw.kw} /></td>
                    <td style={{ color: "var(--text-muted)" }}>{kw.tracked}d</td>
                    <td style={{ textAlign: "right" }}>
                      <button 
                        className="btn-ghost" 
                        style={{ padding: 6, minWidth: 0, color: "var(--danger)" }}
                        onClick={() => handleDeleteKeyword(kw.kw)}
                        title="Remove Tracking"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD KEYWORDS MODAL */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-card" style={{ width: 440, padding: 28, position: "relative" }}>
            <button 
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              onClick={() => setIsModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Add Keywords to Track</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Enter keywords (one per line) to monitor organic rankings on Amazon India.</p>

            <form onSubmit={handleAddKeywords} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Keyword Phrases</label>
                <textarea 
                  className="input-field" 
                  rows={6}
                  placeholder="e.g.&#10;organic serving tray&#10;chopping block extra large&#10;cheese board wood"
                  value={inputKeywords}
                  onChange={e => setInputKeywords(e.target.value)}
                  style={{ fontFamily: "monospace", resize: "none", fontSize: 13 }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-accent" style={{ flex: 1 }}>Start Tracking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
