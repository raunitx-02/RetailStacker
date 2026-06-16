"use client";
import React from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, RefreshCcw, ArrowUpRight, ArrowDownRight } from "lucide-react";

const revenueData = [
  { date: "Apr 14", revenue: 4200, profit: 1100 }, { date: "Apr 15", revenue: 5800, profit: 1600 },
  { date: "Apr 16", revenue: 4900, profit: 1300 }, { date: "Apr 17", revenue: 6700, profit: 2100 },
  { date: "Apr 18", revenue: 7200, profit: 2400 }, { date: "Apr 19", revenue: 5100, profit: 1500 },
  { date: "Apr 20", revenue: 5500, profit: 1700 }, { date: "Apr 21", revenue: 8100, profit: 2900 },
  { date: "Apr 22", revenue: 9200, profit: 3100 }, { date: "Apr 23", revenue: 7800, profit: 2500 },
  { date: "Apr 24", revenue: 8600, profit: 2900 }, { date: "Apr 25", revenue: 9800, profit: 3400 },
  { date: "Apr 26", revenue: 8200, profit: 2700 }, { date: "Apr 27", revenue: 10100, profit: 3600 },
  { date: "Apr 28", revenue: 11200, profit: 4000 }, { date: "Apr 29", revenue: 9700, profit: 3300 },
  { date: "Apr 30", revenue: 10500, profit: 3800 }, { date: "May 1", revenue: 12300, profit: 4500 },
  { date: "May 2", revenue: 11800, profit: 4200 }, { date: "May 3", revenue: 13100, profit: 4900 },
  { date: "May 4", revenue: 12500, profit: 4600 }, { date: "May 5", revenue: 14200, profit: 5300 },
  { date: "May 6", revenue: 13800, profit: 5100 }, { date: "May 7", revenue: 15100, profit: 5700 },
  { date: "May 8", revenue: 14600, profit: 5400 }, { date: "May 9", revenue: 16000, profit: 6100 },
  { date: "May 10", revenue: 15400, profit: 5800 }, { date: "May 11", revenue: 17200, profit: 6600 },
  { date: "May 12", revenue: 16800, profit: 6400 }, { date: "May 13", revenue: 18100, profit: 7000 },
];

const plData = [
  { name: "Revenue", value: 287400, color: "var(--accent)" },
  { name: "FBA Fees", value: 43200, color: "var(--danger)" },
  { name: "Ad Spend", value: 28900, color: "var(--warning)" },
  { name: "COGS", value: 86200, color: "var(--purple)" },
  { name: "Net Profit", value: 129100, color: "var(--success)" },
];

const topProducts = [
  { asin: "B08XYZ123", name: "Premium Bamboo Cutting Board Set", sales: 1842, revenue: "₹4,54,280", profit: "₹1,58,940", margin: "34.9%", trend: "up" },
  { asin: "B09ABC456", name: "Stainless Steel Water Bottle 32oz", sales: 2341, revenue: "₹3,42,180", profit: "₹1,14,720", margin: "34.9%", trend: "up" },
  { asin: "B07DEF789", name: "Silicone Kitchen Utensil Set (6pc)", sales: 1109, revenue: "₹2,38,820", profit: "₹82,310", margin: "31.7%", trend: "down" },
  { asin: "B0AGHI012", name: "Yoga Mat Non-Slip Extra Thick", sales: 987, revenue: "₹2,34,650", profit: "₹71,440", margin: "33.0%", trend: "up" },
  { asin: "B0CJKL345", name: "LED Desk Lamp with USB Charging", sales: 765, revenue: "₹1,29,840", profit: "₹49,680", margin: "32.4%", trend: "up" },
];

