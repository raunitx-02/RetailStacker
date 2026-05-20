"use client";
import { useState, useRef } from "react";
import { QrCode, Download, Copy, Check, Pipette } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const presets = [
  { label: "Product Page", url: "https://www.amazon.com/dp/B08XYZ1234" },
  { label: "Search URL", url: "https://www.amazon.com/s?k=bamboo+cutting+board" },
  { label: "Brand Store", url: "https://www.amazon.com/stores/EcoHome" },
  { label: "Coupon Page", url: "https://www.amazon.com/dp/B08XYZ1234?th=1&psc=1" },
];

// All real hex values — no CSS vars (canvas can't resolve them)
const fgPresets = [
  { label: "Black",   hex: "#000000" },
  { label: "White",   hex: "#FFFFFF" },
  { label: "Orange",  hex: "#ff6b35" },
  { label: "Emerald", hex: "#22c55e" },
  { label: "Blue",    hex: "#3b82f6" },
  { label: "Purple",  hex: "#8b5cf6" },
  { label: "Amber",   hex: "#f59e0b" },
  { label: "Rose",    hex: "#f43f5e" },
  { label: "Teal",    hex: "#14b8a6" },
];

const bgPresets = [
  { label: "Black",       hex: "#000000" },
  { label: "Dark Navy",   hex: "#0b0e1a" },
  { label: "Slate",       hex: "#1e293b" },
  { label: "White",       hex: "#FFFFFF" },
  { label: "Cream",       hex: "#fef9ef" },
  { label: "Light Grey",  hex: "#f1f5f9" },
  { label: "Deep Purple", hex: "#1e1b4b" },
  { label: "Forest",      hex: "#14532d" },
];

function ColorSwatch({
  hex,
  label,
  selected,
  onSelect,
}: {
  hex: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      title={`${label} (${hex})`}
      onClick={onSelect}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: hex,
        border: selected ? "3px solid #ff6b35" : "2px solid rgba(128,128,128,0.3)",
        cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: selected
          ? "0 0 0 2px rgba(255,107,53,0.4), 0 4px 12px rgba(0,0,0,0.3)"
          : "0 2px 6px rgba(0,0,0,0.15)",
        transform: selected ? "scale(1.12)" : "scale(1)",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {selected && (
        <span style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 14, fontWeight: 900,
          color: hex === "#FFFFFF" || hex === "#fef9ef" || hex === "#f1f5f9" || hex === "#cream" ? "#000" : "#fff",
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          lineHeight: 1,
        }}>✓</span>
      )}
    </button>
  );
}

