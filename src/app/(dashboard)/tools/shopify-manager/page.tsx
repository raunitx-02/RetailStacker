"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ShoppingBag, Package, BarChart3, Boxes, Settings2, RefreshCw,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ExternalLink, AlertTriangle, CheckCircle, Link2, Search, X,
  DollarSign, ShoppingCart, Users, Eye, Zap, Activity
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */
interface ShopifyProduct {
  id: number;
  title: string;
  status: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  variants: { id: number; price: string; inventory_quantity: number; sku: string }[];
  image: { src: string } | null;
  images: { src: string }[];
}

interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  line_items: { title: string; quantity: number; price: string }[];
}

interface ShopifyShop {
  name: string;
  email: string;
  domain: string;
  myshopify_domain: string;
  currency: string;
  country_name: string;
  plan_name: string;
  created_at: string;
}

type Tab = "overview" | "products" | "orders" | "inventory" | "settings";

/* ─── Demo data (shown when not connected) ───────────────────── */
const DEMO_PRODUCTS: ShopifyProduct[] = [
  { id: 1, title: "Handcrafted Bamboo Desk Organizer", status: "active", vendor: "EcoHome Studio", product_type: "Home & Office", created_at: "2026-04-01T10:00:00Z", updated_at: "2026-05-20T10:00:00Z", variants: [{ id: 101, price: "1499.00", inventory_quantity: 142, sku: "BADO-001" }], image: null, images: [] },
  { id: 2, title: "Organic Lavender Body Scrub 200g", status: "active", vendor: "Bloom Beauty", product_type: "Beauty", created_at: "2026-03-15T10:00:00Z", updated_at: "2026-05-18T10:00:00Z", variants: [{ id: 201, price: "699.00", inventory_quantity: 89, sku: "OLBS-200" }], image: null, images: [] },
  { id: 3, title: "Minimalist Leather Wallet - Slim", status: "active", vendor: "CraftCo", product_type: "Accessories", created_at: "2026-02-10T10:00:00Z", updated_at: "2026-05-15T10:00:00Z", variants: [{ id: 301, price: "1999.00", inventory_quantity: 56, sku: "MLW-SLIM" }], image: null, images: [] },
  { id: 4, title: "Ceramic Pour-Over Coffee Set", status: "draft", vendor: "BrewMaster", product_type: "Kitchen", created_at: "2026-05-01T10:00:00Z", updated_at: "2026-05-22T10:00:00Z", variants: [{ id: 401, price: "2499.00", inventory_quantity: 23, sku: "CPOC-SET" }], image: null, images: [] },
  { id: 5, title: "Yoga Mat with Alignment Lines", status: "active", vendor: "ZenFit", product_type: "Sports", created_at: "2026-01-20T10:00:00Z", updated_at: "2026-05-10T10:00:00Z", variants: [{ id: 501, price: "2199.00", inventory_quantity: 198, sku: "YM-ALIGN" }], image: null, images: [] },
];

const DEMO_ORDERS: ShopifyOrder[] = [
  { id: 5001, name: "#1001", email: "customer@example.com", created_at: "2026-05-25T14:22:00Z", financial_status: "paid", fulfillment_status: "fulfilled", total_price: "4498.00", currency: "INR", line_items: [{ title: "Handcrafted Bamboo Desk Organizer", quantity: 2, price: "1499.00" }, { title: "Organic Lavender Body Scrub 200g", quantity: 2, price: "699.00" }] },
  { id: 5002, name: "#1002", email: "buyer2@example.com", created_at: "2026-05-25T11:05:00Z", financial_status: "paid", fulfillment_status: null, total_price: "1999.00", currency: "INR", line_items: [{ title: "Minimalist Leather Wallet - Slim", quantity: 1, price: "1999.00" }] },
  { id: 5003, name: "#1003", email: "buyer3@example.com", created_at: "2026-05-24T09:30:00Z", financial_status: "pending", fulfillment_status: null, total_price: "2499.00", currency: "INR", line_items: [{ title: "Ceramic Pour-Over Coffee Set", quantity: 1, price: "2499.00" }] },
  { id: 5004, name: "#1004", email: "buyer4@example.com", created_at: "2026-05-23T16:45:00Z", financial_status: "paid", fulfillment_status: "fulfilled", total_price: "6597.00", currency: "INR", line_items: [{ title: "Yoga Mat with Alignment Lines", quantity: 3, price: "2199.00" }] },
  { id: 5005, name: "#1005", email: "buyer5@example.com", created_at: "2026-05-22T13:20:00Z", financial_status: "refunded", fulfillment_status: "fulfilled", total_price: "1499.00", currency: "INR", line_items: [{ title: "Handcrafted Bamboo Desk Organizer", quantity: 1, price: "1499.00" }] },
];

