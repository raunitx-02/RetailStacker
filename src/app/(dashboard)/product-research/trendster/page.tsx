"use client";
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, AlertTriangle, Info, Calendar, Sparkles, DollarSign, Search, Award } from "lucide-react";
import { parseKeepaCsv, KEEPA_INDICES } from "@/lib/keepaUtils";
import confetti from "canvas-confetti";

interface TrendPoint {
  date: string;
  bsr: number;
  price: number;
}

interface Insight {
  label: string;
  value: string;
  color: string;
  icon: string;
}

const DEFAULT_INSIGHTS: Insight[] = [
  { label: "Peak Sales Season", value: "Nov – Dec", color: "var(--success)", icon: "🎯" },
  { label: "Off-Season Trend", value: "Jan – Mar", color: "var(--danger)", icon: "📉" },
  { label: "Avg Monthly BSR", value: "#4,812", color: "var(--blue)", icon: "📊" },
  { label: "Price Volatility", value: "Low (±₹140)", color: "var(--warning)", icon: "💰" },
];

const MOCK_HISTORICAL_DATA: TrendPoint[] = [
  { date: "Jun 25", bsr: 8200, price: 2499 },
  { date: "Jul 25", bsr: 6100, price: 2399 },
  { date: "Aug 25", bsr: 4800, price: 2499 },
  { date: "Sep 25", bsr: 9200, price: 2199 },
  { date: "Oct 25", bsr: 5100, price: 2499 },
  { date: "Nov 25", bsr: 1200, price: 1999 },
  { date: "Dec 25", bsr: 800, price: 1899 },
  { date: "Jan 26", bsr: 7400, price: 2499 },
  { date: "Feb 26", bsr: 9800, price: 2599 },
  { date: "Mar 26", bsr: 8100, price: 2399 },
  { date: "Apr 26", bsr: 6200, price: 2499 },
  { date: "May 26", bsr: 3400, price: 2499 },
];

