"use client";
import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, ShieldAlert, Sparkles, HelpCircle, Save, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface ProtectedProduct {
  asin: string;
  name: string;
  maxQty: number;
  enabled: boolean;
  activeCoupons: number;
  riskScore: "Low" | "Medium" | "High";
}

const DEFAULT_PROTECTED_PRODUCTS: ProtectedProduct[] = [
  { asin: "B08XYZ1234", name: "Premium Bamboo Cutting Board", maxQty: 2, enabled: true, activeCoupons: 1, riskScore: "Low" },
  { asin: "B09ABC5678", name: "Stainless Steel Water Bottle", maxQty: 3, enabled: true, activeCoupons: 2, riskScore: "Medium" },
  { asin: "B07DEF9012", name: "Silicone Kitchen Utensil Set", maxQty: 1, enabled: false, activeCoupons: 0, riskScore: "Low" },
  { asin: "B0AGHI012", name: "Yoga Mat Non-Slip Extra Thick", maxQty: 2, enabled: true, activeCoupons: 3, riskScore: "High" },
  { asin: "B0CJKL345", name: "LED Desk Lamp with USB Charging", maxQty: 5, enabled: false, activeCoupons: 1, riskScore: "Medium" },
  { asin: "B08MNO678", name: "Organic Shea Butter Body Lotion", maxQty: 2, enabled: true, activeCoupons: 0, riskScore: "Low" },
];

export default function InventoryProtectorPage() {
  const [products, setProducts] = useState<ProtectedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalProtection, setGlobalProtection] = useState(true);
  const [showToast, setShowToast] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("retailstacker_inventory_protector");
      if (saved) {
        setProducts(JSON.parse(saved));
      } else {
        setProducts(DEFAULT_PROTECTED_PRODUCTS);
        localStorage.setItem("retailstacker_inventory_protector", JSON.stringify(DEFAULT_PROTECTED_PRODUCTS));
      }

      const savedGlobal = localStorage.getItem("retailstacker_global_coupon_protection");
      if (savedGlobal) {
        setGlobalProtection(JSON.parse(savedGlobal));
      }
    } catch (e) {
      console.error(e);
      setProducts(DEFAULT_PROTECTED_PRODUCTS);
    }
  }, []);

  const handleToggle = (asin: string) => {
    const updated = products.map(p => {
      if (p.asin === asin) {
        const nextEnabled = !p.enabled;
        return {
          ...p,
          enabled: nextEnabled,
          riskScore: nextEnabled ? "Low" as const : (p.activeCoupons > 1 ? "High" as const : "Medium" as const),
        };
      }
      return p;
    });
    setProducts(updated);
  };

  const handleUpdateQty = (asin: string, val: number) => {
    const updated = products.map(p => p.asin === asin ? { ...p, maxQty: Math.max(1, Math.min(val, 99)) } : p);
    setProducts(updated);
  };

  const handleSaveAll = () => {
    localStorage.setItem("retailstacker_inventory_protector", JSON.stringify(products));
    localStorage.setItem("retailstacker_global_coupon_protection", JSON.stringify(globalProtection));
    
    // Show validation toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Dynamic celebration effect
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#ff6b35", "#22c55e", "#3b82f6"]
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.asin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Coupon Protector</h1>
          <p className="page-subtitle">Configure customer-side order constraints to secure coupon stacking vulnerabilities during promotions</p>
        </div>
        <button 
          className="btn-accent" 
          onClick={handleSaveAll}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Save size={15} /> Save All Settings
        </button>
      </div>

      {/* RISKS & EDUCATION HERO CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 24, background: "rgba(255,107,53,0.03)", border: "1px solid var(--accent-muted)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--accent)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={18} /> Anti-Coupon Stacking Protection Active
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
            Bad actors and malicious competitor syndicates often seek out stacking promos (e.g. blending a 20% coupon with a 30% discount deal) to buy out entire supplier FBA storage capacities at negative margins. Defining customer order restrictions programmatically blocks automated cart bots while retaining standard consumer conversion.
          </p>
        </div>
        
        <div className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Global Shield</span>
              <span className={`badge ${globalProtection ? "badge-success" : "badge-danger"}`}>{globalProtection ? "Armed" : "Disabled"}</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
              Instantly enforce per-customer constraints across all active listings if catalog stack danger is identified.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <label className="toggle">
              <input type="checkbox" checked={globalProtection} onChange={e => setGlobalProtection(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Force Limit System</span>
          </div>
        </div>
      </div>

      {/* FILTER SEARCH AND CONTROLS */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 20, display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Search ASIN, SKU or Product Name..." 
            className="input-field" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 40, width: "100%" }}
          />
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Showing <strong>{filteredProducts.length}</strong> of {products.length} products
        </div>
      </div>

      {/* LISTINGS CONTROLLERS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredProducts.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            No products match your search query. Try typing another ASIN or brand name.
          </div>
        ) : (
          filteredProducts.map(p => (
            <div 
              key={p.asin} 
              className="glass-card" 
              style={{ 
                padding: 20, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                gap: 20,
                borderLeft: `4px solid ${p.enabled ? "var(--success)" : "var(--danger)"}`,
                transition: "all 0.2s"
              }}
            >
              {/* Product Info */}
              <div style={{ flex: 2 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>ASIN: {p.asin}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>·</span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                    Active Coupons: <strong style={{ color: p.activeCoupons > 0 ? "var(--accent)" : "var(--text-muted)" }}>{p.activeCoupons}</strong>
                  </span>
                </div>
              </div>

              {/* Risk Level Badge */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>STACK RISK</div>
                <span className={`badge ${p.riskScore === "High" ? "badge-danger" : p.riskScore === "Medium" ? "badge-warning" : "badge-success"}`}>
                  {p.riskScore} Risk
                </span>
              </div>

              {/* Order limits config */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Max Customer Qty:</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={p.maxQty}
                  onChange={e => handleUpdateQty(p.asin, parseInt(e.target.value) || 1)}
                  className="input-field"
                  style={{ 
                    width: 70, 
                    textAlign: "center", 
                    fontWeight: 700, 
                    fontSize: 15, 
                    opacity: p.enabled ? 1 : 0.4,
                    borderColor: p.enabled ? "var(--accent)" : "var(--border)"
                  }}
                  disabled={!p.enabled}
                />
              </div>

              {/* Toggle Protection Switch */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: p.enabled ? "var(--success)" : "var(--text-muted)" }}>
                  {p.enabled ? "Shield Armed" : "Shield Disabled"}
                </span>
                <label className="toggle">
                  <input type="checkbox" checked={p.enabled} onChange={() => handleToggle(p.asin)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FLOATING SUCCESS TOAST NOTIFICATION */}
      {showToast && (
        <div 
          style={{ 
            position: "fixed", 
            bottom: 24, 
            right: 24, 
            background: "rgba(20,20,20,0.9)", 
            backdropFilter: "blur(10px)",
            border: "1px solid var(--success-muted)", 
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
          <CheckCircle size={16} color="var(--success)" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Shield configuration saved successfully!</span>
        </div>
      )}
    </div>
  );
}
