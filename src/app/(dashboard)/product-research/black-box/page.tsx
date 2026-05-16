"use client";

import { useState, useCallback } from "react";
import {
  Search, SlidersHorizontal, Download, Star, TrendingUp, TrendingDown,
  Minus, RefreshCw, ExternalLink, Filter, ChevronDown, ChevronUp,
  ShieldCheck, AlertTriangle, Package, IndianRupee, BarChart2, Info,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface BlackBoxProduct {
  rank: number;
  asin: string;
  img: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  priceNum: number;
  bsr: number;
  revenueEstimate: string;
  revenueNum: number;
  reviews: number;
  rating: number;
  margin: string;
  marginNum: number;
  fbaFee: string;
  opportunity: "High" | "Medium" | "Low";
  gstSlab: string;
  trend: "up" | "down" | "stable";
  monthlySales: number;
}

interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  minRevenue: string;
  maxRevenue: string;
  minReviews: string;
  maxReviews: string;
  maxBsr: string;
  minMargin: string;
  minRating: string;
  gstFlag: string;
}

const defaultFilters: FilterState = {
  category: "All",
  minPrice: "",
  maxPrice: "",
  minRevenue: "",
  maxRevenue: "",
  minReviews: "",
  maxReviews: "",
  maxBsr: "",
  minMargin: "",
  minRating: "",
  gstFlag: "",
};

const CATEGORIES = [
  "All", "Electronics", "Home & Kitchen", "Sports & Outdoors",
  "Beauty & Personal Care", "Clothing", "Toys & Games", "Health", "Kitchen",
];

const oppColors = {
  High: { bg: "var(--success-muted)", color: "var(--success)" },
  Medium: { bg: "var(--warning-muted)", color: "var(--warning)" },
  Low: { bg: "var(--danger-muted)", color: "var(--danger)" },
};

