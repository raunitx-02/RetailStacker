"use client";
import React, { useState, useEffect } from "react";
import { Package, Truck, RefreshCw, X, CheckCircle, Info, Calendar, ArrowRight, ShieldAlert, DollarSign } from "lucide-react";
import confetti from "canvas-confetti";

interface Product {
  asin: string;
  name: string;
  sku: string;
  stock: number;
  velocity: number;
  daysLeft: number;
  reorderQty: number;
  leadTime: number;
  status: "Healthy" | "Low" | "Critical";
  unitCost: number;
}

interface Shipment {
  id: string;
  productName: string;
  asin: string;
  sku: string;
  quantity: number;
  shippingMode: "Air" | "Ocean" | "Express";
  shippingCost: number;
  totalCost: number;
  status: "Draft" | "In Transit" | "Arrived";
  createdAt: string;
  estimatedArrival: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  { asin: "B08XYZ1234", name: "Premium Bamboo Cutting Board", sku: "BBTB-001", stock: 384, velocity: 62, daysLeft: 6, reorderQty: 500, leadTime: 21, status: "Critical", unitCost: 350 },
  { asin: "B09ABC5678", name: "Stainless Steel Water Bottle", sku: "SSWB-032", stock: 91, velocity: 78, daysLeft: 1, reorderQty: 800, leadTime: 28, status: "Critical", unitCost: 220 },
  { asin: "B07DEF9012", name: "Silicone Kitchen Utensil Set", sku: "SKUS-007", stock: 214, velocity: 37, daysLeft: 5, reorderQty: 400, leadTime: 18, status: "Low", unitCost: 450 },
  { asin: "B0AGHI012", name: "Yoga Mat Non-Slip Extra Thick", sku: "YMNST-12", stock: 512, velocity: 33, daysLeft: 15, reorderQty: 300, leadTime: 35, status: "Healthy", unitCost: 650 },
  { asin: "B0CJKL345", name: "LED Desk Lamp with USB Charging", sku: "LDLU-045", stock: 23, velocity: 41, daysLeft: 0, reorderQty: 600, leadTime: 30, status: "Critical", unitCost: 800 },
  { asin: "B08MNO678", name: "Organic Shea Butter Body Lotion", sku: "OSBL-008", stock: 189, velocity: 28, daysLeft: 6, reorderQty: 350, leadTime: 14, status: "Low", unitCost: 190 },
  { asin: "B0DPQR901", name: "Ceramic Succulent Planter Set", sku: "CSPS-099", stock: 67, velocity: 19, daysLeft: 3, reorderQty: 200, leadTime: 45, status: "Low", unitCost: 280 },
];

const DEFAULT_SHIPMENTS: Shipment[] = [
  {
    id: "SH-88029",
    productName: "Premium Bamboo Cutting Board",
    asin: "B08XYZ1234",
    sku: "BBTB-001",
    quantity: 500,
    shippingMode: "Ocean",
    shippingCost: 8500,
    totalCost: 183500,
    status: "In Transit",
    createdAt: "May 10, 2026",
    estimatedArrival: "Jun 02, 2026",
  },
];