export default function TrendsterPage() {
  const [asin, setAsin] = useState("B08XYZ1234");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [chartData, setChartData] = useState<TrendPoint[]>([]);
  const [insights, setInsights] = useState<Insight[]>(DEFAULT_INSIGHTS);
  const [isLive, setIsLive] = useState(false);

  const fetchTrends = async (searchAsin: string) => {
    if (!searchAsin.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/amazon/keepa?asin=${searchAsin.toUpperCase().trim()}`);
      
      // If Keepa API is unavailable or quota exceeded, fall back gracefully
      if (!res.ok) {
        setErrorMsg("Keepa API unavailable — showing simulation data.");
        generateSeedData(searchAsin);
        setSearched(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      
      // If Keepa returned an explicit error, fall back silently
      if (data.error) {
        setErrorMsg(`Keepa: ${data.error} — showing simulation data.`);
        generateSeedData(searchAsin);
        setSearched(true);
        setLoading(false);
        return;
      }

      // If Keepa returned mock or actual product
      if (data.csv) {
        const bsrCsv = data.csv[KEEPA_INDICES.SALES_RANK];
        const priceCsv = data.csv[KEEPA_INDICES.BUY_BOX] || data.csv[KEEPA_INDICES.AMAZON_PRICE] || data.csv[KEEPA_INDICES.NEW_PRICE];
        
        // Parse BSR and Price points
        const parsedBsrs = parseKeepaCsv(bsrCsv, 1);
        // Keepa pricing format divides by 100 for USD, but for INR it might be scale 1 or 100 depending on marketplace settings.
        // Let's divide standard values by 100 if they look extremely large (e.g. standard product costing 2499 INR being returned as 249900).
        const parsedPrices = parseKeepaCsv(priceCsv, 1);

        if (parsedBsrs.length > 0) {
          // Merge by mapping date key
          const merged: Record<string, TrendPoint> = {};
          
          parsedBsrs.forEach(pt => {
            merged[pt.date] = {
              date: pt.date,
              bsr: Math.round(pt.value),
              price: 0
            };
          });

          parsedPrices.forEach(pt => {
            // Keepa prices can be represented scaled by 100.
            const rawVal = pt.value;
            const normalizedPrice = rawVal > 100000 ? rawVal / 100 : rawVal;

            if (merged[pt.date]) {
              merged[pt.date].price = Math.round(normalizedPrice);
            } else {
              merged[pt.date] = {
                date: pt.date,
                bsr: 5000, // Default baseline if not present
                price: Math.round(normalizedPrice)
              };
            }
          });

          const finalPoints = Object.values(merged).slice(-15);
          setChartData(finalPoints);
          setIsLive(true);

          // Calculate Dynamic Insights
          const prices = finalPoints.map(p => p.price).filter(p => p > 0);
          const bsrs = finalPoints.map(p => p.bsr).filter(b => b > 0);
          
          const maxPrice = Math.max(...prices);
          const minPrice = Math.min(...prices);
          const avgBsr = bsrs.reduce((a, b) => a + b, 0) / bsrs.length;
          
          const sortedByBsr = [...finalPoints].sort((a, b) => a.bsr - b.bsr);
          const peakSalesMonth = sortedByBsr[0]?.date || "Nov";
          const offSalesMonth = sortedByBsr[sortedByBsr.length - 1]?.date || "Feb";

          setInsights([
            { label: "Peak Sales Period", value: peakSalesMonth, color: "var(--success)", icon: "🎯" },
            { label: "Off-Season Spike", value: offSalesMonth, color: "var(--danger)", icon: "📉" },
            { label: "Avg Historical BSR", value: `#${Math.round(avgBsr).toLocaleString()}`, color: "var(--blue)", icon: "📊" },
            { label: "Price Volatility", value: `₹${(maxPrice - minPrice).toLocaleString()}`, color: "var(--warning)", icon: "💰" },
          ]);
        } else {
          // Keepa returned data but CSV array is empty. Use seed-based values
          generateSeedData(searchAsin);
        }
      } else {
        // Fallback to seed based values if mock mode
        generateSeedData(searchAsin);
      }

      setSearched(true);
      confetti({ particleCount: 30, spread: 25 });
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Failed to process seasonal trends.");
      generateSeedData(searchAsin);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const generateSeedData = (searchAsin: string) => {
    // Generate deterministic values based on ASIN character codes
    const seed = searchAsin.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const priceBaseline = 1500 + (seed % 2000);
    
    const seededPoints = MOCK_HISTORICAL_DATA.map((pt, index) => {
      const bsrDev = Math.sin((index + seed) * 0.8) * 4000;
      const priceDev = Math.cos((index + seed) * 0.6) * 300;
      return {
        date: pt.date,
        bsr: Math.round(Math.max(100, Math.min(15000, pt.bsr + bsrDev))),
        price: Math.round(priceBaseline + priceDev)
      };
    });

    setChartData(seededPoints);
    setIsLive(false);

    // Compute metrics
    const prices = seededPoints.map(p => p.price);
    const bsrs = seededPoints.map(p => p.bsr);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const avgBsr = bsrs.reduce((a, b) => a + b, 0) / bsrs.length;
    
    const sorted = [...seededPoints].sort((a, b) => a.bsr - b.bsr);
    const peakSalesMonth = sorted[0]?.date || "Nov";
    const offSalesMonth = sorted[sorted.length - 1]?.date || "Feb";

    setInsights([
      { label: "Peak Sales Period", value: peakSalesMonth, color: "var(--success)", icon: "🎯" },
      { label: "Off-Season Spike", value: offSalesMonth, color: "var(--danger)", icon: "📉" },
      { label: "Avg Historical BSR", value: `#${Math.round(avgBsr).toLocaleString()}`, color: "var(--blue)", icon: "📊" },
      { label: "Price Volatility", value: `₹${(maxPrice - minPrice).toLocaleString()}`, color: "var(--warning)", icon: "💰" },
    ]);
  };

  useEffect(() => {
    fetchTrends("B08XYZ1234");
  }, []);

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Keepa Live Trendster Seasonality</h1>
          <p className="page-subtitle">Inspect historical Best Sellers Rank (BSR) and Buy Box price trajectories to detect seasonality</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input 
              className="input-field" 
              placeholder="Enter Amazon India ASIN to pull Trendster reports (e.g. B08XYZ1234)..." 
              value={asin} 
              onChange={e => setAsin(e.target.value)} 
              onKeyDown={e => e.key === "Enter" && fetchTrends(asin)}
              style={{ paddingLeft: 40, width: "100%" }} 
            />
          </div>
          <button 
            className="btn-accent" 
            onClick={() => fetchTrends(asin)} 
            disabled={loading} 
            style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 180, justifyContent: "center" }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", animation: "spin 0.6s linear infinite" }} />
                Scraping API...
              </>
            ) : (
              <>
                <TrendingUp size={15} />
                Analyze Seasonality
              </>
            )}
          </button>
        </div>
        
        {/* API connection warning/info status badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          {errorMsg ? (
            <div style={{ color: "var(--danger)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <AlertTriangle size={14} /> {errorMsg} (Loaded simulation fallback)
            </div>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <Info size={13} color="var(--accent)" /> Enter any active Amazon India ASIN to parse live historical Keepa databases.
            </div>
          )}
          
          <span className={`badge ${isLive ? "badge-success" : "badge-warning"}`} style={{ fontSize: 11 }}>
            {isLive ? "● Keepa Server Connection Active" : "● Offline Sandbox Simulation Mode"}
          </span>
        </div>
      </div>

      {searched && chartData.length > 0 && (
        <>
          {/* INSIGHTS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            {insights.map(ins => (
              <div key={ins.label} className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 24, marginBottom: 4 }}>{ins.icon}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{ins.label}</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: ins.color }}>{ins.value}</span>
              </div>
            ))}
          </div>

          {/* RECHARTS CHART CONTAINER */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <Award size={18} color="var(--accent)" /> BSR Rank & Buy Box Historical Performance
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 24 }}>
              Graphing historical ranking density. Lower BSR rank represents superior sales velocity occurrences.
            </p>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fill: "var(--accent)", fontSize: 11 }} 
                    tickLine={false} 
                    axisLine={false} 
                    reversed 
                    tickFormatter={v => `#${v.toLocaleString()}`} 
                    label={{ value: 'Best Sellers Rank (BSR)', angle: -90, position: 'insideLeft', fill: 'var(--accent)', offset: 0, style: { fontSize: 11, fontWeight: 600 } }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fill: "var(--blue)", fontSize: 11 }} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={v => `₹${v.toLocaleString()}`} 
                    label={{ value: 'Buy Box Price (INR)', angle: 90, position: 'insideRight', fill: 'var(--blue)', offset: 0, style: { fontSize: 11, fontWeight: 600 } }}
                  />
                  <Tooltip 
                    contentStyle={{ background: "rgba(20,20,20,0.9)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)" }} 
                    formatter={(value: any, name?: any) => {
                      if (name === "BSR Rank") return [`#${Number(value).toLocaleString()}`, name];
                      return [`₹${Number(value).toLocaleString()}`, name];
                    }}
                  />
                  <Legend wrapperStyle={{ color: "var(--text-secondary)", fontSize: 12, paddingTop: 10 }} />
                  <Line yAxisId="left" type="monotone" dataKey="bsr" stroke="var(--accent)" strokeWidth={3} dot={{ fill: "var(--accent)", r: 4 }} activeDot={{ r: 6 }} name="BSR Rank" />
                  <Line yAxisId="right" type="monotone" dataKey="price" stroke="var(--blue)" strokeWidth={3} dot={{ fill: "var(--blue)", r: 4 }} activeDot={{ r: 6 }} name="Price (INR)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SEASONAL INDEX BAR CHART & HEATMAP */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 6 }}>
              Market Seasonality Index & Volatility Shares
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 20 }}>
              Evaluates relative monthly search index percentages computed from reciprocal BSR density weights.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 8 }}>
              {chartData.map((d, i) => {
                // reciprocal percentage metric
                const maxBsr = Math.max(...chartData.map(c => c.bsr));
                const minBsr = Math.min(...chartData.map(c => c.bsr));
                const range = maxBsr - minBsr || 1;
                const strength = Math.round(((maxBsr - d.bsr) / range) * 100);

                return (
                  <div key={d.date} style={{ textAlign: "center" }}>
                    <div style={{ height: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end", marginBottom: 8 }}>
                      <div style={{
                        height: `${Math.max(10, strength)}%`,
                        background: strength > 75 ? "var(--success)" : strength > 45 ? "var(--warning)" : "var(--blue)",
                        borderRadius: "4px 4px 0 0",
                        minHeight: 8,
                        opacity: 0.95,
                        transition: "height 0.5s ease"
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>{d.date.split(" ")[0]}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: strength > 75 ? "var(--success)" : "var(--text-secondary)", marginTop: 2 }}>{strength}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
