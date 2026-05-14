"use client";
import { useState, useEffect } from "react";
import { 
  Zap, ArrowUpRight, Target, ExternalLink, Filter, 
  RefreshCw, Star, ShoppingCart, BarChart2
} from "lucide-react";

const products = [
  {
    asin: "B08N5KWB9H",
    name: "Aero Dynamics Wireless Ergo Mouse - Graphite",
    bsr: 12,
    prevBsr: 45,
    change: +45,
    category: "Electronics",
    price: "₹4,199",
    rating: 4.8,
    reviews: 12402,
    img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop"
  },
  {
    asin: "B09L1W3X2M",
    name: "Lumina Pro LED Desk Lamp with Wireless Charging",
    bsr: 45,
    prevBsr: 165,
    change: +120,
    category: "Home Office",
    price: "₹2,499",
    rating: 4.6,
    reviews: 3512,
    img: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=400&h=400&fit=crop"
  },
  {
    asin: "B07ZPC9QD4",
    name: "AquaHydrate Smart Vacuum Insulated Bottle",
    bsr: 89,
    prevBsr: 299,
    change: +210,
    category: "Sports",
    price: "₹1,250",
    rating: 4.9,
    reviews: 890,
    img: "https://images.unsplash.com/photo-1602143307185-83e312e9556d?w=400&h=400&fit=crop"
  },
  {
    asin: "B0BMQ8Y9K1",
    name: "Zenith Noise Cancelling Over-Ear Headphones",
    bsr: 5,
    prevBsr: 13,
    change: +8,
    category: "Electronics",
    price: "₹24,900",
    rating: 4.9,
    reviews: 21500,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
  },
  {
    asin: "B0CKM1Y9L2",
    name: "Vortex 4K Action Camera - Waterproof",
    bsr: 112,
    prevBsr: 450,
    change: +300,
    category: "Cameras",
    price: "₹10,900",
    rating: 4.4,
    reviews: 1205,
    img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop"
  },
  {
    asin: "B09D1W5X8P",
    name: "Titanium EDC Multitool - 18 Functions",
    bsr: 240,
    prevBsr: 890,
    change: +650,
    category: "Tools",
    price: "₹4,500",
    rating: 4.7,
    reviews: 4320,
    img: "https://images.unsplash.com/photo-1589131008136-23910c2c6225?w=400&h=400&fit=crop"
  }
];

export default function TrendingProducts() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Electronics", "Home Office", "Sports", "Cameras", "Tools"];

  const fetchTrending = async (cat: string) => {
    setLoading(true);
    try {
      const categoryMap: any = {
        "All": "electronics",
        "Electronics": "electronics",
        "Home Office": "home-and-kitchen",
        "Sports": "sports",
        "Cameras": "electronics",
        "Tools": "tools-and-home-improvement"
      };
      const response = await fetch(`/api/amazon/trending?category=${categoryMap[cat]}`);
      const data = await response.json();
      setLiveProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending(activeFilter);
  }, [activeFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTrending(activeFilter).then(() => setIsRefreshing(false));
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      <header className="page-header" style={{ marginBottom: 40 }}>
        <div>
          <h1 className="page-title">Trending Best Sellers</h1>
          <p className="page-subtitle">High-velocity products dominating Amazon marketplaces right now.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button 
            className="btn-ghost" 
            style={{ display: "flex", alignItems: "center", gap: 8 }}
            onClick={handleRefresh}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            Refresh Data
          </button>
          <div className="badge badge-accent">
            <Zap size={12} style={{ marginRight: 6 }} />
            Live Market Analytics
          </div>
        </div>
      </header>

      {/* Filters */}
      <div style={{ 
        display: "flex", 
        gap: 8, 
        marginBottom: 32, 
        padding: "4px", 
        background: "var(--bg-secondary)", 
        borderRadius: 12, 
        width: "fit-content",
        border: "1px solid var(--border)"
      }}>
        {categories.map(cat => (
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
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", 
        gap: "24px",
        minHeight: "400px"
      }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card" style={{ height: "200px", background: "var(--bg-secondary)", opacity: 0.5, animation: "pulse 1.5s infinite" }} />
          ))
        ) : (
          liveProducts.map((product) => (
            <div key={product.asin} className="glass-card" style={{ 
              display: "flex", 
              padding: 0, 
              overflow: "hidden", 
              height: "200px" 
            }}>
              {/* Image side */}
              <div style={{ width: "160px", flexShrink: 0, position: "relative" }}>
                <img 
                  src={product.img || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200"} 
                  alt={product.name} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
                <div style={{ 
                  position: "absolute", 
                  top: 8, 
                  left: 8, 
                  background: "rgba(0,0,0,0.7)", 
                  backdropFilter: "blur(4px)",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700
                }}>
                  #{product.bsr}
                </div>
              </div>

              {/* Content side */}
              <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase" }}>{product.category}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--success)", fontSize: 12, fontWeight: 700 }}>
                    <ArrowUpRight size={14} /> +{product.change}%
                  </div>
                </div>

                <h3 style={{ 
                  fontSize: 15, 
                  fontWeight: 700, 
                  color: "var(--text-primary)", 
                  marginBottom: 8,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.3
                }}>
                  {product.name}
                </h3>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "auto" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{product.price}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-muted)" }}>
                    <Star size={12} fill="var(--warning)" color="var(--warning)" /> {product.rating || "4.5"} ({product.reviews?.toLocaleString() || "0"})
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button 
                    className="btn-accent" 
                    style={{ flex: 1, padding: "8px", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    onClick={() => alert(`Analyzing ${product.asin}...`)}
                  >
                    <BarChart2 size={14} /> Analysis
                  </button>
                  <button 
                    className="btn-ghost" 
                    style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => window.open(`https://www.amazon.com/dp/${product.asin}`, "_blank")}
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button 
                    className="btn-ghost" 
                    style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => alert("Added to Tracking")}
                  >
                    <Target size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
