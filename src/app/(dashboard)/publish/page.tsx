"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Package, CheckCircle2, AlertCircle, RefreshCw, Plus, X, Sparkles, ShoppingBag, Eye, Trash2, Calendar } from "lucide-react";
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
  { id: "amazon", name: "Amazon India", icon: "🛒", color: "#FF9900", bg: "rgba(255,153,0,0.1)", border: "#FF9900", logo: "/amazon-logo.png", categories: ["Electronics", "Clothing", "Home & Kitchen", "Sports", "Books", "Toys", "Grocery"] },
  { id: "flipkart", name: "Flipkart", icon: "🛍️", color: "#047BD5", bg: "rgba(4,123,213,0.1)", border: "#047BD5", logo: "/flipkart-logo.svg", categories: ["Mobiles", "Fashion", "Electronics", "Home", "Appliances", "Books", "Sports"] },
  { id: "meesho", name: "Meesho", icon: "🏪", color: "#9B30FF", bg: "rgba(155,48,255,0.1)", border: "#9B30FF", logo: "/meesho-logo.png", categories: ["Women Ethnic", "Women Western", "Men", "Kids", "Home & Kitchen", "Beauty", "Bags"] },
  { id: "shopify", name: "Shopify Store", icon: "🟢", color: "#5E8E3E", bg: "rgba(94,142,62,0.1)", border: "#5E8E3E", logo: "/shopify-logo.png", categories: ["Apparel", "Electronics", "Home Decor", "Health & Beauty", "Sports", "Food & Drink", "Art & Crafts", "Jewelry"] },
];

const DEFAULT_PUBLISHED_ITEMS: PublishedItem[] = [
  {
    id: "PUB-22894",
    title: "Premium Bamboo Cutting Board Set - Chopping Blocks",
    price: 1499,
    sku: "BBTB-001",
    brand: "EcoHome",
    marketplaces: ["amazon", "flipkart"],
    date: "May 18, 2026",
    status: "Active"
  },
  {
    id: "PUB-81942",
    title: "Stainless Steel Insulated Water Bottle 1L",
    price: 699,
    sku: "SSWB-032",
    brand: "HydroMax",
    marketplaces: ["amazon", "meesho"],
    date: "May 15, 2026",
    status: "Active"
  }
];

