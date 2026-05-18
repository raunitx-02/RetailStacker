"use client";
import { useState, useRef, useCallback } from "react";
import {
  Upload, Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, Download,
  Ruler, Package, TrendingDown, CheckCircle2, AlertCircle, Info,
  Maximize2, Minimize2, RefreshCw, Sparkles, IndianRupee, ArrowRight
} from "lucide-react";

// Meesho shipping rate tiers based on volumetric weight (grams)
// Meesho uses: Vol. Weight (g) = L(cm) × W(cm) × H(cm) × 0.5
// If actual weight > vol weight, actual weight is used
// Shipping category thresholds (approx real Meesho rates 2024)
const SHIPPING_TIERS = [
  { max: 500, label: "XS", rate: 29, color: "var(--success)" },
  { max: 1000, label: "S", rate: 39, color: "var(--success)" },
  { max: 2000, label: "M", rate: 55, color: "var(--warning)" },
  { max: 3000, label: "L", rate: 72, color: "var(--warning)" },
  { max: 5000, label: "XL", rate: 98, color: "var(--danger)" },
  { max: Infinity, label: "XXL", rate: 140, color: "var(--danger)" },
];

function getShippingInfo(L: number, W: number, H: number, actualWeight: number) {
  const volWeight = Math.round(L * W * H * 0.5);
  const chargeableWeight = Math.max(volWeight, actualWeight);
  const tier = SHIPPING_TIERS.find(t => chargeableWeight <= t.max) || SHIPPING_TIERS[SHIPPING_TIERS.length - 1];
  return { volWeight, chargeableWeight, tier };
}