const DEMO_SHOP: ShopifyShop = {
  name: "My Shopify Store",
  email: "owner@mystore.com",
  domain: "mystore.com",
  myshopify_domain: "mystore.myshopify.com",
  currency: "INR",
  country_name: "India",
  plan_name: "Basic Shopify",
  created_at: "2024-01-15T00:00:00Z",
};

/* ─── Sub-components ─────────────────────────────────────────── */
function StatCard({ label, value, change, up, icon: Icon, color }: { label: string; value: string; change: string; up: boolean; icon: any; color: string }) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{value}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
            {up ? <ArrowUpRight size={13} color="var(--success)" /> : <ArrowDownRight size={13} color="var(--danger)" />}
            <span style={{ fontSize: 12, fontWeight: 600, color: up ? "var(--success)" : "var(--danger)" }}>{change}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>vs last month</span>
          </div>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || "";
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: "var(--success-muted)", color: "var(--success)", label: "Active" },
    draft: { bg: "var(--warning-muted)", color: "var(--warning)", label: "Draft" },
    archived: { bg: "var(--border)", color: "var(--text-muted)", label: "Archived" },
    paid: { bg: "var(--success-muted)", color: "var(--success)", label: "Paid" },
    pending: { bg: "var(--warning-muted)", color: "var(--warning)", label: "Pending" },
    refunded: { bg: "var(--danger-muted)", color: "var(--danger)", label: "Refunded" },
    fulfilled: { bg: "var(--success-muted)", color: "var(--success)", label: "Fulfilled" },
    unfulfilled: { bg: "var(--warning-muted)", color: "var(--warning)", label: "Unfulfilled" },
  };
  const c = cfg[s] || { bg: "var(--bg-secondary)", color: "var(--text-muted)", label: status };
  return (
    <span style={{ background: c.bg, color: c.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{c.label}</span>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function ShopifyManagerPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [shopInfo, setShopInfo] = useState<ShopifyShop>(DEMO_SHOP);
  const [products, setProducts] = useState<ShopifyProduct[]>(DEMO_PRODUCTS);
  const [orders, setOrders] = useState<ShopifyOrder[]>(DEMO_ORDERS);
  const [credentials, setCredentials] = useState<{ shop: string; accessToken: string } | null>(null);
  const [search, setSearch] = useState("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done">("idle");

  useEffect(() => {
    try {
      const savedConn = localStorage.getItem("neon10_connections");
      const savedKeys = localStorage.getItem("neon10_api_keys_v2");
      if (savedConn && savedKeys) {
        const conn = JSON.parse(savedConn);
        const keys = JSON.parse(savedKeys);
        if (conn.shopify && keys.shopify?.shopDomain && keys.shopify?.accessToken) {
          setIsConnected(true);
          setCredentials({ shop: keys.shopify.shopDomain, accessToken: keys.shopify.accessToken });
        }
      }
    } catch (e) {}
  }, []);

  const fetchShopifyData = useCallback(async (resource: string, params?: Record<string, string>) => {
    if (!credentials) return null;
    const res = await fetch("/api/shopify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource, shop: credentials.shop, accessToken: credentials.accessToken, params }),
    });
    if (!res.ok) return null;
    return res.json();
  }, [credentials]);

  const handleSync = async () => {
    setSyncStatus("syncing");
    if (credentials) {
      const [shopData, productsData, ordersData] = await Promise.all([
        fetchShopifyData("shop"),
        fetchShopifyData("products", { limit: "50" }),
        fetchShopifyData("orders", { limit: "50", status: "any" }),
      ]);
      if (shopData?.shop) setShopInfo(shopData.shop);
      if (productsData?.products) setProducts(productsData.products);
      if (ordersData?.orders) setOrders(ordersData.orders);
    }
    setSyncStatus("done");
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  // Summary stats
  const totalRevenue = orders.filter(o => o.financial_status === "paid").reduce((s, o) => s + parseFloat(o.total_price), 0);
  const activeProducts = products.filter(p => p.status === "active").length;
  const pendingOrders = orders.filter(o => o.fulfillment_status !== "fulfilled").length;
  const totalInventory = products.reduce((s, p) => s + p.variants.reduce((vs, v) => vs + v.inventory_quantity, 0), 0);

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.vendor.toLowerCase().includes(search.toLowerCase()));
  const filteredOrders = orders.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase()));

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "📊 Overview", icon: BarChart3 },
    { id: "products", label: "📦 Products", icon: Package },
    { id: "orders", label: "🛒 Orders", icon: ShoppingCart },
    { id: "inventory", label: "🏪 Inventory", icon: Boxes },
    { id: "settings", label: "⚙️ Settings", icon: Settings2 },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(94,142,62,0.12)", border: "1px solid rgba(94,142,62,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image src="/shopify-logo.png" alt="Shopify" width={32} height={32} style={{ objectFit: "contain" }} unoptimized />
          </div>
          <div>
            <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              Shopify Store Manager
              {isConnected && <span style={{ fontSize: 12, background: "var(--success-muted)", color: "var(--success)", padding: "3px 10px", borderRadius: 20, fontWeight: 700, marginLeft: 8 }}>● Live Connected</span>}
              {!isConnected && <span style={{ fontSize: 12, background: "var(--warning-muted)", color: "var(--warning)", padding: "3px 10px", borderRadius: 20, fontWeight: 700, marginLeft: 8 }}>Demo Mode</span>}
            </h1>
            <p className="page-subtitle">
              {isConnected ? `Syncing live data from ${credentials?.shop}` : "Connect your Shopify store in Profile → Integrations to view live data"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {!isConnected && (
            <a href="/profile" style={{ textDecoration: "none" }}>
              <button className="btn-accent" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Link2 size={15} /> Connect Shopify Store
              </button>
            </a>
          )}
          {isConnected && (
            <button onClick={handleSync} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8 }} disabled={syncStatus === "syncing"}>
              <RefreshCw size={15} style={{ animation: syncStatus === "syncing" ? "spin 1s linear infinite" : "none" }} />
              {syncStatus === "syncing" ? "Syncing..." : syncStatus === "done" ? "✓ Synced!" : "Sync Now"}
            </button>
          )}
        </div>
      </div>

      {/* Demo notice */}
      {!isConnected && (
        <div style={{ background: "var(--blue-muted)", border: "1px solid var(--blue)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <Eye size={20} color="var(--blue)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: "var(--blue)", fontSize: 13 }}>Viewing Demo Data</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              This is sample data to preview the Shopify Store Manager. <a href="/profile" style={{ color: "var(--blue)", fontWeight: 700 }}>Connect your Shopify store</a> to see your real products, orders, and inventory.
            </div>
          </div>
        </div>
      )}

      {/* Store info bar */}
      <div className="glass-card" style={{ padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Store Name</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{shopInfo.name}</div>
          </div>
          <div style={{ width: 1, height: 32, background: "var(--border)" }} />
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Domain</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", fontFamily: "monospace" }}>{shopInfo.myshopify_domain}</div>
          </div>
          <div style={{ width: 1, height: 32, background: "var(--border)" }} />
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Currency</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)" }}>{shopInfo.currency}</div>
          </div>
          <div style={{ width: 1, height: 32, background: "var(--border)" }} />
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Plan</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#5E8E3E" }}>{shopInfo.plan_name}</div>
          </div>
        </div>
        <a href={`https://${shopInfo.myshopify_domain}/admin`} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <ExternalLink size={13} /> Open Admin
        </a>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", gap: 4, marginBottom: 24, overflowX: "auto" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: "none", border: "none",
              borderBottom: activeTab === t.id ? "3px solid #5E8E3E" : "3px solid transparent",
              padding: "12px 18px", color: activeTab === t.id ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: activeTab === t.id ? 800 : 500, fontSize: 14, cursor: "pointer",
              whiteSpace: "nowrap", transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {activeTab === "overview" && (
        <div>
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change="+18.4%" up icon={DollarSign} color="var(--success)" />
            <StatCard label="Active Products" value={String(activeProducts)} change={`+${products.length - activeProducts} drafts`} up icon={Package} color="var(--accent)" />
            <StatCard label="Pending Orders" value={String(pendingOrders)} change="-12.3%" up={false} icon={ShoppingCart} color="var(--warning)" />
            <StatCard label="Total Inventory" value={totalInventory.toLocaleString("en-IN")} change="+5.6%" up icon={Boxes} color="var(--purple)" />
          </div>

          {/* Recent Orders + Top Products */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Recent Orders</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--bg-primary)", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{o.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(o.created_at).toLocaleDateString("en-IN")}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--success)" }}>₹{parseFloat(o.total_price).toLocaleString("en-IN")}</div>
                      <StatusBadge status={o.financial_status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Product Status Overview</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Active Products", value: activeProducts, total: products.length, color: "var(--success)" },
                  { label: "Draft Products", value: products.filter(p => p.status === "draft").length, total: products.length, color: "var(--warning)" },
                  { label: "Orders Fulfilled", value: orders.filter(o => o.fulfillment_status === "fulfilled").length, total: orders.length, color: "var(--accent)" },
                  { label: "Revenue Collected", value: orders.filter(o => o.financial_status === "paid").length, total: orders.length, color: "var(--purple)" },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                      <span style={{ fontWeight: 700 }}>{item.value}/{item.total}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${(item.value / item.total) * 100}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: PRODUCTS ── */}
      {activeTab === "products" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: 16 }}>Product Catalog</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{filteredProducts.length} products</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", width: 260 }}>
              <Search size={14} color="var(--text-muted)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", width: "100%", fontFamily: "inherit" }} />
              {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={14} /></button>}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>Product</th>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>Type</th>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>Price</th>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>Inventory</th>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>SKU</th>
                  <th style={{ padding: "10px 12px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const variant = p.variants[0];
                  const imgSrc = p.image?.src || p.images?.[0]?.src;
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border)", fontSize: 13, transition: "background 0.15s" }} className="hover-row">
                      <td style={{ padding: "14px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 6, background: "rgba(94,142,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                            {imgSrc
                              ? <img src={imgSrc} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <Package size={18} color="#5E8E3E" />
                            }
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.vendor}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 12px", color: "var(--text-secondary)" }}>{p.product_type || "—"}</td>
                      <td style={{ padding: "14px 12px", fontWeight: 700, color: "var(--success)" }}>₹{parseFloat(variant?.price || "0").toLocaleString("en-IN")}</td>
                      <td style={{ padding: "14px 12px" }}>
                        <span style={{ fontWeight: 600, color: (variant?.inventory_quantity || 0) < 20 ? "var(--warning)" : "var(--text-primary)" }}>
                          {variant?.inventory_quantity ?? 0} units
                        </span>
                        {(variant?.inventory_quantity || 0) < 20 && (
                          <span style={{ marginLeft: 6, fontSize: 10, color: "var(--warning)" }}>⚠ Low</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 12px" }}><StatusBadge status={p.status} /></td>
                      <td style={{ padding: "14px 12px", fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>{variant?.sku || "—"}</td>
                      <td style={{ padding: "14px 12px", textAlign: "right" }}>
                        {credentials && (
                          <a href={`https://${credentials.shop}/admin/products/${p.id}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)" }}>
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: ORDERS ── */}
      {activeTab === "orders" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: 16 }}>Orders</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{filteredOrders.length} total orders</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", width: 260 }}>
              <Search size={14} color="var(--text-muted)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", width: "100%", fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredOrders.map(o => (
              <div key={o.id} className="glass-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{o.name}</span>
                      <StatusBadge status={o.financial_status} />
                      <StatusBadge status={o.fulfillment_status || "unfulfilled"} />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.email} · {new Date(o.created_at).toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "var(--success)" }}>₹{parseFloat(o.total_price).toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{o.currency}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {o.line_items.map((item, i) => (
                    <span key={i} style={{ fontSize: 11, background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                      {item.quantity}× {item.title} · ₹{parseFloat(item.price).toLocaleString("en-IN")}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: INVENTORY ── */}
      {activeTab === "inventory" && (
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Inventory Status</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Stock levels across all active products. Products with less than 20 units are flagged.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {products.map(p => {
              const variant = p.variants[0];
              const qty = variant?.inventory_quantity ?? 0;
              const isLow = qty < 20;
              const isCritical = qty < 5;
              return (
                <div key={p.id} className="glass-card" style={{ padding: 16, border: `1px solid ${isCritical ? "var(--danger)" : isLow ? "var(--warning)" : "var(--border)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, flex: 1, paddingRight: 8 }}>{p.title}</div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>SKU: {variant?.sku || "N/A"} · Vendor: {p.vendor}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>In Stock</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: isCritical ? "var(--danger)" : isLow ? "var(--warning)" : "var(--success)" }}>{qty}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Unit Price</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>₹{parseFloat(variant?.price || "0").toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginTop: 10 }}>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{
                        width: `${Math.min(100, (qty / 200) * 100)}%`,
                        background: isCritical ? "var(--danger)" : isLow ? "var(--warning)" : "var(--success)"
                      }} />
                    </div>
                    {(isLow || isCritical) && (
                      <div style={{ fontSize: 11, color: isCritical ? "var(--danger)" : "var(--warning)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <AlertTriangle size={11} /> {isCritical ? "Critical! Restock immediately" : "Low stock — consider reordering"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: SETTINGS ── */}
      {activeTab === "settings" && (
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Shopify Connection Settings</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Manage your Shopify store credentials and sync preferences.</p>

          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <Image src="/shopify-logo.png" alt="Shopify" width={20} height={20} unoptimized style={{ objectFit: "contain" }} />
              Store Connection
            </div>

            {isConnected ? (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <div style={{ background: "var(--bg-secondary)", padding: 14, borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 4 }}>STORE DOMAIN</div>
                    <div style={{ fontFamily: "monospace", fontSize: 13, color: "var(--text-primary)" }}>{credentials?.shop}</div>
                  </div>
                  <div style={{ background: "var(--bg-secondary)", padding: 14, borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 4 }}>ACCESS TOKEN</div>
                    <div style={{ fontFamily: "monospace", fontSize: 13, color: "var(--text-muted)" }}>shpat_••••••••••••••••</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleSync} className="btn-accent" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <RefreshCw size={14} /> Sync Data Now
                  </button>
                  <a href="/profile" className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", padding: "8px 16px", borderRadius: 8, fontSize: 14 }}>
                    <Settings2 size={14} /> Manage Credentials
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ padding: 20, background: "rgba(94,142,62,0.06)", border: "1px solid rgba(94,142,62,0.2)", borderRadius: 10, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: "#5E8E3E", marginBottom: 8 }}>🔗 How to Connect Shopify</div>
                  <ol style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: 18 }}>
                    <li>Go to your Shopify Admin → Settings → Apps and Sales Channels</li>
                    <li>Click "Develop apps" → "Create an app" → Name it "Neon 10"</li>
                    <li>Under API Credentials, configure Admin API scopes: products, orders, inventory</li>
                    <li>Click "Install App" and copy the Admin API Access Token</li>
                    <li>Go to Profile → Integrations → Shopify Store and enter your credentials</li>
                  </ol>
                </div>
                <a href="/profile" style={{ textDecoration: "none" }}>
                  <button className="btn-accent" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Link2 size={14} /> Connect Shopify Store
                  </button>
                </a>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Sync Configuration</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Auto-sync Products", desc: "Automatically sync product catalog every 6 hours", enabled: isConnected },
                { label: "Order Notifications", desc: "Get alerts when new orders come in from Shopify", enabled: isConnected },
                { label: "Inventory Alerts", desc: "Get warned when inventory drops below threshold", enabled: isConnected },
                { label: "Revenue Analytics", desc: "Sync Shopify revenue data to main dashboard", enabled: false },
              ].map(opt => (
                <div key={opt.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  <div style={{ width: 44, height: 24, borderRadius: 12, background: opt.enabled ? "#5E8E3E" : "var(--border)", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 2, left: opt.enabled ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