const stats = [
  { label: "Total Revenue", value: "₹24,87,400", change: "+24.8%", up: true, icon: DollarSign, color: "var(--accent)" },
  { label: "Net Profit", value: "₹8,29,100", change: "+31.2%", up: true, icon: TrendingUp, color: "var(--success)" },
  { label: "Total Orders", value: "7,044", change: "+18.6%", up: true, icon: ShoppingCart, color: "var(--blue)" },
  { label: "Units Sold", value: "9,218", change: "+21.3%", up: true, icon: Package, color: "var(--purple)" },
  { label: "Refunds", value: "142", change: "-8.4%", up: false, icon: RefreshCcw, color: "var(--danger)" },
  { label: "Profit Margin", value: "44.9%", change: "+4.2%", up: true, icon: TrendingUp, color: "var(--warning)" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(20px)" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 8 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
            {p.name}: ₹{p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = React.use(searchParams);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const roleCookie = typeof document !== "undefined" && document.cookie
      .split("; ")
      .find(row => row.startsWith("retailstacker_role="))
      ?.split("=")[1];
    if (roleCookie === "reseller") {
      window.location.href = "/reseller";
      return;
    }

    try {
      const connections = localStorage.getItem("retailstacker_connections");
      if (connections) {
        const parsed = JSON.parse(connections);
        if (parsed.amazonConnected || parsed.flipkartConnected || parsed.meeshoConnected || parsed.shopifyConnected) {
          setIsConnected(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div>
      {params.error === "upgrade_required" && (
        <div style={{ background: "var(--warning-muted)", border: "1px solid var(--warning)", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--warning)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontWeight: 800 }}>!</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--warning)", marginBottom: 2 }}>Upgrade Required</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>You need a higher plan tier to access this feature. Please upgrade your account to unlock this module.</div>
          </div>
        </div>
      )}
      
      {/* LIVE OR DEMO BANNER */}
      {!isConnected ? (
        <div style={{ background: "var(--blue-muted)", border: "1px solid var(--blue)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>📊</span>
            <div>
              <div style={{ fontWeight: 700, color: "var(--blue)", fontSize: 14 }}>Showing Sample / Demo Data</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Connect your Amazon, Flipkart, Meesho or Shopify seller account in Profile → Integrations to see your real sales data.</div>
            </div>
          </div>
          <a href="/profile" style={{ textDecoration: "none" }}><button className="btn-accent" style={{ fontSize: 13, whiteSpace: "nowrap" }}>Connect Account →</button></a>
        </div>
      ) : (
        <div style={{ background: "var(--success-muted)", border: "1px solid var(--success)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>🟢</span>
            <div>
              <div style={{ fontWeight: 700, color: "var(--success)", fontSize: 14 }}>Live Synchronization Active</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Currently streaming live inventory statistics, transaction feeds, and PPC campaign logs from connected seller API integrations.</div>
            </div>
          </div>
          <button className="btn-ghost" style={{ fontSize: 13, borderColor: "var(--success)", color: "var(--success)", whiteSpace: "nowrap" }} onClick={() => window.location.reload()}>Sync Now</button>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Profits Dashboard</h1>
          <p className="page-subtitle">Your business health at a glance — Last 30 days</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select className="input-field" style={{ width: "auto", cursor: "pointer" }}>
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
          <button className="btn-accent">Export Report</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{s.value}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                  {s.up ? <ArrowUpRight size={14} color="var(--success)" /> : <ArrowDownRight size={14} color="var(--danger)" />}
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.up ? "var(--success)" : "var(--danger)" }}>{s.change}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>vs last period</span>
                </div>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--bg-secondary)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* Revenue Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Revenue & Profit Trend</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>Daily breakdown for the last 30 days</p>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--accent)", display: "inline-block" }} />Revenue
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--success)", display: "inline-block" }} />Profit
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} fill="url(#colorRev)" name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="var(--success)" strokeWidth={2} fill="url(#colorProfit)" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* P&L Breakdown */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>P&L Breakdown</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 20 }}>This month's financials</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {plData.map((item) => (
              <div key={item.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{item.name}</span>
                  <span style={{ fontSize: 13, color: item.color, fontWeight: 700 }}>₹{item.value.toLocaleString()}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{
                    width: `${(item.value / 287400) * 100}%`,
                    background: item.color,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Top Performing Products</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>Ranked by net profit this period</p>
          </div>
          <button className="btn-ghost" style={{ fontSize: 13 }}>View All Products →</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>ASIN</th>
                <th>UNITS SOLD</th>
                <th>REVENUE</th>
                <th>NET PROFIT</th>
                <th>MARGIN</th>
                <th>TREND</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.asin}>
                  <td style={{ maxWidth: 220 }}>
                    <span style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 13, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                  </td>
                  <td><span style={{ fontFamily: "monospace", color: "var(--text-muted)", fontSize: 12 }}>{p.asin}</span></td>
                  <td style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{p.sales.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p.revenue}</td>
                  <td style={{ fontWeight: 700, color: "var(--success)" }}>{p.profit}</td>
                  <td>
                    <span className="badge badge-success">{p.margin}</span>
                  </td>
                  <td>
                    {p.trend === "up"
                      ? <ArrowUpRight size={16} color="var(--success)" />
                      : <ArrowDownRight size={16} color="var(--danger)" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