function WeightBar({ weight, max }: { weight: number; max: number }) {
  const pct = Math.min((weight / max) * 100, 100);
  const color = pct < 50 ? "var(--success)" : pct < 80 ? "var(--warning)" : "var(--danger)";
  return (
    <div style={{ height: 8, background: "var(--bg-secondary)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
    </div>
  );
}

export default function MeeshoOptimizerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState({ w: 0, h: 0 });

  // Product dimensions (cm)
  const [L, setL] = useState(30);
  const [W, setW] = useState(20);
  const [H, setH] = useState(10);
  const [actualWeight, setActualWeight] = useState(500);

  // Image edit controls
  const [borderSize, setBorderSize] = useState(0);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [targetW, setTargetW] = useState(1000);
  const [targetH, setTargetH] = useState(1000);
  const [brightness, setBrightness] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dimensions" | "image">("dimensions");

  const shipping = getShippingInfo(L, W, H, actualWeight);

  // Optimized dimensions suggestion
  const getOptimizedDims = () => {
    // Find the next lowest tier
    const currentTier = SHIPPING_TIERS.findIndex(t => shipping.chargeableWeight <= t.max);
    if (currentTier <= 0) return null;
    const targetTier = SHIPPING_TIERS[currentTier - 1];
    const targetVolWeight = targetTier.max;
    // Suggest reducing height first (easiest packaging change)
    const newH = Math.floor(targetVolWeight / (L * W * 0.5));
    if (newH >= 1) return { L, W, H: newH, savings: shipping.tier.rate - targetTier.rate, tier: targetTier };
    // Try reducing W
    const newW = Math.floor(targetVolWeight / (L * H * 0.5));
    if (newW >= 1) return { L, W: newW, H, savings: shipping.tier.rate - targetTier.rate, tier: targetTier };
    return null;
  };
  const optimized = getOptimizedDims();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      setImageUrl(url);
      setImageDims({ w: img.naturalWidth, h: img.naturalHeight });
      setTargetW(img.naturalWidth);
      setTargetH(img.naturalHeight);
    };
    img.src = url;
  };

  const processImage = useCallback(async () => {
    if (!image || !canvasRef.current) return;
    setProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    canvas.width = targetW;
    canvas.height = targetH;

    // Fill background with border color
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, targetW, targetH);

    // Calculate draw area with border
    const drawW = targetW - borderSize * 2;
    const drawH = targetH - borderSize * 2;

    // Fit image into draw area (maintain aspect ratio)
    const imgAspect = image.naturalWidth / image.naturalHeight;
    const drawAspect = drawW / drawH;
    let sx = 0, sy = 0, sw = drawW, sh = drawH;
    if (imgAspect > drawAspect) {
      sh = drawW / imgAspect;
      sy = (drawH - sh) / 2;
    } else {
      sw = drawH * imgAspect;
      sx = (drawW - sw) / 2;
    }

    // Apply brightness filter
    ctx.filter = `brightness(${brightness}%)`;
    ctx.drawImage(image, borderSize + sx, borderSize + sy, sw, sh);
    ctx.filter = "none";

    const url = canvas.toDataURL("image/jpeg", 0.92);
    setDownloadUrl(url);
    setProcessing(false);
  }, [image, targetW, targetH, borderSize, borderColor, brightness]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎁 Meesho Shipping Optimizer</h1>
          <p className="page-subtitle">Optimize your product dimensions & images to get the lowest possible shipping rate on Meesho</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ padding: "8px 16px", background: "var(--purple-muted)", border: "1px solid var(--purple)", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "var(--purple)" }}>
            🛍️ Meesho Tool
          </div>
        </div>
      </div>

      {/* How It Works Banner */}
      <div style={{ background: "var(--accent-muted)", border: "1px solid var(--accent)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Info size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>💡 How Meesho Shipping Works</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Meesho charges shipping based on <b>chargeable weight</b> = <b>MAX(actual weight, volumetric weight)</b>.
            Volumetric weight = <b>L × W × H × 0.5 grams</b>.
            By reducing product dimensions even slightly, you can drop to a lower shipping tier and <b>save ₹10–₹50 per order</b>.
            Use this tool to: (1) calculate your current tier, (2) see the optimal dimensions, and (3) optimize your product images to display correct dimensions.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Dimension Calculator */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>📦 Product Dimensions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {[
              { label: "LENGTH (cm)", val: L, set: setL },
              { label: "WIDTH (cm)", val: W, set: setW },
              { label: "HEIGHT (cm)", val: H, set: setH },
              { label: "ACTUAL WEIGHT (g)", val: actualWeight, set: setActualWeight },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>{label}</label>
                <input
                  type="number" min={1} value={val}
                  onChange={e => set(Number(e.target.value))}
                  className="input-field"
                  style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 18 }}
                />
              </div>
            ))}
          </div>

          {/* Calculation breakdown */}
          <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: "var(--text-muted)" }}>Volumetric Weight</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{shipping.volWeight}g</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: "var(--text-muted)" }}>Actual Weight</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{actualWeight}g</span>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Chargeable Weight</span>
              <span style={{ fontWeight: 900, color: "var(--accent)" }}>{shipping.chargeableWeight}g</span>
            </div>
          </div>

          {/* Current tier */}
          <div style={{ padding: 20, borderRadius: 12, border: `2px solid ${shipping.tier.color}`, background: `${shipping.tier.color}15`, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Current Shipping Tier</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: shipping.tier.color }}>{shipping.tier.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: shipping.tier.color }}>₹{shipping.tier.rate}<span style={{ fontSize: 13, fontWeight: 500 }}>/order</span></div>
          </div>
        </div>

        {/* All tiers + Optimization */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>📊 Shipping Tier Comparison</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {SHIPPING_TIERS.filter(t => t.max !== Infinity).map((tier, i) => {
              const isActive = shipping.tier.label === tier.label;
              const weight = SHIPPING_TIERS[i - 1]?.max ? `${SHIPPING_TIERS[i - 1].max + 1}–${tier.max}g` : `0–${tier.max}g`;
              return (
                <div key={tier.label} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  borderRadius: 10, border: `2px solid ${isActive ? tier.color : "var(--border)"}`,
                  background: isActive ? `${tier.color}15` : "var(--bg-secondary)",
                  transition: "all 0.2s",
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${tier.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: tier.color, flexShrink: 0 }}>{tier.label}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{weight}</div>
                    <WeightBar weight={isActive ? shipping.chargeableWeight : (SHIPPING_TIERS[i - 1]?.max || 0)} max={tier.max} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: tier.color }}>₹{tier.rate}</div>
                  {isActive && <div style={{ fontSize: 10, fontWeight: 800, background: tier.color, color: "white", padding: "2px 8px", borderRadius: 20 }}>CURRENT</div>}
                </div>
              );
            })}
          </div>

          {/* Optimization Suggestion */}
          {optimized && (
            <div style={{ background: "var(--success-muted)", border: "1px solid var(--success)", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Sparkles size={18} color="var(--success)" />
                <span style={{ fontWeight: 800, color: "var(--success)", fontSize: 14 }}>AI Optimization Suggestion</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                Reduce <b>height from {H}cm → {optimized.H}cm</b> to drop to tier <b style={{ color: optimized.tier.color }}>{optimized.tier.label}</b>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--success)" }}>₹{optimized.savings} saved/order</div>
                <button onClick={() => setH(optimized.H)} className="btn-accent" style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  Apply <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
          {!optimized && (
            <div style={{ background: "var(--success-muted)", border: "1px solid var(--success)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <CheckCircle2 size={28} color="var(--success)" style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 700, color: "var(--success)" }}>Already at the lowest possible tier! 🎉</div>
            </div>
          )}
        </div>
      </div>

      {/* Image Optimizer */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800 }}>🖼️ Product Image Optimizer</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Resize, add white borders, and optimize your product image for Meesho listing</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setActiveTab("dimensions")} className={activeTab === "dimensions" ? "btn-accent" : "btn-ghost"} style={{ padding: "8px 16px", fontSize: 13 }}>Resize & Border</button>
            <button onClick={() => setActiveTab("image")} className={activeTab === "image" ? "btn-accent" : "btn-ghost"} style={{ padding: "8px 16px", fontSize: 13 }}>Enhance</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          {/* Controls */}
          <div>
            {/* Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${imageUrl ? "var(--success)" : "var(--border)"}`,
                borderRadius: 12, padding: 32, textAlign: "center", cursor: "pointer",
                background: imageUrl ? "var(--success-muted)" : "var(--bg-secondary)",
                marginBottom: 20, transition: "all 0.2s",
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) { const input = fileInputRef.current; if (input) { const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files; handleImageUpload({ target: input } as any); } } }}
            >
              {imageUrl
                ? <><CheckCircle2 size={32} color="var(--success)" style={{ marginBottom: 8 }} /><div style={{ fontWeight: 700, color: "var(--success)" }}>Image Loaded ({imageDims.w}×{imageDims.h}px)</div></>
                : <><Upload size={32} color="var(--text-muted)" style={{ marginBottom: 8 }} /><div style={{ fontWeight: 600, color: "var(--text-muted)" }}>Drop image here or click to upload</div><div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>JPG, PNG, WebP supported</div></>
              }
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

            {activeTab === "dimensions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>OUTPUT WIDTH (px)</label>
                    <input type="number" className="input-field" value={targetW} onChange={e => setTargetW(Number(e.target.value))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>OUTPUT HEIGHT (px)</label>
                    <input type="number" className="input-field" value={targetH} onChange={e => setTargetH(Number(e.target.value))} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>BORDER SIZE (px): {borderSize}</label>
                  <input type="range" min={0} max={200} value={borderSize} onChange={e => setBorderSize(Number(e.target.value))} style={{ width: "100%" }} />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>BORDER COLOR</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["#ffffff", "#f0f0f0", "#000000", "#fffbf0", "#f0f8ff"].map(c => (
                      <div key={c} onClick={() => setBorderColor(c)} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: `3px solid ${borderColor === c ? "var(--accent)" : "var(--border)"}`, cursor: "pointer" }} />
                    ))}
                    <input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer" }} />
                  </div>
                </div>

                {/* Meesho recommended presets */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>MEESHO PRESETS</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { label: "Square 1:1", w: 1000, h: 1000 },
                      { label: "Portrait 3:4", w: 750, h: 1000 },
                      { label: "Landscape 4:3", w: 1000, h: 750 },
                    ].map(p => (
                      <button key={p.label} onClick={() => { setTargetW(p.w); setTargetH(p.h); }} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>{p.label} ({p.w}×{p.h})</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "image" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>BRIGHTNESS: {brightness}%</label>
                  <input type="range" min={50} max={150} value={brightness} onChange={e => setBrightness(Number(e.target.value))} style={{ width: "100%" }} />
                </div>
                <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: 14, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>💡 Meesho Image Tips</div>
                  • Use white/light background for best approval rate<br />
                  • Product should cover 80-85% of image area<br />
                  • Minimum 500×500px, recommended 1000×1000px<br />
                  • Add white border (50-80px) to appear smaller for shipping<br />
                  • No watermarks, logos or text on product images
                </div>
              </div>
            )}

            <button
              onClick={processImage}
              disabled={!image || processing}
              className="btn-accent"
              style={{ width: "100%", marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {processing ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={16} />}
              {processing ? "Processing..." : "Optimize Image"}
            </button>

            {downloadUrl && (
              <a href={downloadUrl} download="meesho-optimized.jpg" className="btn-ghost" style={{ width: "100%", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", padding: "10px 20px" }}>
                <Download size={16} /> Download Optimized Image
              </a>
            )}
          </div>

          {/* Preview */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 12 }}>PREVIEW</div>
            <div style={{ background: "var(--bg-secondary)", borderRadius: 12, aspectRatio: `${targetW}/${targetH}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid var(--border)", maxHeight: 400 }}>
              {downloadUrl
                ? <img src={downloadUrl} alt="Optimized" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                : imageUrl
                  ? <img src={imageUrl} alt="Original" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  : <div style={{ textAlign: "center", color: "var(--text-muted)" }}><ImageIcon size={48} style={{ marginBottom: 12, opacity: 0.3 }} /><div>Upload an image to preview</div></div>
              }
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {imageUrl && (
              <div style={{ marginTop: 12, display: "flex", gap: 12, fontSize: 12, color: "var(--text-muted)" }}>
                <span>Original: {imageDims.w}×{imageDims.h}px</span>
                <span>→</span>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>Output: {targetW}×{targetH}px</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
