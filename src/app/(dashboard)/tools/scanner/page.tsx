"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Scan,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart2,
  Package,
  Sparkles,
  ShieldCheck,
  Search,
  X,
  Shield,
  ArrowRight,
  Activity,
  FileText,
} from "lucide-react";

interface Checklist {
  titleLength: number;
  titleGrade: "Excellent" | "Good" | "Poor";
  bulletCount: number;
  bulletGrade: "Excellent" | "Good" | "Poor";
  imageCount: number;
  imageGrade: "Excellent" | "Good" | "Poor";
  descriptionLength: number;
  descriptionGrade: "Excellent" | "Good" | "Poor";
  hasAplus: boolean;
}

interface SeoAnalysis {
  score: number;
  issues: string[];
  wins: string[];
  checklist: Checklist;
}

interface Listing {
  asin: string;
  title: string;
  shortTitle: string;
  img: string;
  brand: string;
  price: number;
  formattedPrice: string;
  bsr: number;
  reviews: number;
  rating: number;
  monthlySold: number;
  monthlyRevenue: number;
  formattedMonthlyRevenue: string;
  fbaFee: number;
  formattedFbaFee: string;
  referralFeePercent: number;
  referralFee: number;
  formattedReferralFee: string;
  gstPercent: number;
  gst: number;
  formattedGst: string;
  cogs: number;
  formattedCogs: string;
  netProfit: number;
  formattedNetProfit: string;
  netMargin: number;
  bulletCount: number;
  descriptionLength: number;
  buyBoxOwner: string;
  priceAvg30: number;
  formattedPriceAvg30: string;
  priceAvg90: number;
  formattedPriceAvg90: string;
  priceStability: "Stable" | "Highly Volatile" | "Price War Alert";
  opportunity: "High" | "Medium" | "Low";
  seo: SeoAnalysis;
}

interface AccountHealth {
  score: number;
  alerts: string[];
  positives: string[];
}

interface GrowthPrediction {
  asin: string;
  title: string;
  prediction: string;
  action: string;
  potential: string;
}

interface ScanData {
  brandName: string;
  overallScore: number;
  productsScanned: number;
  searchTerm: string;
  totalRevenue: number;
  formattedTotalRevenue: string;
  totalUnitsSold: number;
  avgBSR: number;
  avgRating: number;
  totalReviews: number;
  listings: Listing[];
  accountHealth: AccountHealth;
  competitorGaps: string[];
  growthPredictions: GrowthPrediction[];
  scannedAt: string;
}

