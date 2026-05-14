"use client";
import { useState, useEffect } from "react";
import { 
  Zap, ArrowUpRight, Target, ExternalLink, Filter, 
  RefreshCw, Star, ShoppingCart, BarChart2
} from "lucide-react";

export default function TrendingProducts() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ["All", "Electronics", "Home Office", "Sports", "Cameras", "Tools"];

  const categoryMapping: any = {
    "All": "976442031", // Home & Kitchen
    "Electronics": "976419031",
    "Home Office": "976442031",
    "Sports": "1983396031",
    "Cameras": "1389441031",
    "Tools": "3704992031"
  };

  const fetchTrending = async (cat: string) => {
    setLoading(true);
    setError(null);
    try {
      const catId = categoryMapping[cat] || "976442031";
      const response = await fetch(`/api/amazon/trending?category=${catId}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setLiveProducts([]);
      } else {
        setLiveProducts(data.products || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch trending products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending(activeFilter);
  }, [activeFilter]);

  return (
    <div style={{ padding: "32px", maxWidth: "1600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "8px", borderRadius: "12px" }}>
              <Zap size={24} />
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>Trending Best Sellers</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>High-velocity products dominating Amazon marketplaces right now.</p>
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => fetchTrending(activeFilter)} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
          <button className="btn-accent" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={18} /> Live Market Analytics
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: "8px", display: "inline-flex", gap: "8px", marginBottom: "32px", background: "rgba(255,255,255,0.03)" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: activeFilter === cat ? "var(--accent)" : "transparent",
              color: activeFilter === cat ? "white" : "var(--text-muted)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ minHeight: "400px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ height: "350px", background: "var(--bg-secondary)", opacity: 0.5, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : error ? (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", border: "1px dashed var(--error)" }}>
             <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--error)", marginBottom: 8 }}>Analysis Error</div>
             <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>{error}</p>
             <button className="btn-accent" style={{ marginTop: 20 }} onClick={() => fetchTrending(activeFilter)}>Try Again</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {liveProducts.map((product, idx) => (
              <div key={product.asin || idx} className="glass-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform 0.3s ease" }}>
                <div style={{ position: "relative", height: "220px", background: "#fff", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                  <img 
                    src={product.img} 
                    alt={product.name} 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("images.amazon.com")) {
                        target.src = `https://images.amazon.com/images/P/${product.asin}.01._SCLZZZZZZZ_.jpg`;
                      } else {
                        target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
                      }
                    }}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
                  />
                  <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(0,0,0,0.7)", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                    #{product.bsr}
                  </div>
                </div>
                
                <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "1px" }}>{product.category}</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#10b981" }}>↑ {product.change}%</span>
                  </div>
                  
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)", marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>
                    {product.name}
                  </h3>
                  
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-main)" }}>{product.price}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        ⭐ {product.rating} ({product.reviews?.toLocaleString() || 0})
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        className="btn-accent" 
                        style={{ padding: "8px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                        onClick={() => alert(`Analyzing ${product.asin}...`)}
                      >
                        <BarChart2 size={14} /> Analysis
                      </button>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: "8px" }}
                        onClick={() => window.open(`https://www.amazon.in/dp/${product.asin}`, "_blank")}
                        title="View on Amazon"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: "8px" }}
                        onClick={() => alert("Added to Tracking")}
                        title="Keep Track"
                      >
                        <Target size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
      `}</style>
    </div>
  );
}
