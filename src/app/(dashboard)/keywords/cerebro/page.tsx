"use client";

import { useState, useCallback } from "react";
import {
  Cpu, Download, TrendingUp, TrendingDown, Search, X,
  Star, ExternalLink, Info, Languages, Zap, ChevronDown, ChevronUp,
} from "lucide-react";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────
interface CerebroKeyword {
  keyword: string;
  searchVol: number;
  relevance: number;
  cpr8Day: number;
  competingProducts: number;
  sponsored: boolean;
  hinglish: boolean;
  asins: string[];
}

interface CerebroProduct {
  asin: string;
  title: string;
  img: string;
  brand: string;
  bsr: number;
  price: string;
  rating: number;
  reviews: number;
}

interface CerebroData {
  keywords: CerebroKeyword[];
  products: CerebroProduct[];
  totalKeywords: number;
  totalSearchVolume: number;
  asinsAnalyzed: number;
}

type SortField = "searchVol" | "cpr8Day" | "relevance" | "competingProducts";

export default function CerebroPage() {
  const [asinInput, setAsinInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CerebroData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("searchVol");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterHinglish, setFilterHinglish] = useState(false);
  const [filterSponsored, setFilterSponsored] = useState(false);
  const [minVolume, setMinVolume] = useState("");

  const handleSearch = useCallback(async () => {
    const asins = asinInput.trim();
    if (!asins) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/amazon/cerebro?asins=${encodeURIComponent(asins)}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [asinInput]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(v => !v);
    else { setSortField(field); setSortAsc(false); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={11} style={{ opacity: 0.3 }} />;
    return sortAsc ? <ChevronUp size={11} color="var(--accent)" /> : <ChevronDown size={11} color="var(--accent)" />;
  };

  const filtered = (data?.keywords || [])
    .filter(k => !filterHinglish || k.hinglish)
    .filter(k => !filterSponsored || k.sponsored)
    .filter(k => !minVolume || k.searchVol >= Number(minVolume))
    .sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

  const exportCSV = () => {
    const headers = ["Keyword", "Search Volume", "Relevance", "CPR 8-Day", "Competing Products", "Sponsored", "Hinglish", "ASINs"];
    const rows = filtered.map(k => [
      `"${k.keyword}"`, k.searchVol, k.relevance, k.cpr8Day,
      k.competingProducts, k.sponsored, k.hinglish, k.asins.join("|"),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `cerebro-india-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cerebro India</h1>
          <p className="page-subtitle">
            Reverse ASIN lookup — discover every keyword your competitors rank for on Amazon.in
          </p>
        </div>
        {data && (
          <button className="btn-ghost" onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Download size={15} /> Export CSV
          </button>
        )}
      </div>

      {/* ── ASIN Input ── */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          Enter up to 10 Amazon.in ASINs separated by commas to extract keyword rankings
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            className="input-field"
            placeholder="e.g. B08XYZ1234, B09ABC5678, B07DEF9012"
            value={asinInput}
            onChange={e => setAsinInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={{ flex: 1, fontFamily: "monospace", fontSize: 14 }}
          />
          {asinInput && (
            <button className="btn-ghost" style={{ padding: "10px 14px" }} onClick={() => { setAsinInput(""); setData(null); }}>
              <X size={15} />
            </button>
          )}
          <button
            className="btn-accent"
            onClick={handleSearch}
            disabled={loading || !asinInput.trim()}
            style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 180 }}
          >
            {loading
              ? <><div className="spinner" style={{ width: 16, height: 16 }} />Analyzing...</>
              : <><Cpu size={15} />Get Keywords</>}
          </button>
        </div>

        {/* Quick ASIN examples */}
        {!data && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>Try:</span>
            {["B00YUNKKP8", "B09W9FND7L", "B0CHX3THBM"].map(a => (
              <button
                key={a}
                className="btn-ghost"
                style={{ fontSize: 12, padding: "4px 12px", fontFamily: "monospace" }}
                onClick={() => setAsinInput(a)}
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: "var(--danger-muted)", border: "1px solid var(--danger)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: "var(--danger)", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Fetching keyword data from Keepa...</div>
        </div>
      )}

      {/* ── Results ── */}
      {data && !loading && (
        <>
          {/* Product cards */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {data.products.map(p => (
              <div key={p.asin} className="glass-card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center", flex: "0 0 auto", maxWidth: 340 }}>
                <div style={{ width: 48, height: 48, background: "#fff", borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={p.img}
                    alt={p.title}
                    onError={e => { (e.target as HTMLImageElement).src = `https://images.amazon.com/images/P/${p.asin}.01._SCLZZZZZZZ_.jpg`; }}
                    style={{ width: 44, height: 44, objectFit: "contain" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{p.asin}</span>
                    <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>{p.price}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>BSR #{p.bsr.toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <Star size={10} fill="var(--warning)" color="var(--warning)" />
                    <span style={{ fontSize: 11, color: "var(--warning)", fontWeight: 600 }}>{p.rating.toFixed(1)}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({p.reviews.toLocaleString()})</span>
                  </div>
                </div>
                <button style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => window.open(`https://www.amazon.in/dp/${p.asin}`, "_blank")}>
                  <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total Keywords", value: data.totalKeywords.toLocaleString(), color: "var(--accent)" },
              { label: "Total Search Volume", value: data.totalSearchVolume.toLocaleString(), color: "var(--success)" },
              { label: "After Filters", value: filtered.length.toLocaleString(), color: "var(--warning)" },
              { label: "Hinglish Keywords", value: filtered.filter(k => k.hinglish).length.toLocaleString(), color: "var(--purple)" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="glass-card" style={{ padding: "12px 20px", marginBottom: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Filter:</span>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
              <input type="checkbox" checked={filterHinglish} onChange={e => setFilterHinglish(e.target.checked)} />
              <Languages size={14} color="var(--purple)" /> Hinglish only
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
              <input type="checkbox" checked={filterSponsored} onChange={e => setFilterSponsored(e.target.checked)} />
              <Zap size={14} color="var(--warning)" /> Sponsored opportunity
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Min volume:</span>
              <input className="input-field" type="number" placeholder="e.g. 500" value={minVolume}
                onChange={e => setMinVolume(e.target.value)} style={{ width: 100 }} />
            </div>
          </div>

          {/* Keyword table */}
          <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>KEYWORD</th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("searchVol")}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>SEARCH VOLUME <SortIcon field="searchVol" /></span>
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("relevance")}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>RELEVANCE <SortIcon field="relevance" /></span>
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("cpr8Day")}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>CPR 8-DAY <SortIcon field="cpr8Day" /></span>
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("competingProducts")}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>COMPETING <SortIcon field="competingProducts" /></span>
                    </th>
                    <th>TYPE</th>
                    <th>FOUND IN</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(kw => (
                    <tr key={kw.keyword}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{kw.keyword}</span>
                          {kw.hinglish && (
                            <span style={{ background: "var(--purple-muted)", color: "var(--purple)", borderRadius: 50, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
                              हिं
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 3, background: "var(--accent)", width: `${Math.min(100, (kw.searchVol / 50000) * 100)}%`, transition: "width 0.6s" }} />
                          </div>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)", minWidth: 55 }}>
                            {kw.searchVol.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 40, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 3, background: "var(--success)", width: `${kw.relevance * 100}%` }} />
                          </div>
                          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{(kw.relevance * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: "var(--purple-muted)", color: "var(--purple)", borderRadius: 50, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                          {kw.cpr8Day.toLocaleString()}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{kw.competingProducts.toLocaleString()}</td>
                      <td>
                        {kw.sponsored
                          ? <span style={{ background: "var(--warning-muted)", color: "var(--warning)", borderRadius: 50, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Sponsored</span>
                          : <span style={{ background: "var(--success-muted)", color: "var(--success)", borderRadius: 50, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Organic</span>}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {kw.asins.map(a => (
                            <span key={a} style={{ background: "var(--accent-muted)", color: "var(--accent)", borderRadius: 4, padding: "1px 6px", fontSize: 10, fontFamily: "monospace", fontWeight: 600 }}>
                              {a.slice(-4)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Intro state ── */}
      {!data && !loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { icon: <Cpu size={24} color="var(--accent)" />, title: "Reverse ASIN Lookup", desc: "Submit up to 10 ASINs to extract their complete keyword universe" },
            { icon: <Languages size={24} color="var(--purple)" />, title: "Hinglish Detection", desc: "Identifies Hindi/Hinglish search terms specific to India buyers" },
            { icon: <Zap size={24} color="var(--warning)" />, title: "CPR Score", desc: "8-Day CPR calculation helps estimate PPC launch budget needed" },
            { icon: <TrendingUp size={24} color="var(--success)" />, title: "Volume Intelligence", desc: "Search volume calibrated for Amazon.in (not Amazon.com)" },
          ].map(card => (
            <div key={card.title} className="stat-card">
              <div style={{ marginBottom: 12 }}>{card.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{card.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{card.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