export default function PublishPage() {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(["amazon"]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  
  const [publishing, setPublishing] = useState(false);
  const [activePublishingMarket, setActivePublishingMarket] = useState<string | null>(null);
  const [publishedMarkets, setPublishedMarkets] = useState<string[]>([]);
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

  // Per-channel properties
  const [amazonCategory, setAmazonCategory] = useState("Home & Kitchen");
  const [amazonFulfillment, setAmazonFulfillment] = useState("FBA");
  const [flipkartCategory, setFlipkartCategory] = useState("Home");
  const [flipkartListingType, setFlipkartListingType] = useState("Flipkart Fulfilled");
  const [meeshoCategory, setMeeshoCategory] = useState("Home & Kitchen");
  const [shopifyCollection, setShopifyCollection] = useState("All Products");
  const [shopifyProductType, setShopifyProductType] = useState("Apparel");
  const [shopifyInventoryPolicy, setShopifyInventoryPolicy] = useState("deny");

  // Local storage published items
  const [publishedListings, setPublishedListings] = useState<PublishedItem[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("neon10_published_listings");
      if (saved) {
        setPublishedListings(JSON.parse(saved));
      } else {
        setPublishedListings(DEFAULT_PUBLISHED_ITEMS);
        localStorage.setItem("neon10_published_listings", JSON.stringify(DEFAULT_PUBLISHED_ITEMS));
      }
    } catch (e) {
      console.error(e);
      setPublishedListings(DEFAULT_PUBLISHED_ITEMS);
    }
  }, []);

  const triggerToast = (msg: string, type: "success" | "error") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const toggleMarket = (id: string) => {
    setSelectedMarkets(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImages(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handlePublish = async () => {
    if (!title.trim() || !price || selectedMarkets.length === 0) {
      triggerToast("Please populate required fields: title, pricing and select at least one target market.", "error");
      return;
    }

    setPublishing(true);
    setPublishedMarkets([]);

    // Process each selected marketplace sequentially
    for (const mId of selectedMarkets) {
      setActivePublishingMarket(mId);
      // Wait for sequential simulation delay
      await new Promise(r => setTimeout(r, 1500));
      setPublishedMarkets(prev => [...prev, mId]);
    }

    // Complete sequential process
    setPublishing(false);
    setActivePublishingMarket(null);

    const generatedId = `PUB-${Math.floor(10000 + Math.random() * 90000)}`;
    const formattedDate = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    
    const newListing: PublishedItem = {
      id: generatedId,
      title: title,
      price: parseFloat(price) || 0,
      sku: sku || "SKU-AUTO",
      brand: brand || "Generic",
      marketplaces: [...selectedMarkets],
      date: formattedDate,
      status: "Pending Approval"
    };

    const updated = [newListing, ...publishedListings];
    setPublishedListings(updated);
    localStorage.setItem("neon10_published_listings", JSON.stringify(updated));

    triggerToast(`Listing dispatched to ${selectedMarkets.length} marketplace channels successfully!`, "success");
    confetti({ particleCount: 80, spread: 60 });

    // Reset form fields
    setTitle("");
    setDescription("");
    setPrice("");
    setMrp("");
    setSku("");
    setStock("100");
    setBrand("");
    setWeight("");
    setHsn("");
    setImages([]);
  };

  const handleDeleteListing = (id: string) => {
    const updated = publishedListings.filter(item => item.id !== id);
    setPublishedListings(updated);
    localStorage.setItem("neon10_published_listings", JSON.stringify(updated));
    triggerToast("Listing archive deleted.", "success");
  };

  const autoFillAI = () => {
    setTitle("Premium Silicone Kitchen Utensil Set - 12 Piece Non-Stick Heat Resistant Wooden Handles");
    setDescription("Equip your home cooking station with premium non-scratch silicone utensils. High thermal tolerance bounds up to 230 degrees. Features solid organic beechwood grips.");
    setPrice("1299");
    setMrp("1999");
    setSku("SKUS-007");
    setBrand("ChefPro");
    setWeight("950");
    setHsn("39241090");
    setGst("18");
    setAmazonCategory("Home & Kitchen");
    setFlipkartCategory("Appliances");
    setMeeshoCategory("Home & Kitchen");
    setImages(["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"]);
    triggerToast("AI successfully populated all vendor specification profiles!", "success");
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Multi-Channel Product Publisher</h1>
          <p className="page-subtitle">Draft product profiles and dispatch listings to Amazon India, Flipkart, Meesho, and your Shopify Store concurrently</p>
        </div>
        <button onClick={autoFillAI} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <Sparkles size={14} color="var(--accent)" /> AI Auto-Fill Specifications
        </button>
      </div>

      {/* TARGET CHANNELS CARD */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <ShoppingBag size={18} color="var(--accent)" /> Target Marketplace Integrations
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
          {MARKETPLACES.map(m => {
            const isSelected = selectedMarkets.includes(m.id);
            const isFinished = publishedMarkets.includes(m.id);
            const isCurrent = activePublishingMarket === m.id;

            return (
              <div 
                key={m.id} 
                onClick={() => !publishing && toggleMarket(m.id)} 
                style={{
                  padding: 20, 
                  borderRadius: 12, 
                  cursor: publishing ? "not-allowed" : "pointer",
                  border: `2px solid ${isSelected ? m.border : "var(--border)"}`,
                  background: isSelected ? m.bg : "rgba(0,0,0,0.05)",
                  transition: "all 0.2s", 
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 120
                }}
              >
                {isFinished && (
                  <div style={{ position: "absolute", top: 12, right: 12, width: 22, height: 22, borderRadius: "50%", background: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={13} color="white" />
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position: "absolute", top: 12, right: 12 }}>
                    <RefreshCw size={16} color={m.color} className="spin" />
                  </div>
                )}

                <div>
                  {/* Real marketplace logo */}
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: m.bg, border: `1px solid ${m.border}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <Image src={m.logo} alt={m.name} width={28} height={28} style={{ objectFit: "contain" }} unoptimized />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: isSelected ? m.color : "var(--text-primary)" }}>{m.name}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                  {isFinished ? "✓ Channel Dispatched" : isCurrent ? "Publishing Catalog..." : isSelected ? "✓ Click to Deselect" : "Click to Select"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CORE SPECIFICATIONS WORKSPACE */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Specifications Forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Main Specifications Form */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20 }}>Core Catalog Specifications</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>PRODUCT CATALOG TITLE *</label>
                <input 
                  className="input-field" 
                  placeholder="Draft an engaging, keyword-rich search title..." 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
                <div style={{ fontSize: 11, color: title.length > 200 ? "var(--danger)" : "var(--text-muted)", marginTop: 4 }}>{title.length}/200 characters limit</div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>PRODUCT DEPTH DESCRIPTION</label>
                <textarea 
                  className="input-field" 
                  rows={4} 
                  placeholder="Detail high conversion features, sizing parameters, and material descriptions..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  style={{ resize: "vertical", fontFamily: "inherit" }} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>SELLING VALUE (₹) *</label>
                  <input className="input-field" type="number" placeholder="599" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>MAXIMUM LISTING MRP (₹)</label>
                  <input className="input-field" type="number" placeholder="999" value={mrp} onChange={e => setMrp(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>SKU BARCODE IDENTIFIER</label>
                  <input className="input-field" placeholder="BBTB-001" value={sku} onChange={e => setSku(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>INITIAL STOCK QUANTITY</label>
                  <input className="input-field" type="number" placeholder="100" value={stock} onChange={e => setStock(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>BRAND AUTHORITY NAME</label>
                  <input className="input-field" placeholder="EcoHome" value={brand} onChange={e => setBrand(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>PACKAGE SHIPPING WEIGHT (G)</label>
                  <input className="input-field" type="number" placeholder="500" value={weight} onChange={e => setWeight(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>TAX HSN CODE</label>
                  <input className="input-field" placeholder="73239990" value={hsn} onChange={e => setHsn(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>GST TAX SLAB</label>
                  <select className="input-field" value={gst} onChange={e => setGst(e.target.value)}>
                    {["0", "5", "12", "18", "28"].map(r => <option key={r} value={r}>{r}% GST</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Product Gallery Assets */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>Gallery Image Assets</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: "relative", width: 90, height: 90 }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: "2px solid var(--border)" }} />
                  <button 
                    onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} 
                    style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "var(--danger)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <X size={12} />
                  </button>
                  {i === 0 && <div style={{ position: "absolute", bottom: 4, left: 4, fontSize: 8, background: "var(--accent)", color: "white", padding: "2px 4px", borderRadius: 3, fontWeight: 700 }}>MAIN</div>}
                </div>
              ))}
              <label style={{ width: 90, height: 90, border: "2px dashed var(--border)", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4 }}>
                <Plus size={18} color="var(--text-muted)" />
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Upload</span>
                <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
              </label>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
              💡 Primary thumbnail will represent the main consumer search card image. Expand gallery to at least 4 lifestyle graphics.
            </p>
          </div>
        </div>

        {/* Sidebar Channel Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {selectedMarkets.map(mId => {
            const m = MARKETPLACES.find(x => x.id === mId)!;
            
            return (
              <div key={mId} className="glass-card" style={{ padding: 20, border: `1px solid ${m.border}35` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: m.bg, border: `1px solid ${m.border}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Image src={m.logo} alt={m.name} width={20} height={20} style={{ objectFit: "contain" }} unoptimized />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 14, color: m.color }}>{m.name} Parameters</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {mId === "amazon" && (
                    <>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>TARGET CATEGORY</label>
                        <select className="input-field" style={{ fontSize: 13 }} value={amazonCategory} onChange={e => setAmazonCategory(e.target.value)}>
                          {m.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>AMAZON FULFILLMENT MODE</label>
                        <select className="input-field" style={{ fontSize: 13 }} value={amazonFulfillment} onChange={e => setAmazonFulfillment(e.target.value)}>
                          <option value="FBA">FBA (Fulfilled by Amazon)</option>
                          <option value="FBM">FBM (Merchant Self-Ship)</option>
                        </select>
                      </div>
                    </>
                  )}

                  {mId === "flipkart" && (
                    <>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>TARGET CATEGORY</label>
                        <select className="input-field" style={{ fontSize: 13 }} value={flipkartCategory} onChange={e => setFlipkartCategory(e.target.value)}>
                          {m.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>FLIPKART LISTING ASSIGNMENT</label>
                        <select className="input-field" style={{ fontSize: 13 }} value={flipkartListingType} onChange={e => setFlipkartListingType(e.target.value)}>
                          <option value="Flipkart Fulfilled">Flipkart Assured (Recommended)</option>
                          <option value="Seller Fulfilled">Standard Seller Fulfilled</option>
                        </select>
                      </div>
                    </>
                  )}

                  {mId === "meesho" && (
                    <>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>TARGET CATEGORY</label>
                        <select className="input-field" style={{ fontSize: 13 }} value={meeshoCategory} onChange={e => setMeeshoCategory(e.target.value)}>
                          {m.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div style={{ background: "rgba(155,48,255,0.06)", borderRadius: 8, padding: 12, fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        🛡️ Meesho shipping labels are auto-generated. Ensure dimensional details are audited accurately to lower shipping tier penalties.
                      </div>
                    </>
                  )}

                  {mId === "shopify" && (
                    <>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>SHOPIFY COLLECTION</label>
                        <select className="input-field" style={{ fontSize: 13 }} value={shopifyCollection} onChange={e => setShopifyCollection(e.target.value)}>
                          <option>All Products</option>
                          <option>New Arrivals</option>
                          <option>Bestsellers</option>
                          <option>Featured</option>
                          <option>Sale</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>SHOPIFY PRODUCT TYPE</label>
                        <select className="input-field" style={{ fontSize: 13 }} value={shopifyProductType} onChange={e => setShopifyProductType(e.target.value)}>
                          {m.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>INVENTORY POLICY</label>
                        <select className="input-field" style={{ fontSize: 13 }} value={shopifyInventoryPolicy} onChange={e => setShopifyInventoryPolicy(e.target.value)}>
                          <option value="deny">Deny Orders When Out of Stock</option>
                          <option value="continue">Continue Selling When Out of Stock</option>
                        </select>
                      </div>
                      <div style={{ background: "rgba(94,142,62,0.06)", borderRadius: 8, padding: 12, fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        🟢 Product will be published as a draft to your Shopify store. You can manually set pricing variants after review.
                      </div>
                    </>
                  )}
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: "1px solid var(--border)", marginTop: 4 }}>
                    {publishedMarkets.includes(mId) ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle2 size={13} color="var(--success)" />
                        <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 700 }}>Listing Dispatched!</span>
                      </div>
                    ) : activePublishingMarket === mId ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <RefreshCw size={13} color={m.color} className="spin" />
                        <span style={{ fontSize: 12, color: m.color }}>Dispatched queue...</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--warning)" }} />
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Armed & Ready</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Core Publish Action Button */}
          <button 
            onClick={handlePublish} 
            disabled={publishing} 
            className="btn-accent" 
            style={{ 
              padding: 16, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 10, 
              fontSize: 15, 
              fontWeight: 800, 
              borderRadius: 12 
            }}
          >
            {publishing ? <RefreshCw size={18} className="spin" /> : <Upload size={18} />}
            {publishing ? "Publishing Catalog Listings..." : `Publish to ${selectedMarkets.length} Connected Channel${selectedMarkets.length > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>

      {/* RECENTLY PUBLISHED LOG PANEL */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Package size={18} color="var(--accent)" /> Recently Dispatched Multi-Channel Listings
        </h2>
        <div style={{ overflowX: "auto" }}>
          {publishedListings.length === 0 ? (
            <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "30px 10px" }}>
              No recently dispatched merchant listings. Build a product catalog and trigger the publisher to establish records.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>DISPATCH ID</th><th>PRODUCT ITEM</th><th>SKU BARCODE</th><th>BRAND</th><th>SELLING VALUE</th><th>CHANNELS</th><th>DATE SENT</th><th>STATUS</th><th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {publishedListings.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{item.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{item.title}</div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>{item.sku}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{item.brand}</td>
                    <td style={{ fontWeight: 700, color: "var(--success)" }}>₹{item.price.toLocaleString("en-IN")}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {item.marketplaces.map(mId => {
                          const m = MARKETPLACES.find(x => x.id === mId);
                          return (
                            <span 
                              key={mId} 
                              className="badge" 
                              style={{ 
                                background: m?.bg || "rgba(255,255,255,0.05)", 
                                border: `1px solid ${m?.color || "var(--border)"}40`,
                                color: m?.color || "var(--text-secondary)",
                                fontSize: 11
                              }}
                              title={m?.name}
                            >
                              {m?.icon} {m?.name.split(" ")[0]}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={12} /> {item.date}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.status === "Active" ? "badge-success" : "badge-warning"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-ghost" 
                        onClick={() => handleDeleteListing(item.id)}
                        style={{ padding: "6px 8px", borderColor: "var(--danger-muted)", color: "var(--text-muted)" }}
                        title="Delete record archive"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* TOAST WARNINGS / NOTIFICATION FLOATS */}
      {showToast && (
        <div 
          style={{ 
            position: "fixed", 
            bottom: 24, 
            right: 24, 
            background: "rgba(20,20,20,0.9)", 
            backdropFilter: "blur(10px)",
            border: `1px solid ${toastType === "success" ? "var(--success-muted)" : "var(--danger-muted)"}`, 
            color: "var(--text-primary)", 
            padding: "12px 20px", 
            borderRadius: 8, 
            display: "flex", 
            alignItems: "center", 
            gap: 8, 
            zIndex: 1000,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}
        >
          {toastType === "success" ? <CheckCircle2 size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
          <span style={{ fontSize: 13, fontWeight: 600 }}>{toastMsg}</span>
        </div>
      )}

      <style jsx global>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
