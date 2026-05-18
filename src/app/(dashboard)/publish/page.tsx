"use client";
import { useState } from "react";
import {
  Upload, Package, CheckCircle2, AlertCircle, RefreshCw,
  ChevronDown, Plus, X, Image as ImageIcon, Sparkles
} from "lucide-react";

const MARKETPLACES = [
  { id: "amazon", name: "Amazon India", icon: "🛒", color: "#FF9900", bg: "rgba(255,153,0,0.1)", border: "#FF9900", categories: ["Electronics", "Clothing", "Home & Kitchen", "Sports", "Books", "Toys", "Grocery"] },
  { id: "flipkart", name: "Flipkart", icon: "🛍️", color: "#047BD5", bg: "rgba(4,123,213,0.1)", border: "#047BD5", categories: ["Mobiles", "Fashion", "Electronics", "Home", "Appliances", "Books", "Sports"] },
  { id: "meesho", name: "Meesho", icon: "🏪", color: "#9B30FF", bg: "rgba(155,48,255,0.1)", border: "#9B30FF", categories: ["Women Ethnic", "Women Western", "Men", "Kids", "Home & Kitchen", "Beauty", "Bags"] },
];

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: type === "success" ? "var(--success)" : "var(--danger)",
      color: "white", padding: "14px 20px", borderRadius: 12,
      display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)", cursor: "pointer",
    }}>
      {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {msg}
    </div>
  );
}

