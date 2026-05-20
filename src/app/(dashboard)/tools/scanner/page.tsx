"use client";

import { useState, useCallback } from "react";
import {
  Scan, Star, TrendingUp, TrendingDown, CheckCircle, AlertTriangle,
  ExternalLink, ChevronDown, ChevronUp, Zap, BarChart2, Package,
  Sparkles, ShieldCheck, Search, X,
} from "lucide-react";

interface SeoAnalysis { score: number; issues: string[]; wins: string[] }
interface Listing {
  asin: string; title: string; img: string; brand: string;
  price: string; bsr: number; reviews: number; rating: number; seo: SeoAnalysis;
}
interface AccountHealth { score: number; alerts: string[]; positives: string[] }
interface GrowthPrediction { asin: string; title: string; prediction: string; action: string; potential: string }
interface ScanData {
  overallScore: number; productsScanned: number; searchTerm: string;
  listings: Listing[]; accountHealth: AccountHealth;
  competitorGaps: string[]; growthPredictions: GrowthPrediction[];
  scannedAt: string;
}

const EXAMPLES = [
  "https://www.amazon.in/s?me=A3JWKAKR8XB7XF",
  "Boat Lifestyle",
  "Mamaearth",
  "B09W9FND7L",
];

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const color = score >= 75 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--danger)";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={size * 0.1} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={size * 0.1}
        strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dasharray 0.6s ease" }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.22} fontWeight="900">{score}</text>
    </svg>
  );
}

