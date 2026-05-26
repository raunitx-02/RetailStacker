"use client";
import { useState } from "react";
import Image from "next/image";
import { Copy, Link2, Check, ExternalLink } from "lucide-react";

const PLATFORMS = [
  { id: "amazon", name: "Amazon", logo: "/amazon-logo.png", color: "#FF9900" },
  { id: "shopify", name: "Shopify", logo: "/shopify-logo.png", color: "#5E8E3E" },
] as const;

const amazonAttributionTags = [
  { label: "Search Find Buy (SFB)", tag: "field-keywords" },
  { label: "2-Step URL (Branded)", tag: "field-keywords&field-enc-merchantid" },
  { label: "Product Targeting URL", tag: "field-keywords&sort=salesrank" },
  { label: "External Traffic URL", tag: "ref=nb_sb_noss" },
];

const utmSources = ["facebook", "instagram", "tiktok", "youtube", "google", "email", "whatsapp", "telegram"];
const utmMediums = ["cpc", "social", "email", "influencer", "organic", "referral"];

type Platform = "amazon" | "shopify";

function CodeBlock({ label, url, color }: { label: string; url: string; color: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
      <div style={{ background: "var(--bg-primary)", borderRadius: 8, padding: "12px 14px", border: `1px solid ${color}30`, marginBottom: 12, wordBreak: "break-all" as const }}>
        <code style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7, fontFamily: "monospace" }}>{url}</code>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-ghost" onClick={copy} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy URL</>}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <ExternalLink size={14} /> Test
        </a>
      </div>
    </div>
  );
}

