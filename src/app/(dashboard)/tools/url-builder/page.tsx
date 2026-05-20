"use client";
import { useState } from "react";
import { Copy, Link2, Check } from "lucide-react";

const attributionTags = [
  { label: "Search Find Buy (SFB)", tag: "field-keywords" },
  { label: "2-Step URL (Branded)", tag: "field-keywords&field-enc-merchantid" },
  { label: "Product Targeting URL", tag: "field-keywords&sort=salesrank" },
  { label: "External Traffic URL", tag: "ref=nb_sb_noss" },
];

export default function URLBuilderPage() {
  const [asin, setAsin] = useState("B08XYZ1234");
  const [keyword, setKeyword] = useState("bamboo cutting board");
  const [urlType, setUrlType] = useState("Search Find Buy (SFB)");
  const [marketplace, setMarketplace] = useState("amazon.com");
  const [copied, setCopied] = useState(false);

  const generated = `https://www.${marketplace}/s?k=${encodeURIComponent(keyword)}&i=aps&ref=nb_sb_noss&tag=neon10-20`;
  const landingUrl = `https://www.${marketplace}/dp/${asin}?th=1&psc=1`;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">URL Builder</h1>
          <p className="page-subtitle">Create custom Amazon URLs to drive targeted external traffic and boost your keyword rankings</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Builder Form */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 20 }}>URL Configuration</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Amazon Marketplace</label>
              <select className="input-field" value={marketplace} onChange={e => setMarketplace(e.target.value)}>
                <option>amazon.com</option>
                <option>amazon.co.uk</option>
                <option>amazon.de</option>
                <option>amazon.ca</option>
                <option>amazon.com.au</option>
                <option>amazon.in</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Your ASIN</label>
              <input className="input-field" value={asin} onChange={e => setAsin(e.target.value)} placeholder="e.g. B08XYZ1234" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Target Keyword</label>
              <input className="input-field" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. bamboo cutting board" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>URL Type</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {attributionTags.map(t => (
                  <label key={t.label} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 10, background: urlType === t.label ? "rgba(255,107,53,0.08)" : "rgba(0,0,0,0.15)", border: `1px solid ${urlType === t.label ? "var(--border)" : "var(--border)"}`, transition: "all 0.2s" }}>
                    <input type="radio" name="urlType" value={t.label} checked={urlType === t.label} onChange={() => setUrlType(t.label)} style={{ accentColor: "var(--accent)" }} />
                    <span style={{ fontSize: 14, color: urlType === t.label ? "var(--accent)" : "var(--text-secondary)", fontWeight: urlType === t.label ? 600 : 400 }}>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* URL Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>Search URL</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Use this URL in your external traffic campaigns (Facebook, TikTok, email)</p>
            <div style={{
              background: "#0d1117",
              borderRadius: 10,
              padding: "14px 16px",
              border: "1px solid rgba(255,107,53,0.35)",
              marginBottom: 12,
              wordBreak: "break-all"
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>SEARCH URL</div>
              <code style={{ fontSize: 12, color: "#7ee787", lineHeight: 1.7, fontFamily: "monospace" }}>{generated}</code>
            </div>
            <button className="btn-accent" onClick={() => copy(generated)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center" }}>
              {copied ? <><Check size={15} />Copied!</> : <><Copy size={15} />Copy Search URL</>}
            </button>
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>Direct Product URL</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Direct link to your product listing page</p>
            <div style={{
              background: "#0d1117",
              borderRadius: 10,
              padding: "14px 16px",
              border: "1px solid rgba(59,130,246,0.35)",
              marginBottom: 12,
              wordBreak: "break-all"
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>PRODUCT URL</div>
              <code style={{ fontSize: 12, color: "#79c0ff", lineHeight: 1.7, fontFamily: "monospace" }}>{landingUrl}</code>
            </div>
            <button className="btn-accent" onClick={() => copy(landingUrl)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center", background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.4)", color: "#60a5fa" }}>
              <Copy size={15} />Copy Product URL
            </button>
          </div>


          <div className="glass-card" style={{ padding: 20, background: "rgba(255,107,53,0.04)", border: "1px solid var(--accent-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Link2 size={16} color="var(--accent)" />
              <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 14 }}>How to Use</span>
            </div>
            <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              {["Share the Search URL on Facebook/TikTok", "Customer clicks link → sees Amazon search results", "Your product ranks high → customer finds & buys it", "Amazon sees organic-like keyword click → boosts ranking"].map((step, i) => (
                <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
