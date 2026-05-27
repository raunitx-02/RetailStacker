"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Package, CheckCircle2, AlertCircle, RefreshCw, Plus, X, Sparkles, ShoppingBag, Eye, Trash2, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";

interface PublishedItem {
  id: string;
  title: string;
  price: number;
  sku: string;
  brand: string;
  marketplaces: string[];
  date: string;
  status: "Active" | "Pending Approval";
}

const MARKETPLACES = [
  { id: "amazon", name: "Amazon India", icon: "🛒", color: "#FF9900", bg: "rgba(255,153,0,0.1)", border: "#FF9900", logo: "/amazon-logo.png" },
  { id: "flipkart", name: "Flipkart", icon: "🛍️", color: "#047BD5", bg: "rgba(4,123,213,0.1)", border: "#047BD5", logo: "/flipkart-logo.svg" },
  { id: "meesho", name: "Meesho", icon: "🏪", color: "#9B30FF", bg: "rgba(155,48,255,0.1)", border: "#9B30FF", logo: "/meesho-logo.png" },
  { id: "shopify", name: "Shopify Store", icon: "🟢", color: "#5E8E3E", bg: "rgba(94,142,62,0.1)", border: "#5E8E3E", logo: "/shopify-logo.png" },
];

export default function PublishPage() {
  const [activeTab, setActiveTab] = useState("amazon");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [publishing, setPublishing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [publishedListings, setPublishedListings] = useState<PublishedItem[]>([]);

  // Amazon specific state
  const [amzTitle, setAmzTitle] = useState("");
  const [amzPrice, setAmzPrice] = useState("");
  const [amzASIN, setAmzASIN] = useState("");
  const [amzCondition, setAmzCondition] = useState("New");
  const [amzFulfillment, setAmzFulfillment] = useState("FBA");
  const [amzSearchTerms, setAmzSearchTerms] = useState("");

  // Flipkart specific state
  const [fkTitle, setFkTitle] = useState("");
  const [fkPrice, setFkPrice] = useState("");
  const [fkFSN, setFkFSN] = useState("");
  const [fkHSN, setFkHSN] = useState("");
  const [fkDispatch, setFkDispatch] = useState("Express (Same Day)");
  const [fkInventory, setFkInventory] = useState("");

  // Meesho specific state
  const [meeshoName, setMeeshoName] = useState("");
  const [meeshoPrice, setMeeshoPrice] = useState("");
  const [meeshoMaterial, setMeeshoMaterial] = useState("");
  const [meeshoReturn, setMeeshoReturn] = useState("7 Days Returnable");
  const [meeshoMultiPack, setMeeshoMultiPack] = useState("Single");

  // Shopify specific state
  const [shopifyTitle, setShopifyTitle] = useState("");
  const [shopifyPrice, setShopifyPrice] = useState("");
  const [shopifyHandle, setShopifyHandle] = useState("");
  const [shopifyType, setShopifyType] = useState("");
  const [shopifyVendor, setShopifyVendor] = useState("");
  const [shopifyTags, setShopifyTags] = useState("");
  const [shopifyInventory, setShopifyInventory] = useState("Track quantity");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("neon10_published_listings");
      if (saved) setPublishedListings(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const triggerToast = (msg: string, type: "success" | "error") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImages(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handlePublish = async (platform: string) => {
    setPublishing(true);
    await new Promise(r => setTimeout(r, 2000));
    setPublishing(false);

    let title = "", price = 0, sku = "";
    if (platform === "amazon") { title = amzTitle; price = parseFloat(amzPrice); sku = amzASIN || "AUTO-AMZ"; }
    else if (platform === "flipkart") { title = fkTitle; price = parseFloat(fkPrice); sku = fkFSN || "AUTO-FK"; }
    else if (platform === "meesho") { title = meeshoName; price = parseFloat(meeshoPrice); sku = "AUTO-M"; }
    else if (platform === "shopify") { title = shopifyTitle; price = parseFloat(shopifyPrice); sku = shopifyHandle || "AUTO-SH"; }

    if (!title || !price) {
      triggerToast(`Please fill Title and Price for ${platform.toUpperCase()}`, "error");
      return;
    }

    const newListing: PublishedItem = {
      id: `PUB-${Math.floor(10000 + Math.random() * 90000)}`,
      title,
      price,
      sku,
      brand: "Neon10 User",
      marketplaces: [platform],
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      status: "Pending Approval"
    };

    const updated = [newListing, ...publishedListings];
    setPublishedListings(updated);
    localStorage.setItem("neon10_published_listings", JSON.stringify(updated));

    triggerToast(`Listing pushed to ${platform.toUpperCase()} API successfully!`, "success");
    confetti({ particleCount: 80, spread: 60 });
  };

  const handleDeleteListing = (id: string) => {
    const updated = publishedListings.filter(item => item.id !== id);
    setPublishedListings(updated);
    localStorage.setItem("neon10_published_listings", JSON.stringify(updated));
    triggerToast("Listing archive deleted.", "success");
  };

  return (
    <div style={{ paddingBottom: 60, maxWidth: 1200, margin: "0 auto" }}>
      {showToast && (
        <div style={{ position: "fixed", top: 30, right: 30, zIndex: 9999, background: toastType === "error" ? "var(--danger)" : "var(--success)", color: "white", padding: "16px 24px", borderRadius: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.3)", animation: "slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
          {toastType === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          {toastMsg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Upload color="var(--accent)" /> Direct Marketplace Publisher
          </h1>
          <p className="page-subtitle">Upload your products to 4 unique channels with exact field requirements for each marketplace.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 24 }}>
        
        {/* Left Column - Dynamic Forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Tab Navigation */}
          <div className="glass-card" style={{ padding: "8px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
            {MARKETPLACES.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12,
                  background: activeTab === m.id ? m.bg : "transparent",
                  border: `1px solid ${activeTab === m.id ? m.border : "transparent"}`,
                  color: activeTab === m.id ? m.color : "var(--text-muted)",
                  fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <Image src={m.logo} alt={m.name} width={18} height={18} style={{ objectFit: "contain" }} unoptimized />
                {m.name}
              </button>
            ))}
          </div>

          <div className="glass-card" style={{ padding: 32 }}>
            {activeTab === "amazon" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 8, color: "#FF9900" }}>Amazon SP-API Requirements</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Product Title (Required)</label>
                    <input type="text" value={amzTitle} onChange={e => setAmzTitle(e.target.value)} placeholder="e.g., Samsung Galaxy S23 Ultra 5G" className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Standard Price (₹) (Required)</label>
                    <input type="number" value={amzPrice} onChange={e => setAmzPrice(e.target.value)} placeholder="0.00" className="input-field" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>ASIN / UPC / EAN (Required)</label>
                    <input type="text" value={amzASIN} onChange={e => setAmzASIN(e.target.value)} placeholder="e.g., B0B3XXX" className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Item Condition</label>
                    <select value={amzCondition} onChange={e => setAmzCondition(e.target.value)} className="input-field">
                      <option>New</option><option>Renewed</option><option>Used - Like New</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Fulfillment Channel</label>
                  <select value={amzFulfillment} onChange={e => setAmzFulfillment(e.target.value)} className="input-field">
                    <option>FBA (Fulfilled by Amazon)</option><option>Easy Ship</option><option>Self Ship (FBM)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Backend Search Terms (250 bytes max)</label>
                  <textarea value={amzSearchTerms} onChange={e => setAmzSearchTerms(e.target.value)} placeholder="keyword1, keyword2..." className="input-field" rows={3} />
                </div>
                <button onClick={() => handlePublish("amazon")} disabled={publishing} className="btn-accent" style={{ background: "#FF9900", color: "#000", marginTop: 16 }}>{publishing ? "Connecting SP-API..." : "Upload to Amazon India"}</button>
              </div>
            )}

            {activeTab === "flipkart" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 8, color: "#047BD5" }}>Flipkart Seller API Requirements</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Listing Title (Required)</label>
                    <input type="text" value={fkTitle} onChange={e => setFkTitle(e.target.value)} placeholder="Title..." className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Selling Price (₹) (Required)</label>
                    <input type="number" value={fkPrice} onChange={e => setFkPrice(e.target.value)} placeholder="0.00" className="input-field" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>FSN (Flipkart Serial Number)</label>
                    <input type="text" value={fkFSN} onChange={e => setFkFSN(e.target.value)} placeholder="FSN..." className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>HSN / SAC Code (Required for GST)</label>
                    <input type="text" value={fkHSN} onChange={e => setFkHSN(e.target.value)} placeholder="e.g. 85171211" className="input-field" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Procurement SLA (Dispatch Time)</label>
                    <select value={fkDispatch} onChange={e => setFkDispatch(e.target.value)} className="input-field">
                      <option>Express (Same Day)</option><option>In-stock (2 Days)</option><option>Made to Order (7+ Days)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Inventory Count</label>
                    <input type="number" value={fkInventory} onChange={e => setFkInventory(e.target.value)} placeholder="Qty" className="input-field" />
                  </div>
                </div>
                <button onClick={() => handlePublish("flipkart")} disabled={publishing} className="btn-accent" style={{ background: "#047BD5", marginTop: 16 }}>{publishing ? "Connecting API..." : "Upload to Flipkart"}</button>
              </div>
            )}

            {activeTab === "meesho" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 8, color: "#9B30FF" }}>Meesho Catalog Requirements</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Catalog / Product Name (Required)</label>
                    <input type="text" value={meeshoName} onChange={e => setMeeshoName(e.target.value)} placeholder="Product Name..." className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Transfer Price (₹) (Required)</label>
                    <input type="number" value={meeshoPrice} onChange={e => setMeeshoPrice(e.target.value)} placeholder="0.00" className="input-field" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Fabric / Material Details</label>
                    <input type="text" value={meeshoMaterial} onChange={e => setMeeshoMaterial(e.target.value)} placeholder="Cotton, Plastic, etc." className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Return Policy</label>
                    <select value={meeshoReturn} onChange={e => setMeeshoReturn(e.target.value)} className="input-field">
                      <option>7 Days Returnable</option><option>Only Defective (Non-Returnable)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Multi-pack Size</label>
                  <select value={meeshoMultiPack} onChange={e => setMeeshoMultiPack(e.target.value)} className="input-field">
                    <option>Single</option><option>Pack of 2</option><option>Pack of 3</option><option>Pack of 5+</option>
                  </select>
                </div>
                <button onClick={() => handlePublish("meesho")} disabled={publishing} className="btn-accent" style={{ background: "#9B30FF", marginTop: 16 }}>{publishing ? "Generating CSV format..." : "Publish to Meesho Catalog"}</button>
              </div>
            )}

            {activeTab === "shopify" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 8, color: "#5E8E3E" }}>Shopify Admin API Requirements</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Product Title (Required)</label>
                    <input type="text" value={shopifyTitle} onChange={e => setShopifyTitle(e.target.value)} placeholder="Product Title" className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Price (Required)</label>
                    <input type="number" value={shopifyPrice} onChange={e => setShopifyPrice(e.target.value)} placeholder="0.00" className="input-field" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>URL Handle</label>
                    <input type="text" value={shopifyHandle} onChange={e => setShopifyHandle(e.target.value)} placeholder="e.g., my-cool-product" className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Product Type</label>
                    <input type="text" value={shopifyType} onChange={e => setShopifyType(e.target.value)} placeholder="Apparel, Electronics..." className="input-field" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Vendor</label>
                    <input type="text" value={shopifyVendor} onChange={e => setShopifyVendor(e.target.value)} placeholder="Brand Name" className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Inventory Policy</label>
                    <select value={shopifyInventory} onChange={e => setShopifyInventory(e.target.value)} className="input-field">
                      <option>Track quantity</option><option>Continue selling when out of stock</option><option>Don't track inventory</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Tags (comma separated)</label>
                  <input type="text" value={shopifyTags} onChange={e => setShopifyTags(e.target.value)} placeholder="summer, sale, electronics" className="input-field" />
                </div>
                <button onClick={() => handlePublish("shopify")} disabled={publishing} className="btn-accent" style={{ background: "#5E8E3E", marginTop: 16 }}>{publishing ? "Connecting API..." : "Upload to Shopify Store"}</button>
              </div>
            )}
            
            {/* Global Image Upload */}
            <div style={{ marginTop: 32, borderTop: "1px dashed var(--border)", paddingTop: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
                <ImageIcon size={18} color="var(--accent)" /> Global Media Upload (Applies to all platforms)
              </label>
              <div style={{ border: "2px dashed var(--border)", borderRadius: 16, padding: "32px 20px", textAlign: "center", background: "var(--bg-secondary)", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                <div style={{ width: 48, height: 48, background: "var(--accent-muted)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
                  <Upload size={20} color="var(--accent)" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Drag and drop media files</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, marginBottom: 16 }}>JPG, PNG, WEBP (Max 5MB)</div>
                <label style={{ background: "var(--bg-card)", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "var(--text-primary)", cursor: "pointer", display: "inline-block" }}>
                  Browse Files
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                </label>
              </div>
              {images.length > 0 && (
                <div style={{ display: "flex", gap: 12, marginTop: 16, overflowX: "auto", paddingBottom: 8 }}>
                  {images.map((src, i) => (
                    <div key={i} style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", position: "relative", border: "1px solid var(--border)", flexShrink: 0 }}>
                      <Image src={src} alt="Upload" fill style={{ objectFit: "cover" }} unoptimized />
                      <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer" }}><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Status Log */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-card" style={{ padding: 24, position: "sticky", top: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)" }}>
              <Package size={18} color="var(--accent)" /> Publication History
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: "calc(100vh - 200px)", overflowY: "auto", paddingRight: 8 }}>
              {publishedListings.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No recent publications.</div>
              ) : publishedListings.map(item => (
                <div key={item.id} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>{item.id}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, padding: "2px 8px", background: item.status === "Active" ? "rgba(34, 197, 94, 0.15)" : "var(--warning-muted)", color: item.status === "Active" ? "#22c55e" : "var(--warning)", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {item.status === "Active" ? <CheckCircle2 size={10} /> : <RefreshCw size={10} className="spin" />}
                      {item.status}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.title}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {item.marketplaces.map(mId => {
                        const mInfo = MARKETPLACES.find(m => m.id === mId);
                        if (!mInfo) return null;
                        return (
                          <div key={mId} title={mInfo.name} style={{ width: 24, height: 24, borderRadius: 6, background: mInfo.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Image src={mInfo.logo} alt={mInfo.name} width={14} height={14} style={{ objectFit: "contain" }} unoptimized />
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>₹{item.price}</div>
                      <button onClick={() => handleDeleteListing(item.id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 4 }} title="Archive Listing">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .input-field { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-secondary); color: white; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: var(--accent); }
      `}} />
    </div>
  );
}