const GST_SLABS = ["", "5", "12", "18", "28"];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BlackBoxPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BlackBoxProduct[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof BlackBoxProduct>("revenueNum");
  const [sortAsc, setSortAsc] = useState(false);
  const [totalFound, setTotalFound] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const setFilter = (key: keyof FilterState, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/amazon/black-box", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: filters.category,
          minPrice: filters.minPrice || 0,
          maxPrice: filters.maxPrice || 999999,
          minRevenue: filters.minRevenue || 0,
          maxRevenue: filters.maxRevenue || 999999999,
          minReviews: filters.minReviews || 0,
          maxReviews: filters.maxReviews || 999999,
          maxBsr: filters.maxBsr || 100000,
          minMargin: filters.minMargin || 0,
          minRating: filters.minRating || 0,
          gstFlag: filters.gstFlag || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.products || []);
      setTotalFound(data.total || 0);
      setSearched(true);
    } catch (e: any) {
      setError(e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleSort = (field: keyof BlackBoxProduct) => {
    if (sortField === field) setSortAsc(a => !a);
    else { setSortField(field); setSortAsc(false); }
  };

  const sorted = [...results].sort((a, b) => {
    const av = a[sortField] as any;
    const bv = b[sortField] as any;
    if (typeof av === "number") return sortAsc ? av - bv : bv - av;
    return sortAsc
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const exportCSV = () => {
    const headers = ["Rank","ASIN","Product","Brand","Category","Price","BSR","Est. Revenue/Mo","Monthly Sales","Reviews","Rating","Margin","FBA Fee","Opportunity","GST Slab","Trend"];
    const rows = results.map(p => [
      p.rank, p.asin, `"${p.name}"`, p.brand, p.category, p.price,
      p.bsr, p.revenueEstimate, p.monthlySales, p.reviews, p.rating,
      p.margin, p.fbaFee, p.opportunity, p.gstSlab, p.trend,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `black-box-india-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const SortIcon = ({ field }: { field: keyof BlackBoxProduct }) => {
    if (sortField !== field) return <ChevronDown size={12} style={{ opacity: 0.3 }} />;
    return sortAsc
      ? <ChevronUp size={12} style={{ color: "var(--accent)" }} />
      : <ChevronDown size={12} style={{ color: "var(--accent)" }} />;
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Black Box India</h1>
          <p className="page-subtitle">
            Discover high-opportunity Amazon.in products using real Keepa data — BSR, revenue, margin & GST intelligence
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {searched && (
            <button className="btn-ghost" onClick={exportCSV}
              style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Download size={15} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Panel ── */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SlidersHorizontal size={16} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Product Filters</span>
            <span style={{ background: "var(--accent-muted)", color: "var(--accent)", borderRadius: 50, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
              Amazon.in
            </span>
          </div>
          <button
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 13 }}
            onClick={() => setShowAdvanced(p => !p)}
          >
            <Filter size={14} /> {showAdvanced ? "Hide" : "Advanced"} Filters
          </button>
        </div>

        {/* Core Filters Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 14 }}>
          <FilterGroup label="Category">
            <select className="input-field" value={filters.category} onChange={e => setFilter("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </FilterGroup>
          <FilterGroup label="Min Price (₹)">
            <input className="input-field" type="number" placeholder="e.g. 200" value={filters.minPrice} onChange={e => setFilter("minPrice", e.target.value)} />
          </FilterGroup>
          <FilterGroup label="Max Price (₹)">
            <input className="input-field" type="number" placeholder="e.g. 2000" value={filters.maxPrice} onChange={e => setFilter("maxPrice", e.target.value)} />
          </FilterGroup>
          <FilterGroup label="Min Monthly Revenue (₹)">
            <input className="input-field" type="number" placeholder="e.g. 50000" value={filters.minRevenue} onChange={e => setFilter("minRevenue", e.target.value)} />
          </FilterGroup>
          <FilterGroup label="Max BSR">
            <input className="input-field" type="number" placeholder="e.g. 10000" value={filters.maxBsr} onChange={e => setFilter("maxBsr", e.target.value)} />
          </FilterGroup>
          <FilterGroup label="Min Margin %">
            <input className="input-field" type="number" placeholder="e.g. 25" value={filters.minMargin} onChange={e => setFilter("minMargin", e.target.value)} />
          </FilterGroup>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <FilterGroup label="Min Reviews">
              <input className="input-field" type="number" placeholder="e.g. 0" value={filters.minReviews} onChange={e => setFilter("minReviews", e.target.value)} />
            </FilterGroup>
            <FilterGroup label="Max Reviews">
              <input className="input-field" type="number" placeholder="e.g. 500" value={filters.maxReviews} onChange={e => setFilter("maxReviews", e.target.value)} />
            </FilterGroup>
            <FilterGroup label="Min Rating">
              <input className="input-field" type="number" step="0.1" placeholder="e.g. 4.0" value={filters.minRating} onChange={e => setFilter("minRating", e.target.value)} />
            </FilterGroup>
            <FilterGroup label="GST Slab">
              <select className="input-field" value={filters.gstFlag} onChange={e => setFilter("gstFlag", e.target.value)}>
                <option value="">All</option>
                {GST_SLABS.filter(Boolean).map(s => <option key={s} value={s}>{s}%</option>)}
              </select>
            </FilterGroup>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            className="btn-accent"
            onClick={handleSearch}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 180 }}
          >
            {loading
              ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Scanning Keepa...</>
              : <><Search size={15} /> Find Opportunities</>}
          </button>
          <button className="btn-ghost" onClick={() => { setFilters(defaultFilters); setResults([]); setSearched(false); }}>
            Reset
          </button>
          {searched && (
            <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 8 }}>
              {totalFound} products found
            </span>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: "var(--danger-muted)", border: "1px solid var(--danger)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={16} color="var(--danger)" />
          <span style={{ color: "var(--danger)", fontSize: 14 }}>{error}</span>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ height: 20, width: 200, background: "var(--border)", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 48, height: 48, background: "var(--border)", borderRadius: 8, flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 14, width: "60%", background: "var(--border)", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: 12, width: "40%", background: "var(--border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Results Table ── */}
      {!loading && searched && results.length > 0 && (
        <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Table header bar */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Package size={16} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                {totalFound} Product Opportunities
              </span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                · Amazon.in · Real Keepa Data
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["High", "Medium", "Low"] as const).map(o => (
                <span key={o} style={{
                  background: oppColors[o].bg, color: oppColors[o].color,
                  borderRadius: 50, padding: "3px 12px", fontSize: 12, fontWeight: 600
                }}>{o}</span>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>PRODUCT</th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("bsr")}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>BSR <SortIcon field="bsr" /></span>
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("priceNum")}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>PRICE <SortIcon field="priceNum" /></span>
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("revenueNum")}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>EST. REV/MO <SortIcon field="revenueNum" /></span>
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("monthlySales")}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>SALES/MO <SortIcon field="monthlySales" /></span>
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("reviews")}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>REVIEWS <SortIcon field="reviews" /></span>
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("rating")}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>RATING <SortIcon field="rating" /></span>
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("marginNum")}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>MARGIN <SortIcon field="marginNum" /></span>
                  </th>
                  <th>FBA FEE</th>
                  <th>GST</th>
                  <th>TREND</th>
                  <th>SCORE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(p => (
                  <tr key={p.asin} style={{ cursor: "default" }}>
                    <td style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: 13 }}>{p.rank}</td>
                    <td style={{ minWidth: 240 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: "#fff", flexShrink: 0, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img
                            src={p.img}
                            alt={p.name}
                            onError={e => { (e.target as HTMLImageElement).src = `https://images.amazon.com/images/P/${p.asin}.01._SCLZZZZZZZ_.jpg`; }}
                            style={{ width: 44, height: 44, objectFit: "contain" }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{p.brand} · {p.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 13, color: p.bsr < 5000 ? "var(--success)" : p.bsr < 20000 ? "var(--warning)" : "var(--danger)" }}>
                        #{p.bsr.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p.price}</td>
                    <td style={{ fontWeight: 700, color: "var(--accent)" }}>{p.revenueEstimate}</td>
                    <td style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{p.monthlySales.toLocaleString()}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{p.reviews.toLocaleString()}</td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={12} fill="var(--warning)" color="var(--warning)" />
                        <span style={{ fontWeight: 600, color: "var(--warning)" }}>{p.rating.toFixed(1)}</span>
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: p.marginNum > 25 ? "var(--success)" : p.marginNum > 15 ? "var(--warning)" : "var(--danger)" }}>
                        {p.margin}
                      </span>
                    </td>
                    <td style={{ color: "var(--danger)", fontWeight: 600 }}>{p.fbaFee}</td>
                    <td>
                      <span style={{ background: "var(--blue-muted)", color: "var(--blue)", borderRadius: 50, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                        {p.gstSlab}
                      </span>
                    </td>
                    <td>
                      {p.trend === "up" ? <TrendingUp size={16} color="var(--success)" /> :
                       p.trend === "down" ? <TrendingDown size={16} color="var(--danger)" /> :
                       <Minus size={16} color="var(--text-muted)" />}
                    </td>
                    <td>
                      <span style={{ background: oppColors[p.opportunity].bg, color: oppColors[p.opportunity].color, borderRadius: 50, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                        {p.opportunity}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn-accent"
                          style={{ padding: "5px 10px", fontSize: 12 }}
                          onClick={() => window.open(`https://www.amazon.in/dp/${p.asin}`, "_blank")}
                          title="View on Amazon.in"
                        >
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && searched && results.length === 0 && !error && (
        <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
          <Search size={40} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>No matches found</div>
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Try relaxing your filters — lower the min margin or increase the max BSR.</div>
        </div>
      )}

      {/* ── Intro state ── */}
      {!searched && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { icon: <BarChart2 size={24} color="var(--accent)" />, title: "Real BSR Data", desc: "Live Amazon.in bestseller ranks via Keepa" },
            { icon: <IndianRupee size={24} color="var(--success)" />, title: "INR Revenue Model", desc: "Estimated monthly revenue calibrated for India" },
            { icon: <ShieldCheck size={24} color="var(--purple)" />, title: "GST Intelligence", desc: "Auto-detect GST slab per product category" },
            { icon: <TrendingUp size={24} color="var(--warning)" />, title: "Trend Detection", desc: "90-day BSR trend: growing vs declining products" },
          ].map(card => (
            <div key={card.title} className="stat-card">
              <div style={{ marginBottom: 12 }}>{card.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{card.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{card.desc}</div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ─── FilterGroup helper ───────────────────────────────────────────────────────
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