export default function URLBuilderPage() {
  const [platform, setPlatform] = useState<Platform>("amazon");

  // Amazon fields
  const [asin, setAsin] = useState("B08XYZ1234");
  const [keyword, setKeyword] = useState("bamboo cutting board");
  const [urlType, setUrlType] = useState("Search Find Buy (SFB)");
  const [amazonMarketplace, setAmazonMarketplace] = useState("amazon.in");

  // Shopify UTM fields
  const [shopifyUrl, setShopifyUrl] = useState("https://yourstore.myshopify.com/products/your-product");
  const [utmSource, setUtmSource] = useState("instagram");
  const [utmMedium, setUtmMedium] = useState("social");
  const [utmCampaign, setUtmCampaign] = useState("summer-sale-2026");
  const [utmContent, setUtmContent] = useState("story-ad-v1");
  const [utmTerm, setUtmTerm] = useState("");

  // Generated URLs
  const amazonSearchUrl = `https://www.${amazonMarketplace}/s?k=${encodeURIComponent(keyword)}&i=aps&ref=nb_sb_noss&tag=neon10-20`;
  const amazonProductUrl = `https://www.${amazonMarketplace}/dp/${asin}?th=1&psc=1`;

  const shopifyUtmUrl = (() => {
    try {
      const base = shopifyUrl.startsWith("http") ? shopifyUrl : `https://${shopifyUrl}`;
      const url = new URL(base);
      if (utmSource) url.searchParams.set("utm_source", utmSource);
      if (utmMedium) url.searchParams.set("utm_medium", utmMedium);
      if (utmCampaign) url.searchParams.set("utm_campaign", utmCampaign);
      if (utmContent) url.searchParams.set("utm_content", utmContent);
      if (utmTerm) url.searchParams.set("utm_term", utmTerm);
      return url.toString();
    } catch {
      return shopifyUrl;
    }
  })();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">URL Builder</h1>
          <p className="page-subtitle">Build attribution URLs for Amazon (Search Find Buy) and Shopify (UTM tracking) to drive targeted external traffic</p>
        </div>
      </div>

      {/* Platform switcher */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px", borderRadius: 10, cursor: "pointer",
              background: platform === p.id ? `${p.color}18` : "var(--bg-secondary)",
              border: `2px solid ${platform === p.id ? p.color : "var(--border)"}`,
              transition: "all 0.2s",
            }}
          >
            <Image src={p.logo} alt={p.name} width={20} height={20} style={{ objectFit: "contain" }} unoptimized />
            <span style={{ fontWeight: 700, fontSize: 14, color: platform === p.id ? p.color : "var(--text-muted)" }}>{p.name} URL Builder</span>
          </button>
        ))}
      </div>

      {/* ── AMAZON URL BUILDER ── */}
      {platform === "amazon" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Image src="/amazon-logo.png" alt="Amazon" width={24} height={24} unoptimized style={{ objectFit: "contain" }} />
              <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Amazon URL Configuration</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" as const }}>Amazon Marketplace</label>
                <select className="input-field" value={amazonMarketplace} onChange={e => setAmazonMarketplace(e.target.value)}>
                  <option value="amazon.in">Amazon India (amazon.in)</option>
                  <option value="amazon.com">Amazon US (amazon.com)</option>
                  <option value="amazon.co.uk">Amazon UK (amazon.co.uk)</option>
                  <option value="amazon.de">Amazon Germany (amazon.de)</option>
                  <option value="amazon.ca">Amazon Canada (amazon.ca)</option>
                  <option value="amazon.com.au">Amazon Australia (amazon.com.au)</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" as const }}>Your ASIN</label>
                <input className="input-field" value={asin} onChange={e => setAsin(e.target.value)} placeholder="e.g. B08XYZ1234" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" as const }}>Target Keyword</label>
                <input className="input-field" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. bamboo cutting board" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" as const }}>URL Type</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {amazonAttributionTags.map(t => (
                    <label key={t.label} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 10, background: urlType === t.label ? "var(--accent-muted)" : "var(--bg-secondary)", border: `1px solid ${urlType === t.label ? "var(--accent)" : "var(--border)"}`, transition: "all 0.2s" }}>
                      <input type="radio" name="urlType" value={t.label} checked={urlType === t.label} onChange={() => setUrlType(t.label)} style={{ accentColor: "var(--accent)" }} />
                      <span style={{ fontSize: 13, color: urlType === t.label ? "var(--accent)" : "var(--text-secondary)", fontWeight: urlType === t.label ? 700 : 400 }}>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <CodeBlock label="Amazon Search URL" url={amazonSearchUrl} color="#FF9900" />
            <CodeBlock label="Amazon Direct Product URL" url={amazonProductUrl} color="#FF9900" />
            <div className="glass-card" style={{ padding: 18, background: "rgba(255,153,0,0.04)", border: "1px solid rgba(255,153,0,0.2)" }}>
              <div style={{ fontWeight: 700, color: "#FF9900", fontSize: 13, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Link2 size={14} /> How to Use (Search Find Buy)
              </div>
              <ol style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
                {["Share the Search URL on Facebook/TikTok/Instagram", "Customer clicks → lands on Amazon search results page", "Your product ranks high → customer finds & buys", "Amazon sees keyword click → boosts your organic ranking"].map((step, i) => (
                  <li key={i} style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ── SHOPIFY UTM BUILDER ── */}
      {platform === "shopify" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Image src="/shopify-logo.png" alt="Shopify" width={24} height={24} unoptimized style={{ objectFit: "contain" }} />
              <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Shopify UTM Configuration</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" as const }}>Your Shopify Product/Page URL</label>
                <input className="input-field" value={shopifyUrl} onChange={e => setShopifyUrl(e.target.value)} placeholder="https://yourstore.myshopify.com/products/..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" as const }}>UTM Source *</label>
                  <select className="input-field" value={utmSource} onChange={e => setUtmSource(e.target.value)}>
                    {utmSources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" as const }}>UTM Medium *</label>
                  <select className="input-field" value={utmMedium} onChange={e => setUtmMedium(e.target.value)}>
                    {utmMediums.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" as const }}>UTM Campaign *</label>
                <input className="input-field" value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} placeholder="e.g. summer-sale-2026" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" as const }}>UTM Content (A/B test variant)</label>
                <input className="input-field" value={utmContent} onChange={e => setUtmContent(e.target.value)} placeholder="e.g. story-ad-v1, carousel-v2" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" as const }}>UTM Term (Paid keyword, optional)</label>
                <input className="input-field" value={utmTerm} onChange={e => setUtmTerm(e.target.value)} placeholder="e.g. bamboo cutting board" />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <CodeBlock label="Shopify UTM Tracking URL" url={shopifyUtmUrl} color="#5E8E3E" />

            {/* UTM preview breakdown */}
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: "var(--text-primary)" }}>UTM Parameter Breakdown</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { param: "utm_source", value: utmSource, desc: "Traffic origin platform" },
                  { param: "utm_medium", value: utmMedium, desc: "Marketing channel type" },
                  { param: "utm_campaign", value: utmCampaign, desc: "Specific campaign name" },
                  ...(utmContent ? [{ param: "utm_content", value: utmContent, desc: "Ad variant identifier" }] : []),
                  ...(utmTerm ? [{ param: "utm_term", value: utmTerm, desc: "Targeted keyword" }] : []),
                ].map(({ param, value, desc }) => (
                  <div key={param} style={{ display: "flex", gap: 12, padding: "8px 10px", background: "var(--bg-secondary)", borderRadius: 8, alignItems: "center" }}>
                    <code style={{ fontSize: 11, color: "#5E8E3E", fontFamily: "monospace", minWidth: 110, fontWeight: 700 }}>{param}</code>
                    <span style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600 }}>{value}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: 18, background: "rgba(94,142,62,0.04)", border: "1px solid rgba(94,142,62,0.2)" }}>
              <div style={{ fontWeight: 700, color: "#5E8E3E", fontSize: 13, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Link2 size={14} /> How to Use (Shopify UTM)
              </div>
              <ol style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
                {["Share the UTM URL in your ads/content", "When a customer clicks, Shopify Analytics records the source", "View traffic breakdown in Shopify Admin → Analytics → Reports", "Optimize spend by seeing which campaigns convert best"].map((step, i) => (
                  <li key={i} style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