function ScoreRing({ score, size = 80, strokeWidth }: { score: number; size?: number; strokeWidth?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const sWidth = strokeWidth || size * 0.1;
  const color = score >= 75 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--danger)";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={sWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sWidth}
        strokeDasharray={`${(score / 100) * circ} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={size * 0.22}
        fontWeight="900"
      >
        {score}%
      </text>
    </svg>
  );
}

function GradeBadge({ grade }: { grade: "Excellent" | "Good" | "Poor" }) {
  const bg =
    grade === "Excellent"
      ? "var(--success-muted)"
      : grade === "Good"
      ? "var(--warning-muted)"
      : "var(--danger-muted)";
  const color =
    grade === "Excellent"
      ? "var(--success)"
      : grade === "Good"
      ? "var(--warning)"
      : "var(--danger)";
  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 4,
        textTransform: "uppercase",
      }}
    >
      {grade}
    </span>
  );
}

export default function ScannerPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"portfolio" | "seo" | "finance" | "buybox" | "roadmap">("portfolio");

  // Step loading simulation to keep user engaged during Keepa fetches
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev < 6 ? prev + 1 : prev));
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const runScan = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    setExpandedRow(null);
    try {
      const res = await fetch("/api/amazon/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input.trim() }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setActiveTab("portfolio");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [input]);

  const getStatusColor = (score: number) => {
    return score >= 75 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--danger)";
  };

  const getPriceStabilityColor = (stability: string) => {
    if (stability === "Stable") return "var(--success)";
    if (stability === "Highly Volatile") return "var(--warning)";
    return "var(--danger)";
  };

  const getBuyBoxBadge = (owner: string) => {
    if (owner === "Amazon") {
      return { bg: "var(--danger-muted)", color: "var(--danger)", label: "Amazon Held (Critical)" };
    }
    if (owner === "FBA Seller") {
      return { bg: "var(--success-muted)", color: "var(--success)", label: "FBA Seller (Healthy)" };
    }
    if (owner === "FBM Seller") {
      return { bg: "var(--warning-muted)", color: "var(--warning)", label: "FBM Seller (Fair)" };
    }
    return { bg: "var(--border)", color: "var(--text-muted)", label: "Suppressed Buy Box" };
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Scan color="var(--accent)" size={28} /> AI Seller & Brand Scanner
          </h1>
          <p className="page-subtitle">
            Perform an exhaustive live audit on any Amazon storefront URL, specific brand, or list of ASINs. Powered by direct Keepa integrations for real-time India (₹) statistics.
          </p>
        </div>
        {data && (
          <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 24px" }}>
            <ScoreRing score={data.overallScore} size={64} strokeWidth={6} />
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Brand Standing</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: getStatusColor(data.overallScore), marginTop: 2 }}>
                {data.overallScore >= 75 ? "Excellent Status" : data.overallScore >= 50 ? "Needs Alignment" : "High Alert Status"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Section - Clean, no preset buttons */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, var(--accent), var(--purple))" }} />
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={16} color="var(--accent)" /> Enter Audit Subject
        </h3>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            className="input-field"
            placeholder="Paste Amazon Storefront URL, type Brand Name (e.g. Mamaearth), or enter comma-separated ASINs..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runScan()}
            disabled={loading}
            style={{ flex: 1, fontSize: 14 }}
          />
          {input && (
            <button className="btn-ghost" style={{ padding: "10px 14px", border: "1px solid var(--border)" }} onClick={() => { setInput(""); setData(null); }} disabled={loading}>
              <X size={15} />
            </button>
          )}
          <button
            className="btn-accent"
            onClick={runScan}
            disabled={loading || !input.trim()}
            style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 160, justifyContent: "center", fontWeight: 700 }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 14, height: 14 }} /> Scanning...
              </>
            ) : (
              <>
                <Scan size={15} /> Execute Brand Audit
              </>
            )}
          </button>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>
          💡 Paste a storefront URL (containing <code>me=</code> or <code>seller=</code>), type an active seller's brand name, or list up to 10 ASINs separated by commas.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: "var(--danger-muted)", border: "1px solid var(--danger)", borderRadius: 12, padding: "14px 20px", marginBottom: 24, color: "var(--danger)", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={18} />
          <div>
            <div style={{ fontWeight: 700 }}>Scan Audit Failed</div>
            <div style={{ fontSize: 13, marginTop: 2 }}>{error}</div>
          </div>
        </div>
      )}

      {/* Loading Skeletons State */}
      {loading && (
        <div className="glass-card" style={{ padding: 48, textAlign: "center", border: "1px solid var(--border)" }}>
          <div className="spinner" style={{ margin: "0 auto 20px", width: 44, height: 44 }} />
          <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "var(--accent)" }}>AI Seller Scanner Engaged</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 450, margin: "0 auto 24px" }}>
            RetailStacker is pulling real-time performance indicators directly from Keepa APIs for the Amazon India market.
          </p>
          
          <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "left", background: "var(--bg-primary)", borderRadius: 12, padding: "16px 24px", border: "1px solid var(--border)" }}>
            {[
              { step: 0, text: "Establishing secure Keepa API tunnel..." },
              { step: 1, text: "Parsing seller storefront inventory catalog..." },
              { step: 2, text: "Evaluating listing Title & Bullet Point structures..." },
              { step: 3, text: "Auditing product image gallery assets..." },
              { step: 4, text: "Calculating unit FBA fees & Referral commissions..." },
              { step: 5, text: "Analyzing Buy Box status & price history volatility..." },
              { step: 6, text: "Synthesizing AI Seller Scorecard & Growth Roadmap..." }
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0", fontSize: 13 }}>
                {loadingStep > s.step ? (
                  <CheckCircle size={15} color="var(--success)" style={{ flexShrink: 0 }} />
                ) : loadingStep === s.step ? (
                  <div className="spinner" style={{ width: 12, height: 12, borderColor: "var(--accent) transparent transparent transparent" }} />
                ) : (
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--border)" }} />
                )}
                <span style={{
                  color: loadingStep === s.step ? "var(--text-primary)" : loadingStep > s.step ? "var(--text-secondary)" : "var(--text-muted)",
                  fontWeight: loadingStep === s.step ? 700 : 400
                }}>
                  {s.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Results Dashboard */}
      {data && !loading && (
        <div style={{ animation: "fadeIn 0.5s ease-out both" }}>
          
          {/* Brand Aggregations & Performance Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Est. Monthly Revenue", value: data.formattedTotalRevenue, icon: <TrendingUp size={18} color="var(--success)" />, border: "var(--success)" },
              { label: "Est. Monthly Sales", value: `${data.totalUnitsSold.toLocaleString("en-IN")} units`, icon: <Package size={18} color="var(--accent)" />, border: "var(--accent)" },
              { label: "Average Sales Rank (BSR)", value: data.avgBSR > 0 ? `#${data.avgBSR.toLocaleString("en-IN")}` : "N/A", icon: <BarChart2 size={18} color="var(--purple)" />, border: "var(--purple)" },
              { label: "Average Rating", value: data.avgRating > 0 ? `${data.avgRating} ★` : "N/A", icon: <Star size={18} color="var(--warning)" />, border: "var(--warning)" },
              { label: "Total Reviews Tracked", value: data.totalReviews.toLocaleString("en-IN"), icon: <Activity size={18} color="var(--blue)" />, border: "var(--blue)" }
            ].map((c) => (
              <div key={c.label} className="stat-card" style={{ padding: 20, borderLeft: `4px solid ${c.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</span>
                  {c.icon}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)" }}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* Brand Standing & Account Health Diagnostics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* Account Health Overview */}
            <div className="glass-card" style={{ padding: 24, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: 12, marginBottom: 16 }}>
                <Shield size={20} color="var(--accent)" />
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Seller Account Integrity</h3>
                <span style={{ marginLeft: "auto" }}>
                  <ScoreRing score={data.accountHealth.score} size={48} strokeWidth={4} />
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--danger)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>⚠️ Risk Indicators ({data.accountHealth.alerts.length})</div>
                  {data.accountHealth.alerts.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--success)" }}>✓ No operational risks found.</div>
                  ) : (
                    data.accountHealth.alerts.map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 12, alignItems: "flex-start" }}>
                        <AlertTriangle size={12} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ color: "var(--text-secondary)" }}>{a}</span>
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>✓ Positive Strengths ({data.accountHealth.positives.length})</div>
                  {data.accountHealth.positives.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 12, alignItems: "flex-start" }}>
                      <CheckCircle size={12} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: "var(--text-secondary)" }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Competitor Gap Analysis */}
            <div className="glass-card" style={{ padding: 24, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <BarChart2 size={20} color="var(--purple)" />
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Niche Benchmarking & Gaps</h3>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                Analysis of the brand's catalog positioning compared to standard category benchmarks on Amazon India.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.competitorGaps.map((gap, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: "var(--bg-primary)", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, alignItems: "center" }}>
                    <ArrowRight size={14} color="var(--purple)" style={{ flexShrink: 0 }} />
                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Tabs for Deep-Dive Sections */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", gap: 8, marginBottom: 20, overflowX: "auto" }}>
            {[
              { id: "portfolio", label: "📊 Portfolio Overview", desc: "Active Catalog Listings" },
              { id: "seo", label: "🔍 Listing SEO Audit", desc: "Detailed Checklist Grades" },
              { id: "finance", label: "💰 Financial Intelligence", desc: "Unit Margins & Fees" },
              { id: "buybox", label: "📦 Buy Box & Pricing", desc: "Competitiveness & Volatility" },
              { id: "roadmap", label: "🚀 AI Growth Roadmap", desc: "Priority Action Plan" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "3px solid var(--accent)" : "3px solid transparent",
                  padding: "12px 18px",
                  color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
                  fontWeight: activeTab === tab.id ? 800 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  textAlign: "left"
                }}
              >
                <div>{tab.label}</div>
                <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 400, marginTop: 2 }}>{tab.desc}</div>
              </button>
            ))}
          </div>

          {/* Tab Content Display Area */}
          <div className="glass-card" style={{ padding: 24, border: "1px solid var(--border)", minHeight: 400 }}>
            
            {/* TAB 1: PORTFOLIO OVERVIEW */}
            {activeTab === "portfolio" && (
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Brand Product Catalog</h4>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
                  High-level performance index of all analyzed brand ASINs. Click on any row to expand a detailed summary.
                </p>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)", fontSize: 12, color: "var(--text-muted)" }}>
                        <th style={{ padding: "10px 12px" }}>Product Listing</th>
                        <th style={{ padding: "10px 12px" }}>Price</th>
                        <th style={{ padding: "10px 12px" }}>Sales Rank (BSR)</th>
                        <th style={{ padding: "10px 12px" }}>Est. Monthly Sales</th>
                        <th style={{ padding: "10px 12px" }}>Monthly Revenue</th>
                        <th style={{ padding: "10px 12px" }}>Net Margin</th>
                        <th style={{ padding: "10px 12px" }}>SEO</th>
                        <th style={{ padding: "10px 12px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.listings.map((l) => {
                        const isExpanded = expandedRow === l.asin;
                        return (
                          <optgroup key={l.asin} label="" style={{ display: "contents" }}>
                            <tr
                              onClick={() => setExpandedRow(isExpanded ? null : l.asin)}
                              style={{
                                borderBottom: "1px solid var(--border)",
                                cursor: "pointer",
                                background: isExpanded ? "var(--bg-primary)" : "transparent",
                                transition: "all 0.15s ease",
                                fontSize: 13
                              }}
                              className="hover-row"
                            >
                              {/* Product Title / Thumbnail */}
                              <td style={{ padding: "14px 12px", display: "flex", alignItems: "center", gap: 12, minWidth: 280 }}>
                                <div style={{ width: 40, height: 40, background: "#fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid var(--border)", flexShrink: 0 }}>
                                  <img src={l.img} alt={l.asin} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 2 }} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)" }}>{l.shortTitle}</div>
                                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontFamily: "monospace" }}>{l.asin} | {l.brand}</div>
                                </div>
                              </td>

                              {/* Price */}
                              <td style={{ padding: "14px 12px", fontWeight: 700, color: "var(--accent)" }}>{l.formattedPrice}</td>

                              {/* BSR */}
                              <td style={{ padding: "14px 12px" }}>{l.bsr > 0 ? `#${l.bsr.toLocaleString("en-IN")}` : "N/A"}</td>

                              {/* Est Monthly Sales */}
                              <td style={{ padding: "14px 12px", fontWeight: 600 }}>{l.monthlySold.toLocaleString("en-IN")} units</td>

                              {/* Monthly Revenue */}
                              <td style={{ padding: "14px 12px", fontWeight: 700 }}>{l.formattedMonthlyRevenue}</td>

                              {/* Margin */}
                              <td style={{ padding: "14px 12px" }}>
                                <span style={{
                                  background: l.netMargin >= 30 ? "var(--success-muted)" : l.netMargin >= 15 ? "var(--warning-muted)" : "var(--danger-muted)",
                                  color: l.netMargin >= 30 ? "var(--success)" : l.netMargin >= 15 ? "var(--warning)" : "var(--danger)",
                                  fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4
                                }}>
                                  {l.netMargin}%
                                </span>
                              </td>

                              {/* SEO Score */}
                              <td style={{ padding: "14px 12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontWeight: 800, color: getStatusColor(l.seo.score) }}>{l.seo.score}</span>
                                </div>
                              </td>

                              {/* Actions */}
                              <td style={{ padding: "14px 12px", textAlign: "right" }}>
                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`https://www.amazon.in/dp/${l.asin}`, "_blank");
                                    }}
                                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
                                    title="View on Amazon"
                                  >
                                    <ExternalLink size={14} />
                                  </button>
                                  {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                                </div>
                              </td>
                            </tr>

                            {/* Expandable summary row */}
                            {isExpanded && (
                              <tr style={{ background: "var(--bg-primary)" }}>
                                <td colSpan={8} style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                                    {/* Quick P&L */}
                                    <div style={{ background: "var(--bg-secondary)", padding: 14, borderRadius: 8, border: "1px solid var(--border)" }}>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" }}>Quick unit economics</div>
                                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, margin: "4px 0" }}>
                                        <span>Retail Price:</span>
                                        <span style={{ fontWeight: 700 }}>{l.formattedPrice}</span>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, margin: "4px 0" }}>
                                        <span>FBA Fees:</span>
                                        <span style={{ color: "var(--text-secondary)" }}>{l.formattedFbaFee}</span>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, margin: "4px 0" }}>
                                        <span>Net Unit profit:</span>
                                        <span style={{ color: "var(--success)", fontWeight: 700 }}>{l.formattedNetProfit}</span>
                                      </div>
                                    </div>

                                    {/* Top Wins */}
                                    <div>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", marginBottom: 8, textTransform: "uppercase" }}>Listing Strengths</div>
                                      {l.seo.wins.slice(0, 3).map((w, idx) => (
                                        <div key={idx} style={{ display: "flex", gap: 6, fontSize: 12, marginBottom: 4, alignItems: "flex-start" }}>
                                          <CheckCircle size={12} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
                                          <span>{w}</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Top Issues */}
                                    <div>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--danger)", marginBottom: 8, textTransform: "uppercase" }}>Critical Fixes Required</div>
                                      {l.seo.issues.length === 0 ? (
                                        <div style={{ fontSize: 12, color: "var(--success)" }}>✓ No issues detected for this product.</div>
                                      ) : (
                                        l.seo.issues.slice(0, 3).map((issue, idx) => (
                                          <div key={idx} style={{ display: "flex", gap: 6, fontSize: 12, marginBottom: 4, alignItems: "flex-start" }}>
                                            <AlertTriangle size={12} color="var(--danger)" style={{ marginTop: 2, flexShrink: 0 }} />
                                            <span style={{ color: "var(--text-secondary)" }}>{issue}</span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </optgroup>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: LISTING SEO AUDIT */}
            {activeTab === "seo" && (
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Granular SEO Audits</h4>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
                  Detailed checklist evaluating listing properties for every product. Optimize title lengths, bullet points count, image counts, and description content to increase conversion.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {data.listings.map((l) => (
                    <div key={l.asin} className="glass-card" style={{ padding: 20, border: "1px solid var(--border)" }}>
                      {/* Product Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img src={l.img} alt={l.asin} style={{ width: 36, height: 36, objectFit: "contain", background: "#fff", padding: 2, borderRadius: 4 }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{l.title}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontFamily: "monospace" }}>{l.asin}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>SEO Index Score</span>
                          <ScoreRing score={l.seo.score} size={48} strokeWidth={4} />
                        </div>
                      </div>

                      {/* Checklist Cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
                        {/* Title Audit */}
                        <div style={{ background: "var(--bg-primary)", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>TITLE AUDIT</span>
                            <GradeBadge grade={l.seo.checklist.titleGrade} />
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, margin: "4px 0" }}>{l.seo.checklist.titleLength} Characters</div>
                          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                            {l.seo.checklist.titleGrade === "Excellent"
                              ? "Excellent keyword weight and character density."
                              : l.seo.checklist.titleLength < 80
                              ? "Increase to 150+ chars to target long-tail search traffic."
                              : "Truncated on mobile devices. Shorten to under 200 chars."}
                          </p>
                        </div>

                        {/* Bullets Audit */}
                        <div style={{ background: "var(--bg-primary)", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>BULLET POINTS</span>
                            <GradeBadge grade={l.seo.checklist.bulletGrade} />
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, margin: "4px 0" }}>{l.seo.checklist.bulletCount} Key Features</div>
                          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                            {l.seo.checklist.bulletGrade === "Excellent"
                              ? "Maximum bullet count achieved for customer engagement."
                              : "Aim for at least 5 structured bullet points highlighting features."}
                          </p>
                        </div>

                        {/* Image Gallery */}
                        <div style={{ background: "var(--bg-primary)", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>IMAGE GALLERY</span>
                            <GradeBadge grade={l.seo.checklist.imageGrade} />
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, margin: "4px 0" }}>{l.seo.checklist.imageCount} Gallery Images</div>
                          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                            {l.seo.checklist.imageGrade === "Excellent"
                              ? "Excellent image variety including lifestyle/info cards."
                              : "Aim for 6-7 images to cover product details and lifestyle cues."}
                          </p>
                        </div>

                        {/* Description Audit */}
                        <div style={{ background: "var(--bg-primary)", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>DESCRIPTION & A+</span>
                            <GradeBadge grade={l.seo.checklist.descriptionGrade} />
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, margin: "4px 0" }}>
                            {l.seo.checklist.descriptionLength.toLocaleString()} Chars
                          </div>
                          <div style={{ fontSize: 10, color: l.seo.checklist.hasAplus ? "var(--success)" : "var(--warning)", fontWeight: 700, marginTop: 2 }}>
                            {l.seo.checklist.hasAplus ? "✓ Premium A+ Content Active" : "⚠ No Premium A+ Layout Found"}
                          </div>
                        </div>
                      </div>

                      {/* Issues & Strengths list */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div style={{ background: "var(--danger-muted)", padding: 12, borderRadius: 6, border: "1px solid rgba(255, 75, 75, 0.1)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--danger)", marginBottom: 6 }}>🚨 DETECTED SEO ISSUES ({l.seo.issues.length})</div>
                          {l.seo.issues.length === 0 ? (
                            <div style={{ fontSize: 12, color: "var(--success)" }}>✓ Listing complies perfectly with Amazon SEO rules.</div>
                          ) : (
                            l.seo.issues.map((iss, i) => (
                              <div key={i} style={{ display: "flex", gap: 6, fontSize: 12, marginBottom: 4, alignItems: "flex-start" }}>
                                <AlertTriangle size={12} color="var(--danger)" style={{ marginTop: 2, flexShrink: 0 }} />
                                <span style={{ color: "var(--text-secondary)" }}>{iss}</span>
                              </div>
                            ))
                          )}
                        </div>
                        <div style={{ background: "var(--success-muted)", padding: 12, borderRadius: 6, border: "1px solid rgba(52, 199, 89, 0.1)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", marginBottom: 6 }}>🏆 LISTING WINS ({l.seo.wins.length})</div>
                          {l.seo.wins.map((w, i) => (
                            <div key={i} style={{ display: "flex", gap: 6, fontSize: 12, marginBottom: 4, alignItems: "flex-start" }}>
                              <CheckCircle size={12} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
                              <span style={{ color: "var(--text-secondary)" }}>{w}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: FINANCIAL INTELLIGENCE */}
            {activeTab === "finance" && (
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Financial Margin & Unit Economics Audit</h4>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
                  Granular financial margins calibrated for India Amazon FBA sellers. Includes estimated Cost of Goods Sold (COGS 35%), actual Referral Commissions, FBA logistics fees, and standard GST slabs (18%).
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {data.listings.map((l) => (
                    <div key={l.asin} className="glass-card" style={{ padding: 20, border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                        <img src={l.img} alt={l.asin} style={{ width: 36, height: 36, objectFit: "contain", background: "#fff", padding: 2, borderRadius: 4 }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{l.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{l.asin}</div>
                        </div>
                        <span style={{
                          marginLeft: "auto",
                          background: l.netMargin >= 30 ? "var(--success-muted)" : l.netMargin >= 15 ? "var(--warning-muted)" : "var(--danger-muted)",
                          color: l.netMargin >= 30 ? "var(--success)" : l.netMargin >= 15 ? "var(--warning)" : "var(--danger)",
                          fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 50
                        }}>
                          {l.netMargin}% Gross Net Margin
                        </span>
                      </div>

                      {/* Margin Progress visualizer bar */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
                          <span>Cost structure visual breakdown (COGS + FBA + Referral + GST vs Profit)</span>
                          <span>Retail Price: {l.formattedPrice}</span>
                        </div>
                        <div style={{ height: 16, borderRadius: 8, overflow: "hidden", display: "flex", border: "1px solid var(--border)" }}>
                          <div style={{ flex: 35, background: "var(--purple)", height: "100%" }} title={`COGS (35%): ${l.formattedCogs}`} />
                          <div style={{ flex: Math.round((l.fbaFee / l.price) * 100) || 5, background: "var(--accent)", height: "100%" }} title={`FBA Fee: ${l.formattedFbaFee}`} />
                          <div style={{ flex: l.referralFeePercent, background: "var(--blue)", height: "100%" }} title={`Referral Fee (${l.referralFeePercent}%): ${l.formattedReferralFee}`} />
                          <div style={{ flex: l.gstPercent, background: "var(--text-muted)", height: "100%" }} title={`GST Tax (${l.gstPercent}%): ${l.formattedGst}`} />
                          <div style={{ flex: l.netMargin || 5, background: "var(--success)", height: "100%" }} title={`Net Margin (${l.netMargin}%): ${l.formattedNetProfit}`} />
                        </div>
                        <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 10, color: "var(--text-muted)", justifyContent: "center", flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, background: "var(--purple)", borderRadius: "50%" }} /> COGS (35%)</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, background: "var(--accent)", borderRadius: "50%" }} /> FBA Fees</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, background: "var(--blue)", borderRadius: "50%" }} /> Amazon Comm.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, background: "var(--text-secondary)", borderRadius: "50%" }} /> GST Tax (18%)</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, background: "var(--success)", borderRadius: "50%" }} /> Net Profit Margin</span>
                        </div>
                      </div>

                      {/* Detailed P&L breakdown table */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid var(--border)", paddingBottom: 4 }}>
                            <span style={{ color: "var(--text-muted)" }}>Target unit retail price</span>
                            <span style={{ fontWeight: 700 }}>{l.formattedPrice}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid var(--border)", paddingBottom: 4 }}>
                            <span style={{ color: "var(--text-muted)" }}>Estimated Cost of Goods (COGS)</span>
                            <span>- {l.formattedCogs}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid var(--border)", paddingBottom: 4 }}>
                            <span style={{ color: "var(--text-muted)" }}>FBA Fulfillment Logistics Fee</span>
                            <span>- {l.formattedFbaFee}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid var(--border)", paddingBottom: 4 }}>
                            <span style={{ color: "var(--text-muted)" }}>Referral Commission ({l.referralFeePercent}%)</span>
                            <span>- {l.formattedReferralFee}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid var(--border)", paddingBottom: 4 }}>
                            <span style={{ color: "var(--text-muted)" }}>GST Tax slab (18%)</span>
                            <span>- {l.formattedGst}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid var(--border)", paddingBottom: 4 }}>
                            <span style={{ fontWeight: 700, color: "var(--success)" }}>Unit Net Profit (₹)</span>
                            <span style={{ fontWeight: 800, color: "var(--success)" }}>{l.formattedNetProfit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cumulative margins */}
                      <div style={{ marginTop: 14, background: "var(--bg-primary)", borderRadius: 8, padding: "10px 14px", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          Est. sales contribution based on <strong>{l.monthlySold.toLocaleString("en-IN")} sales/mo</strong>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800 }}>
                          Monthly profit margin contribution:{" "}
                          <span style={{ color: "var(--success)" }}>
                            ₹{Math.round(l.monthlySold * l.netProfit).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: BUY BOX & PRICING */}
            {activeTab === "buybox" && (
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Buy Box Contention & Pricing Analysis</h4>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
                  Auditing Buy Box stability and identifying pricing fluctuation risks. Listings competing directly against Amazon or experiencing price wars can suffer major margin erosion.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {data.listings.map((l) => {
                    const badge = getBuyBoxBadge(l.buyBoxOwner);
                    return (
                      <div key={l.asin} className="glass-card" style={{ padding: 20, border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                          <img src={l.img} alt={l.asin} style={{ width: 36, height: 36, objectFit: "contain", background: "#fff", padding: 2, borderRadius: 4 }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{l.title}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{l.asin}</div>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                          {/* Left card: Buy Box State */}
                          <div style={{ background: "var(--bg-primary)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase" }}>BUY BOX OWNERSHIP</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                              <span style={{
                                background: badge.bg,
                                color: badge.color,
                                fontSize: 13,
                                fontWeight: 800,
                                padding: "4px 12px",
                                borderRadius: 6
                              }}>
                                {badge.label}
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                              {l.buyBoxOwner === "Amazon"
                                ? "🚨 WARNING: Amazon holds the Buy Box. Competing against Amazon retail directly usually results in depressed margins and low FBA visibility."
                                : l.buyBoxOwner === "Suppressed"
                                ? "❌ Buy Box is Suppressed. This is usually due to pricing limits. Check your MSRP or pricing settings."
                                : "✓ Healthy 3rd-party seller standing. Opportunity for stable organic growth."}
                            </p>
                          </div>

                          {/* Right card: Price Averages and Trends */}
                          <div style={{ background: "var(--bg-primary)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>PRICE HISTORY DIAGNOSTIC</span>
                              <span style={{
                                color: getPriceStabilityColor(l.priceStability),
                                fontSize: 11,
                                fontWeight: 800,
                                background: l.priceStability === "Stable" ? "var(--success-muted)" : "var(--danger-muted)",
                                padding: "2px 8px",
                                borderRadius: 4
                              }}>
                                {l.priceStability} Pricing
                              </span>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "12px 0" }}>
                              <div style={{ textAlign: "center", borderRight: "1px solid var(--border)" }}>
                                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Current Price</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--accent)", marginTop: 4 }}>{l.formattedPrice}</div>
                              </div>
                              <div style={{ textAlign: "center", borderRight: "1px solid var(--border)" }}>
                                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>30-Day Average</div>
                                <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{l.formattedPriceAvg30}</div>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>90-Day Average</div>
                                <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{l.formattedPriceAvg90}</div>
                              </div>
                            </div>

                            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                              {l.priceStability === "Price War Alert"
                                ? "⚠️ Price has dropped > 15% below the 90-day average. A pricing war is active; review repricer settings immediately to protect margins."
                                : l.priceStability === "Highly Volatile"
                                ? "⚠️ Price is fluctuating. Consider stabilizing pricing strategies to prevent buy box suppression."
                                : "✓ Prices are highly stable. Brand controls listing distribution successfully."}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: AI GROWTH ROADMAP */}
            {activeTab === "roadmap" && (
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Tailored AI Growth Strategy & Task List</h4>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
                  AI-prioritized roadmap outlining immediate operational improvements and marketing strategies to maximize sales contribution.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {data.growthPredictions.map((gp, idx) => {
                    const l = data.listings.find((item) => item.asin === gp.asin);
                    return (
                      <div key={gp.asin} className="glass-card" style={{ padding: 20, border: "1px solid var(--border)", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ background: "var(--accent-muted)", width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "var(--accent)" }}>
                              {idx + 1}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{gp.title}...</div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontFamily: "monospace" }}>{gp.asin}</div>
                            </div>
                          </div>
                          <span style={{
                            background: "var(--warning-muted)",
                            color: "var(--warning)",
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 4,
                            textTransform: "uppercase"
                          }}>
                            {gp.prediction}
                          </span>
                        </div>

                        {/* Checklist Details */}
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginTop: 14 }}>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase" }}>RECOMMENDED AI ACTION ROADMAP</div>
                            <div style={{ fontSize: 13, color: "var(--text-primary)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                              <Zap size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 3 }} />
                              <span>{gp.action}</span>
                            </div>
                            
                            {/* Checklist Sub-tasks */}
                            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, paddingLeft: 22 }}>
                              <div style={{ display: "flex", gap: 8, fontSize: 12, alignItems: "center", color: "var(--text-secondary)" }}>
                                <input type="checkbox" defaultChecked={false} style={{ cursor: "pointer" }} />
                                <span>Audit primary image gallery elements</span>
                              </div>
                              <div style={{ display: "flex", gap: 8, fontSize: 12, alignItems: "center", color: "var(--text-secondary)" }}>
                                <input type="checkbox" defaultChecked={false} style={{ cursor: "pointer" }} />
                                <span>Inject competitor keyword search volume targets</span>
                              </div>
                              <div style={{ display: "flex", gap: 8, fontSize: 12, alignItems: "center", color: "var(--text-secondary)" }}>
                                <input type="checkbox" defaultChecked={false} style={{ cursor: "pointer" }} />
                                <span>Enable automated dynamic repricer guidelines</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", background: "rgba(52, 199, 89, 0.05)", border: "1px solid rgba(52, 199, 89, 0.2)", borderRadius: 8, padding: 14, textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "var(--success)", fontWeight: 700, textTransform: "uppercase" }}>EST. ROI FORECAST</div>
                            <div style={{ fontSize: 16, color: "var(--success)", fontWeight: 800, margin: "6px 0" }}>{gp.potential}</div>
                            <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>estimated inside 30-day window</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Empty State Instructions */}
      {!data && !loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 10 }}>
          {[
            { icon: <Search size={24} color="var(--accent)" />, title: "Full SEO Diagnostic Checklist", desc: "Checks title word lengths, bullet points capitalization, description depths, A+ modules, and weak images." },
            { icon: <Package size={24} color="var(--success)" />, title: "India FBA Unit Economics", desc: "Computes COGS, actual Amazon referral commissions, FBA logistics fees, and standard GST slabs to extract net profit." },
            { icon: <TrendingUp size={24} color="var(--warning)" />, title: "Price War & Buy Box Tracker", desc: "Identifies whether Amazon retail competes in the Buy Box and evaluates 30d/90d averages to alert on active price wars." },
            { icon: <Sparkles size={24} color="var(--purple)" />, title: "AI-Prioritized Roadmaps", desc: "Delivers specific keyword improvements, PPC budget scale actions, and dynamic repricer guidelines with ROI forecasts." }
          ].map((c, i) => (
            <div key={i} className="stat-card" style={{ padding: 24, textAlign: "center", border: "1px solid var(--border)" }}>
              <div style={{ display: "inline-flex", padding: 12, background: "var(--bg-primary)", borderRadius: "50%", marginBottom: 16, border: "1px solid var(--border)" }}>
                {c.icon}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: "var(--text-primary)" }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