export default function PublishPage() {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(["amazon"]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  // Product fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("100");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [weight, setWeight] = useState("");
  const [hsn, setHsn] = useState("");
  const [gst, setGst] = useState("18");

  const toggleMarket = (id: string) =>
    setSelectedMarkets(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImages(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handlePublish = async () => {
    if (!title || !price || selectedMarkets.length === 0) {
      setToast({ msg: "Please fill title, price and select at least one marketplace.", type: "error" });
      return;
    }
    setPublishing(true);
    setPublished([]);
    // Simulate sequential publishing
    for (const mkt of selectedMarkets) {
      await new Promise(r => setTimeout(r, 1200));
      setPublished(prev => [...prev, mkt]);
    }
    setPublishing(false);
    setToast({ msg: `Product published to ${selectedMarkets.length} marketplace(s) successfully!`, type: "success" });
    setTimeout(() => setToast(null), 4000);
  };

  const autoFillAI = () => {
    setTitle("Premium Stainless Steel Water Bottle 1L - BPA Free, Double Wall Insulated");
    setDescription("Keep your drinks hot for 12 hours and cold for 24 hours. Made with food-grade stainless steel. Perfect for office, gym, and outdoor use.");
    setPrice("599");
    setMrp("999");
    setBrand("HydroMax");
    setWeight("400");
    setHsn("73239990");
    setGst("12");
    setToast({ msg: "AI filled sample product details!", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">📤 Publish Products</h1>
          <p className="page-subtitle">Create & publish products to Amazon India, Flipkart, and Meesho simultaneously</p>
        </div>
        <button onClick={autoFillAI} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <Sparkles size={16} color="var(--accent)" /> AI Auto-Fill Sample
        </button>
      </div>

      {/* Marketplace Selector */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Select Marketplaces</h2>
        <div style={{ display: "flex", gap: 16 }}>
          {MARKETPLACES.map(m => {
            const sel = selectedMarkets.includes(m.id);
            const done = published.includes(m.id);
            return (
              <div key={m.id} onClick={() => toggleMarket(m.id)} style={{
                flex: 1, padding: 20, borderRadius: 12, cursor: "pointer",
                border: `2px solid ${sel ? m.border : "var(--border)"}`,
                background: sel ? m.bg : "var(--bg-secondary)",
                transition: "all 0.2s", position: "relative",
              }}>
                {done && <div style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", background: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={12} color="white" /></div>}
                {publishing && sel && !done && <div style={{ position: "absolute", top: 8, right: 8 }}><RefreshCw size={16} color={m.color} style={{ animation: "spin 1s linear infinite" }} /></div>}
                <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: sel ? m.color : "var(--text-primary)" }}>{m.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{sel ? "✓ Selected" : "Click to select"}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Main form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Basic Info */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Product Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>PRODUCT TITLE *</label>
                <input className="input-field" placeholder="Enter a detailed, keyword-rich title..." value={title} onChange={e => setTitle(e.target.value)} />
                <div style={{ fontSize: 11, color: title.length > 200 ? "var(--danger)" : "var(--text-muted)", marginTop: 4 }}>{title.length}/200 characters</div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>DESCRIPTION</label>
                <textarea className="input-field" rows={4} placeholder="Describe your product features, benefits, and specifications..." value={description} onChange={e => setDescription(e.target.value)} style={{ resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>SELLING PRICE (₹) *</label>
                  <input className="input-field" type="number" placeholder="599" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>MRP (₹)</label>
                  <input className="input-field" type="number" placeholder="999" value={mrp} onChange={e => setMrp(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>SKU / BARCODE</label>
                  <input className="input-field" placeholder="SKU-001" value={sku} onChange={e => setSku(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>STOCK QUANTITY</label>
                  <input className="input-field" type="number" placeholder="100" value={stock} onChange={e => setStock(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>BRAND</label>
                  <input className="input-field" placeholder="Your brand name" value={brand} onChange={e => setBrand(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>WEIGHT (grams)</label>
                  <input className="input-field" type="number" placeholder="500" value={weight} onChange={e => setWeight(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>HSN CODE</label>
                  <input className="input-field" placeholder="73239990" value={hsn} onChange={e => setHsn(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>GST RATE (%)</label>
                  <select className="input-field" value={gst} onChange={e => setGst(e.target.value)}>
                    {["0", "5", "12", "18", "28"].map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Product Images</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: "relative", width: 100, height: 100 }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10, border: "2px solid var(--border)" }} />
                  <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "var(--danger)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
                  {i === 0 && <div style={{ position: "absolute", bottom: 4, left: 4, fontSize: 9, background: "var(--accent)", color: "white", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>MAIN</div>}
                </div>
              ))}
              <label style={{ width: 100, height: 100, border: "2px dashed var(--border)", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4 }}>
                <Plus size={20} color="var(--text-muted)" />
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Add</span>
                <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
              </label>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>💡 Tip: First image is the main listing image. Use our <a href="/tools/meesho-optimizer" style={{ color: "var(--accent)", textDecoration: "none" }}>Meesho Image Optimizer</a> for best shipping rates.</p>
          </div>
        </div>

        {/* Sidebar - per marketplace settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {selectedMarkets.map(mId => {
            const m = MARKETPLACES.find(x => x.id === mId)!;
            return (
              <div key={mId} className="glass-card" style={{ padding: 20, border: `1px solid ${m.border}40` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: 14, color: m.color }}>{m.name}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>CATEGORY</label>
                    <select className="input-field" style={{ fontSize: 13 }}>
                      <option value="">Select category...</option>
                      {m.categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {mId === "amazon" && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>FULFILLMENT</label>
                      <select className="input-field" style={{ fontSize: 13 }}>
                        <option>FBA (Fulfilled by Amazon)</option>
                        <option>FBM (Seller ships)</option>
                      </select>
                    </div>
                  )}
                  {mId === "meesho" && (
                    <div style={{ background: "rgba(155,48,255,0.08)", borderRadius: 8, padding: 10, fontSize: 12, color: "var(--text-secondary)" }}>
                      💡 Meesho handles all shipping. Optimize dimensions using our Meesho tool for lower rates.
                    </div>
                  )}
                  {mId === "flipkart" && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>LISTING TYPE</label>
                      <select className="input-field" style={{ fontSize: 13 }}>
                        <option>Flipkart Fulfilled</option>
                        <option>Seller Fulfilled</option>
                      </select>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: "1px solid var(--border)" }}>
                    {published.includes(mId)
                      ? <><CheckCircle2 size={14} color="var(--success)" /><span style={{ fontSize: 12, color: "var(--success)", fontWeight: 700 }}>Published!</span></>
                      : <><div style={{ width: 8, height: 8, borderRadius: "50%", background: selectedMarkets.includes(mId) ? "var(--warning)" : "var(--border)" }} /><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Ready to publish</span></>
                    }
                  </div>
                </div>
              </div>
            );
          })}

          {/* Publish Button */}
          <button onClick={handlePublish} disabled={publishing} className="btn-accent" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 16, fontWeight: 800, borderRadius: 12 }}>
            {publishing ? <RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={20} />}
            {publishing ? "Publishing..." : `Publish to ${selectedMarkets.length} Marketplace${selectedMarkets.length > 1 ? "s" : ""}`}
          </button>

          {published.length > 0 && (
            <div style={{ background: "var(--success-muted)", border: "1px solid var(--success)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, color: "var(--success)", marginBottom: 8 }}>✅ Published Successfully</div>
              {published.map(id => {
                const m = MARKETPLACES.find(x => x.id === id)!;
                return <div key={id} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>{m.icon} {m.name} — Live in 10-30 minutes</div>;
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
