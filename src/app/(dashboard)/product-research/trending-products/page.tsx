"use client";
import { useState, useEffect } from "react";
import { 
  Zap, ArrowUpRight, Target, ExternalLink, Filter, 
  RefreshCw, Star, BarChart2, Award, Info
} from "lucide-react";

const CATEGORIES = [
  { id: "976442031", name: "Home & Kitchen", icon: "🍳" },
  { id: "976419031", name: "Electronics", icon: "⚡" },
  { id: "1983396031", name: "Sports & Fitness", icon: "🏃" },
  { id: "1389441031", name: "Cameras", icon: "📷" },
  { id: "3704992031", name: "Power Tools", icon: "🛠️" },
  { id: "1951044031", name: "Clothing", icon: "👕" },
  { id: "2454178031", name: "Beauty", icon: "💄" },
  { id: "1571274031", name: "Books", icon: "📚" },
  { id: "2061109031", name: "Toys & Games", icon: "🧸" },
];

export default function TrendingProducts() {
  const [activeNode, setActiveNode] = useState("976442031");
  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = async (nodeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/amazon/trending?category=${nodeId}`);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setProducts([]);
      } else {
        setProducts(data.products || []);
        setMeta({
          categoryName: data.categoryName,
          totalRanked: data.totalRanked,
          lastUpdated: data.lastUpdated,
          source: data.source,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch trending products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending(activeNode);
  }, [activeNode]);

  // Rank position badge color helper
  const getRankColor = (rank: number) => {
    if (rank === 1) return { bg: "linear-gradient(135deg, #ffd700, #ffa500)", color: "#000", border: "#ffd700" };
    if (rank === 2) return { bg: "linear-gradient(135deg, #c0c0c0, #a9a9a9)", color: "#000", border: "#c0c0c0" };
    if (rank === 3) return { bg: "linear-gradient(135deg, #cd7f32, #8b5a2b)", color: "#fff", border: "#cd7f32" };
    return { bg: "rgba(0, 0, 0, 0.75)", color: "#fff", border: "transparent" };
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1600px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ background: "var(--accent-muted)", color: "var(--accent)", padding: "8px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <Zap size={24} />
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Amazon India Best Sellers</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Live bestseller rankings queried directly from Amazon India's marketplace categories.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => fetchTrending(activeNode)} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh Live BSR
          </button>
        </div>
      </div>

      {/* Category selector */}
      <div className="glass-card" style={{ padding: "8px", display: "flex", gap: "8px", marginBottom: "32px", overflowX: "auto", maxWidth: "100%", whiteSpace: "nowrap" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveNode(cat.id)}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: activeNode === cat.id ? "1px solid var(--accent)" : "1px solid transparent",
              background: activeNode === cat.id ? "var(--accent-muted)" : "transparent",
              color: activeNode === cat.id ? "var(--accent)" : "var(--text-muted)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* API Metadata Status Panel */}
      {meta && !loading && !error && (
        <div style={{ 
          background: "var(--bg-secondary)", 
          border: "1px solid var(--border)", 
          borderRadius: "12px", 
          padding: "14px 20px", 
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          color: "var(--text-secondary)",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Info size={16} color="var(--accent)" />
            <span>Source: <b>{meta.source}</b></span>
          </div>
          <div>
            <span>Category Node ID: <b>{activeNode}</b> ({meta.categoryName})</span>
          </div>
          <div>
            <span>Last Updated: <b>{new Date(meta.lastUpdated).toLocaleTimeString()}</b></span>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div style={{ minHeight: "400px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ height: "380px", background: "var(--bg-secondary)", opacity: 0.5, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : error ? (
          <div className="glass-card" style={{ padding: "48px", textAlign: "center", border: "1px dashed var(--danger)" }}>
             <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--danger)", marginBottom: 8 }}>API Connection Refused</div>
             <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px", maxWidth: "480px", margin: "0 auto" }}>{error}</p>
             <button className="btn-accent" style={{ marginTop: 20 }} onClick={() => fetchTrending(activeNode)}>Try Reconnecting</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {products.map((product, idx) => {
              const rankColor = getRankColor(product.rankPosition);
              return (
                <div key={product.asin || idx} className="glass-card hover-glow" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid var(--border)", transition: "all 0.3s ease" }}>
                  
                  {/* Top image wrapper */}
                  <div style={{ position: "relative", height: "220px", background: "#fff", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", borderBottom: "1px solid var(--border)" }}>
                    <img 
                      src={product.img} 
                      alt={product.name} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01.LZZZZZZZ.jpg`;
                      }}
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
                    />
                    
                    {/* Bestseller rank position banner */}
                    <div style={{ 
                      position: "absolute", 
                      top: "12px", 
                      left: "12px", 
                      background: rankColor.bg, 
                      color: rankColor.color, 
                      padding: "5px 12px", 
                      borderRadius: "8px", 
                      fontSize: "12px", 
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      border: `1px solid ${rankColor.border}`
                    }}>
                      <Award size={13} />
                      <span>#{product.rankPosition}</span>
                    </div>

                    {/* ASIN Label */}
                    <div style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      background: "rgba(15, 23, 42, 0.8)",
                      color: "#fff",
                      fontSize: "10px",
                      fontFamily: "monospace",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontWeight: 700
                    }}>
                      {product.asin}
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {product.category}
                      </span>
                    </div>
                    
                    <h3 style={{ 
                      fontSize: "14px", 
                      fontWeight: 600, 
                      color: "var(--text-primary)", 
                      marginBottom: "12px", 
                      display: "-webkit-box", 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: "vertical", 
                      overflow: "hidden", 
                      lineHeight: "1.4" 
                    }}>
                      {product.name}
                    </h3>
                    
                    {/* Key stats row */}
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1.2fr", 
                      gap: "10px", 
                      background: "var(--bg-secondary)", 
                      padding: "10px 14px", 
                      borderRadius: "10px", 
                      border: "1px solid var(--border)", 
                      marginBottom: "16px",
                      fontSize: "12px"
                    }}>
                      <div>
                        <div style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Sales Rank</div>
                        <div style={{ color: "var(--text-primary)", fontWeight: 700, marginTop: "2px" }}>#{product.bsr.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Rating / Reviews</div>
                        <div style={{ color: "var(--text-primary)", fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                          {product.rating ? (
                            <>
                              <Star size={12} color="#f59e0b" fill="#f59e0b" />
                              <span>{product.rating}</span>
                              <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({product.reviews?.toLocaleString() || 0})</span>
                            </>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>No ratings</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>{product.price}</div>
                      </div>
                      
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button 
                          className="btn-accent" 
                          style={{ padding: "8px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                          onClick={() => alert(`Analyzing ASIN ${product.asin} in category ${product.category}...`)}
                        >
                          <BarChart2 size={13} /> Analyze
                        </button>
                        <a 
                          href={`https://www.amazon.in/dp/${product.asin}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-ghost"
                          style={{ padding: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          title="View Live Listing on Amazon India"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.3; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hover-glow:hover {
          transform: translateY(-4px);
          border-color: var(--accent) !important;
          box-shadow: 0 12px 32px var(--accent-glow) !important;
        }
      `}</style>
    </div>
  );
}