export default function QRGeneratorPage() {
  const [url, setUrl] = useState("https://www.amazon.com/dp/B08XYZ1234");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [fgCustom, setFgCustom] = useState("#000000");
  const [bgCustom, setBgCustom] = useState("#FFFFFF");
  const [size, setSize] = useState(220);
  const [includeMargin, setIncludeMargin] = useState(true);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "neon10-qrcode.png";
    link.href = (canvas as HTMLCanvasElement).toDataURL("image/png");
    link.click();
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine if color is light (for checkmark contrast)
  const isLight = (hex: string) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">QR Code Generator</h1>
          <p className="page-subtitle">Create branded QR codes for product packaging, inserts, and marketing materials</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24 }}>
        {/* Settings Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* URL Input */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 16 }}>Target URL</h2>
            <input
              className="input-field"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.amazon.com/dp/YOUR_ASIN"
              style={{ marginBottom: 14 }}
            />
            <div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Quick Presets:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {presets.map(p => (
                  <button
                    key={p.label}
                    className="btn-ghost"
                    style={{ fontSize: 12, padding: "6px 14px" }}
                    onClick={() => setUrl(p.url)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Styling */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 20 }}>Styling Options</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* FG Color */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    QR Code Color
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: fgColor, border: "2px solid var(--border)", flexShrink: 0 }} />
                    <code style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "monospace", fontWeight: 700 }}>{fgColor}</code>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
                  {fgPresets.map(c => (
                    <ColorSwatch
                      key={c.hex}
                      hex={c.hex}
                      label={c.label}
                      selected={fgColor === c.hex}
                      onSelect={() => { setFgColor(c.hex); setFgCustom(c.hex); }}
                    />
                  ))}
                </div>
                {/* Custom color picker */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <Pipette size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Custom</span>
                  <input
                    type="color"
                    value={fgCustom}
                    onChange={e => { setFgCustom(e.target.value); setFgColor(e.target.value); }}
                    style={{ width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer", padding: 0, background: "none" }}
                  />
                  <input
                    type="text"
                    value={fgCustom}
                    maxLength={7}
                    onChange={e => {
                      const v = e.target.value;
                      setFgCustom(v);
                      if (/^#[0-9A-Fa-f]{6}$/.test(v)) setFgColor(v);
                    }}
                    placeholder="#000000"
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "monospace", fontWeight: 600 }}
                  />
                  <button
                    onClick={() => setFgColor(fgCustom)}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* BG Color */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Background Color
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: bgColor, border: "2px solid var(--border)", flexShrink: 0 }} />
                    <code style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "monospace", fontWeight: 700 }}>{bgColor}</code>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
                  {bgPresets.map(c => (
                    <ColorSwatch
                      key={c.hex}
                      hex={c.hex}
                      label={c.label}
                      selected={bgColor === c.hex}
                      onSelect={() => { setBgColor(c.hex); setBgCustom(c.hex); }}
                    />
                  ))}
                </div>
                {/* Custom color picker */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <Pipette size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Custom</span>
                  <input
                    type="color"
                    value={bgCustom}
                    onChange={e => { setBgCustom(e.target.value); setBgColor(e.target.value); }}
                    style={{ width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer", padding: 0, background: "none" }}
                  />
                  <input
                    type="text"
                    value={bgCustom}
                    maxLength={7}
                    onChange={e => {
                      const v = e.target.value;
                      setBgCustom(v);
                      if (/^#[0-9A-Fa-f]{6}$/.test(v)) setBgColor(v);
                    }}
                    placeholder="#FFFFFF"
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "monospace", fontWeight: 600 }}
                  />
                  <button
                    onClick={() => setBgColor(bgCustom)}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Size */}
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Size — {size}px × {size}px
                </label>
                <input type="range" min={150} max={500} step={10} value={size} onChange={e => setSize(Number(e.target.value))} style={{ width: "100%", accentColor: "#ff6b35" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  <span>150px</span><span>500px</span>
                </div>
              </div>

              {/* Margin toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Include Quiet Zone (Margin)</span>
                <label className="toggle">
                  <input type="checkbox" checked={includeMargin} onChange={e => setIncludeMargin(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* Use cases */}
          <div className="glass-card" style={{ padding: 24, background: "rgba(255,107,53,0.04)", border: "1px solid var(--accent-muted)" }}>
            <h3 style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)", marginBottom: 12 }}>💡 Pro Use Cases</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Product packaging insert → review request page",
                "Business card → Amazon Brand Store",
                "Email newsletter → lightning deal URL",
                "In-store display → product listing page",
              ].map((tip, i) => (
                <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--accent)", flexShrink: 0 }}>→</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* QR Preview Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass-card" style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, position: "sticky", top: 20 }}>
            <h2 style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", alignSelf: "flex-start" }}>Live Preview</h2>

            {/* QR Code Display */}
            <div
              ref={qrRef}
              style={{
                padding: 20,
                background: bgColor,
                borderRadius: 16,
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                border: "1px solid rgba(128,128,128,0.2)",
              }}
            >
              <QRCodeCanvas
                value={url || "https://neon10.com"}
                size={Math.min(size, 300)}
                fgColor={fgColor}
                bgColor={bgColor}
                includeMargin={includeMargin}
                level="M"
              />
            </div>

            {/* Color preview pills */}
            <div style={{ display: "flex", gap: 10, alignSelf: "stretch", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: fgColor, border: "1px solid rgba(128,128,128,0.3)" }} />
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", fontWeight: 700 }}>{fgColor}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: bgColor, border: "1px solid rgba(128,128,128,0.3)" }} />
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", fontWeight: 700 }}>{bgColor}</span>
              </div>
            </div>

            {/* URL Preview */}
            <div style={{
              width: "100%",
              background: "#0d1117",
              borderRadius: 10,
              padding: "10px 14px",
              border: "1px solid rgba(255,107,53,0.2)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <QrCode size={14} color="#7ee787" style={{ flexShrink: 0 }} />
              <span style={{
                fontSize: 11,
                color: "#7ee787",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                fontFamily: "monospace",
              }}>
                {url || "https://neon10.com"}
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                className="btn-accent"
                onClick={downloadQR}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Download size={15} /> Download PNG
              </button>
              <button
                className="btn-ghost"
                onClick={copyUrl}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {copied ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>

            {/* Size info */}
            <div style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}>
              {[
                { label: "Size", value: `${size}×${size}px` },
                { label: "Format", value: "PNG / Canvas" },
                { label: "Error Correction", value: "Level M" },
              ].map(info => (
                <div key={info.label} style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: "10px 12px", textAlign: "center", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{info.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{info.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