export default function ScannerPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const runScan = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true); setError(null); setData(null);
    try {
      const res = await fetch("/api/amazon/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input.trim() }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [input]);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Seller Health Scanner</h1>
          <p className="page-subtitle">
            Enter any Amazon Storefront URL, ASIN, or Brand Name to execute a comprehensive diagnostic audit and generate actionable AI growth forecasts.
          </p>
        </div>
        {data && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ScoreRing score={data.overallScore} size={72} />
            <div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Overall Health</div>
              <div style={{ fontWeight: 700, color: data.overallScore >= 75 ? "var(--success)" : data.overallScore >= 50 ? "var(--warning)" : "var(--danger)" }}>
                {data.overallScore >= 75 ? "Healthy" : data.overallScore >= 50 ? "Needs Attention" : "Critical Issues"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          Input an Amazon merchant URL, a specific product ASIN, or a brand name to initiate the diagnostic scan.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <input className="input-field"
            placeholder="https://amazon.in/s?me=... or 'Boat Lifestyle' or B09W9FND7L"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runScan()}
            style={{ flex: 1 }} />
          {input && <button className="btn-ghost" style={{ padding: "10px 14px" }} onClick={() => { setInput(""); setData(null); }}><X size={15} /></button>}
          <button className="btn-accent" onClick={runScan} disabled={loading || !input.trim()}
            style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 180 }}>
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Scanning...</> : <><Scan size={15} />Run AI Scan</>}
          </button>
        </div>
        {!data && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>Try:</span>
            {EXAMPLES.map(ex => (
              <button key={ex} className="btn-ghost" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => setInput(ex)}>
                {ex.length > 30 ? ex.slice(0, 28) + "..." : ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "var(--danger-muted)", border: "1px solid var(--danger)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>AI Scanner Running...</div>
          {["Fetching products from Keepa", "Analyzing listing SEO", "Scanning account health", "Generating growth predictions"].map((step, i) => (
            <div key={step} style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, animation: `fadeIn 0.5s ${i * 0.3}s both` }}>⟳ {step}</div>
          ))}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Products Scanned", value: data.productsScanned, color: "var(--accent)" },
              { label: "Account Health", value: `${data.accountHealth.score}/100`, color: data.accountHealth.score >= 75 ? "var(--success)" : "var(--warning)" },
              { label: "Critical Alerts", value: data.accountHealth.alerts.length, color: data.accountHealth.alerts.length > 2 ? "var(--danger)" : "var(--warning)" },
              { label: "Growth Opportunities", value: data.growthPredictions.length, color: "var(--purple)" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Account Health */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <ShieldCheck size={18} color="var(--accent)" />
              <h2 style={{ fontWeight: 700, fontSize: 16 }}>Account Health Report</h2>
              <ScoreRing score={data.accountHealth.score} size={52} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--danger)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>⚠ Alerts</div>
                {data.accountHealth.alerts.length === 0
                  ? <div style={{ fontSize: 13, color: "var(--success)" }}>✓ No critical alerts</div>
                  : data.accountHealth.alerts.map(a => (
                    <div key={a} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, alignItems: "flex-start" }}>
                      <AlertTriangle size={13} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ color: "var(--text-secondary)" }}>{a}</span>
                    </div>
                  ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--success)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>✓ Positives</div>
                {data.accountHealth.positives.map(p => (
                  <div key={p} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, alignItems: "flex-start" }}>
                    <CheckCircle size={13} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: "var(--text-secondary)" }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Competitor Gap */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <BarChart2 size={16} color="var(--purple)" />
              <h2 style={{ fontWeight: 700, fontSize: 16 }}>Competitor Gap Analysis</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.competitorGaps.map((gap, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: 10, fontSize: 13 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>→</span>
                  <span style={{ color: "var(--text-secondary)" }}>{gap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Predictions */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Sparkles size={16} color="var(--warning)" />
              <h2 style={{ fontWeight: 700, fontSize: 16 }}>AI Growth Predictions</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.growthPredictions.map(gp => (
                <div key={gp.asin} style={{ padding: "14px 18px", background: "var(--bg-secondary)", borderRadius: 12, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{gp.title}...</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{gp.asin}</div>
                    </div>
                    <span style={{ background: "var(--warning-muted)", color: "var(--warning)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 50, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {gp.prediction}
                    </span>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>RECOMMENDED ACTION</div>
                      <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{gp.action}</div>
                    </div>
                    <div style={{ background: "var(--success-muted)", border: "1px solid rgba(52,199,89,0.3)", borderRadius: 8, padding: "6px 12px" }}>
                      <div style={{ fontSize: 11, color: "var(--success)", fontWeight: 700 }}>POTENTIAL</div>
                      <div style={{ fontSize: 13, color: "var(--success)", fontWeight: 600 }}>{gp.potential}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Listing SEO Breakdown */}
          <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
              <Search size={16} color="var(--accent)" />
              <h2 style={{ fontWeight: 700, fontSize: 16 }}>Listing SEO Breakdown</h2>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>· {data.listings.length} listings analyzed</span>
            </div>
            {data.listings.map(listing => (
              <div key={listing.asin} style={{ borderBottom: "1px solid var(--border)" }}>
                <div
                  style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                  onClick={() => setExpanded(expanded === listing.asin ? null : listing.asin)}
                >
                  <div style={{ width: 48, height: 48, background: "#fff", borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={listing.img} alt={listing.title}
                      onError={e => { (e.target as HTMLImageElement).src = `https://images.amazon.com/images/P/${listing.asin}.01._SCLZZZZZZZ_.jpg`; }}
                      style={{ width: 44, height: 44, objectFit: "contain" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{listing.title}</div>
                    <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{listing.asin}</span>
                      <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{listing.price}</span>
                      {listing.bsr > 0 && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>BSR #{listing.bsr.toLocaleString("en-IN")}</span>}
                      {listing.rating > 0 && <span style={{ fontSize: 12, color: "var(--warning)" }}>★ {listing.rating.toFixed(1)}</span>}
                    </div>
                  </div>
                  <ScoreRing score={listing.seo.score} size={52} />
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    {expanded === listing.asin ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                    onClick={e => { e.stopPropagation(); window.open(`https://www.amazon.in/dp/${listing.asin}`, "_blank"); }}>
                    <ExternalLink size={14} />
                  </button>
                </div>

                {expanded === listing.asin && (
                  <div style={{ padding: "0 24px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--danger)", marginBottom: 8, textTransform: "uppercase" }}>Issues Found</div>
                      {listing.seo.issues.length === 0
                        ? <div style={{ fontSize: 13, color: "var(--success)" }}>✓ No issues detected</div>
                        : listing.seo.issues.map(issue => (
                          <div key={issue} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13, alignItems: "flex-start" }}>
                            <AlertTriangle size={13} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
                            <span style={{ color: "var(--text-secondary)" }}>{issue}</span>
                          </div>
                        ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--success)", marginBottom: 8, textTransform: "uppercase" }}>Strengths</div>
                      {listing.seo.wins.length === 0
                        ? <div style={{ fontSize: 13, color: "var(--text-muted)" }}>—</div>
                        : listing.seo.wins.map(win => (
                          <div key={win} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13, alignItems: "flex-start" }}>
                            <CheckCircle size={13} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
                            <span style={{ color: "var(--text-secondary)" }}>{win}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { icon: <Search size={22} color="var(--accent)" />, title: "Listing SEO Scanner", desc: "Missing keywords, weak title, image issues, backend term gaps" },
            { icon: <BarChart2 size={22} color="var(--purple)" />, title: "Competitor Gap Analysis", desc: "Review gap, image count, pricing strategy vs top 5 rivals" },
            { icon: <ShieldCheck size={22} color="var(--success)" />, title: "Account Health", desc: "Return risk, policy violations, suppressed listings, low inventory" },
            { icon: <Sparkles size={22} color="var(--warning)" />, title: "AI Growth Predictions", desc: "Which listings scale, which need fixing, and fastest ROI actions" },
          ].map(c => (
            <div key={c.title} className="stat-card">
              <div style={{ marginBottom: 12 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{c.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