const statusStyle: Record<string, { badge: string; barColor: string }> = {
  Healthy: { badge: "badge-success", barColor: "var(--success)" },
  Low: { badge: "badge-warning", barColor: "var(--warning)" },
  Critical: { badge: "badge-danger", barColor: "var(--danger)" },
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  
  // Modals state
  const [activeReorderProduct, setActiveReorderProduct] = useState<Product | null>(null);
  
  // Reorder Form state
  const [reorderQty, setReorderQty] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [shippingMode, setShippingMode] = useState<"Air" | "Ocean" | "Express">("Ocean");
  const [shippingCost, setShippingCost] = useState(3000);
  const [leadTime, setLeadTime] = useState(21);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem("neon10_operations_inventory");
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(DEFAULT_PRODUCTS);
        localStorage.setItem("neon10_operations_inventory", JSON.stringify(DEFAULT_PRODUCTS));
      }

      const savedShipments = localStorage.getItem("neon10_operations_shipments");
      if (savedShipments) {
        setShipments(JSON.parse(savedShipments));
      } else {
        setShipments(DEFAULT_SHIPMENTS);
        localStorage.setItem("neon10_operations_shipments", JSON.stringify(DEFAULT_SHIPMENTS));
      }
    } catch (e) {
      console.error(e);
      setProducts(DEFAULT_PRODUCTS);
      setShipments(DEFAULT_SHIPMENTS);
    }
  }, []);

  const saveProductsToStorage = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem("neon10_operations_inventory", JSON.stringify(updated));
  };

  const saveShipmentsToStorage = (updated: Shipment[]) => {
    setShipments(updated);
    localStorage.setItem("neon10_operations_shipments", JSON.stringify(updated));
  };

  // Open Reorder Modal
  const openReorder = (p: Product) => {
    setActiveReorderProduct(p);
    setReorderQty(p.reorderQty);
    setUnitCost(p.unitCost);
    setLeadTime(p.leadTime);
    setShippingMode("Ocean");
    setShippingCost(p.reorderQty > 500 ? 5500 : 3000);
  };

  // Submit Reorder Form
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReorderProduct) return;

    const totalCost = (reorderQty * unitCost) + shippingCost;
    
    // Add pending shipment
    const arrivalDate = new Date();
    arrivalDate.setDate(arrivalDate.getDate() + leadTime);
    const formattedArrival = arrivalDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const formattedCreated = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    const newShipment: Shipment = {
      id: `SH-${Math.floor(10000 + Math.random() * 90000)}`,
      productName: activeReorderProduct.name,
      asin: activeReorderProduct.asin,
      sku: activeReorderProduct.sku,
      quantity: reorderQty,
      shippingMode,
      shippingCost,
      totalCost,
      status: "In Transit",
      createdAt: formattedCreated,
      estimatedArrival: formattedArrival,
    };

    // Update product stock levels or mark as incoming? Let's increase daysLeft or status to prevent restocking alert
    const updatedProducts = products.map(p => {
      if (p.asin === activeReorderProduct.asin) {
        // Boost stock and daysLeft to simulate standard ordering success
        const newStock = p.stock + reorderQty;
        const newDaysLeft = Math.ceil(newStock / p.velocity);
        return {
          ...p,
          stock: newStock,
          daysLeft: newDaysLeft,
          status: (newDaysLeft > 10 ? "Healthy" : newDaysLeft > 4 ? "Low" : "Critical") as Product["status"],
        };
      }
      return p;
    });

    saveProductsToStorage(updatedProducts as Product[]);
    saveShipmentsToStorage([newShipment, ...shipments]);
    setActiveReorderProduct(null);

    confetti({ particleCount: 60, spread: 40 });
  };

  // Reorder All Critical
  const handleReorderAllCritical = () => {
    const criticalItems = products.filter(p => p.status === "Critical");
    if (criticalItems.length === 0) {
      alert("No critical stockout threats detected!");
      return;
    }

    const newShipments: Shipment[] = [];
    const formattedCreated = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    const updatedProducts = products.map(p => {
      if (p.status === "Critical") {
        const cost = p.reorderQty > 500 ? 5500 : 3000;
        const arrivalDate = new Date();
        arrivalDate.setDate(arrivalDate.getDate() + p.leadTime);
        const formattedArrival = arrivalDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

        newShipments.push({
          id: `SH-${Math.floor(10000 + Math.random() * 90000)}`,
          productName: p.name,
          asin: p.asin,
          sku: p.sku,
          quantity: p.reorderQty,
          shippingMode: "Air",
          shippingCost: cost * 1.5, // Air cost multiplier
          totalCost: (p.reorderQty * p.unitCost) + (cost * 1.5),
          status: "In Transit",
          createdAt: formattedCreated,
          estimatedArrival: formattedArrival,
        });

        const newStock = p.stock + p.reorderQty;
        const newDaysLeft = Math.ceil(newStock / p.velocity);
        return {
          ...p,
          stock: newStock,
          daysLeft: newDaysLeft,
          status: (newDaysLeft > 10 ? "Healthy" : newDaysLeft > 4 ? "Low" : "Critical") as Product["status"],
        };
      }
      return p;
    });

    saveProductsToStorage(updatedProducts as Product[]);
    saveShipmentsToStorage([...newShipments, ...shipments]);

    confetti({ particleCount: 100, spread: 80, colors: ["#22c55e", "#ff6b35"] });
  };

  // Handle ship arrival
  const handleShipmentArrived = (id: string) => {
    const updatedShipments = shipments.map(s => {
      if (s.id === id) {
        return { ...s, status: "Arrived" as const };
      }
      return s;
    });
    saveShipmentsToStorage(updatedShipments);
    confetti({ particleCount: 30, spread: 30 });
  };

  // Delete/dismiss shipment log
  const handleDeleteShipment = (id: string) => {
    const updated = shipments.filter(s => s.id !== id);
    saveShipmentsToStorage(updated);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Forecast & Restocking</h1>
          <p className="page-subtitle">Predict inventory runouts, evaluate vendor lead times, and optimize active supply chain orders</p>
        </div>
        <button 
          className="btn-accent" 
          onClick={handleReorderAllCritical}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <ShieldAlert size={16} /> Reorder All Critical ({products.filter(p => p.status === "Critical").length})
        </button>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Tracked SKUs", value: products.length, color: "var(--text-secondary)" },
          { label: "Optimal Levels", value: products.filter(p => p.status === "Healthy").length, color: "var(--success)" },
          { label: "Low Inventory Warning", value: products.filter(p => p.status === "Low").length, color: "var(--warning)" },
          { label: "Severe Stockout Threats", value: products.filter(p => p.status === "Critical").length, color: "var(--danger)" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* PRODUCT LISTING TABLE */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Package size={18} color="var(--accent)" /> active Vendor Catalog & Forecasts
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>PRODUCT</th><th>SKU</th><th>FBA IN STOCK</th><th>DAILY VELOCITY</th>
                <th>RUNOUT TIMELINE</th><th>RECOMMENDED RESTOCK</th><th>LEAD TIME</th><th>STATUS</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.asin}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2 }}>{p.asin}</div>
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>{p.sku}</td>
                  <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p.stock.toLocaleString()} units</td>
                  <td style={{ color: "var(--text-secondary)" }}>{p.velocity} units/day</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar" style={{ width: 60, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${Math.min((p.daysLeft / 30) * 100, 100)}%`,
                          background: statusStyle[p.status].barColor,
                        }} />
                      </div>
                      <span style={{ fontWeight: 700, color: statusStyle[p.status].barColor }}>{p.daysLeft} days</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{p.reorderQty.toLocaleString()} units</td>
                  <td style={{ color: "var(--text-secondary)" }}>{p.leadTime} days</td>
                  <td><span className={`badge ${statusStyle[p.status].badge}`}>{p.status}</span></td>
                  <td>
                    <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => openReorder(p)}>Reorder</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTOCKING SHIPMENTS LOG */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Truck size={18} color="var(--accent)" /> Pending Restock Shipments & FBA Inbound Logs
        </h2>
        <div style={{ overflowX: "auto" }}>
          {shipments.length === 0 ? (
            <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 20px" }}>
              No active pending cargo shipments. Initiate a reorder above to establish supply chain trackings.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>SHIPMENT ID</th><th>PRODUCT DETAIL</th><th>QUANTITY</th><th>SHIPPING MODE</th>
                  <th>SHIPPING COST</th><th>TOTAL CAPITAL COST</th><th>EST. ARRIVAL</th><th>STATUS</th><th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent)" }}>{s.id}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{s.productName}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{s.asin} · {s.sku}</div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.quantity.toLocaleString()} units</td>
                    <td>
                      <span className="badge" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}>{s.shippingMode}</span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>₹{s.shippingCost.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: "var(--success)" }}>₹{s.totalCost.toLocaleString()}</td>
                    <td style={{ color: "var(--text-primary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                        <Calendar size={13} color="var(--text-muted)" /> {s.estimatedArrival}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${s.status === "Arrived" ? "badge-success" : "badge-warning"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        {s.status !== "Arrived" && (
                          <button 
                            className="btn-ghost" 
                            style={{ fontSize: 11, padding: "4px 8px", borderColor: "var(--success-muted)", color: "var(--success)" }}
                            onClick={() => handleShipmentArrived(s.id)}
                          >
                            Mark Arrived
                          </button>
                        )}
                        <button 
                          className="btn-ghost" 
                          style={{ fontSize: 11, padding: "4px 8px", borderColor: "var(--danger-muted)", color: "var(--text-muted)" }}
                          onClick={() => handleDeleteShipment(s.id)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* REORDER WIZARD DIALOG MODAL */}
      {activeReorderProduct && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div className="glass-card" style={{ width: 500, padding: 28, position: "relative" }}>
            <button 
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              onClick={() => setActiveReorderProduct(null)}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>Create FBA Restocking Order</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Establish an inbound restock shipment from supplier catalog.</p>

            <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Target Product</label>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{activeReorderProduct.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2 }}>{activeReorderProduct.asin} · {activeReorderProduct.sku}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Order Quantity (Units)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={reorderQty} 
                    onChange={e => setReorderQty(parseInt(e.target.value) || 0)} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Unit Purchase Cost (₹)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={unitCost} 
                    onChange={e => setUnitCost(parseFloat(e.target.value) || 0)} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Shipping Method</label>
                  <select 
                    className="input-field" 
                    value={shippingMode} 
                    onChange={e => {
                      const mode = e.target.value as "Air" | "Ocean" | "Express";
                      setShippingMode(mode);
                      if (mode === "Air") {
                        setShippingCost(reorderQty * 12);
                        setLeadTime(10);
                      } else if (mode === "Express") {
                        setShippingCost(reorderQty * 25);
                        setLeadTime(5);
                      } else {
                        setShippingCost(reorderQty * 6);
                        setLeadTime(activeReorderProduct.leadTime);
                      }
                    }}
                  >
                    <option value="Ocean">Ocean Cargo (Cost Effective)</option>
                    <option value="Air">Air Freight (Balanced)</option>
                    <option value="Express">Courier Express (Ultra Fast)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Shipping Freight Cost (₹)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={shippingCost} 
                    onChange={e => setShippingCost(parseFloat(e.target.value) || 0)} 
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Est. Transit Time (Days)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={leadTime} 
                  onChange={e => setLeadTime(parseInt(e.target.value) || 0)} 
                  required 
                />
              </div>

              <div style={{ background: "rgba(0,0,0,0.2)", padding: 14, borderRadius: 8, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Inbound Capital:</span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--success)" }}>₹{((reorderQty * unitCost) + shippingCost).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>FBA Stock Level:</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 4 }}>
                    {activeReorderProduct.stock} <ArrowRight size={12} /> {activeReorderProduct.stock + reorderQty} units
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setActiveReorderProduct(null)}>Cancel</button>
                <button type="submit" className="btn-accent" style={{ flex: 1 }}>Submit Inbound Shipment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

