"use client";
import { useState } from "react";
import { Search, SlidersHorizontal, Download, Star, TrendingUp, ArrowUpRight } from "lucide-react";

const categories = ["All Categories", "Home & Kitchen", "Sports & Outdoors", "Beauty & Personal Care", "Electronics", "Clothing", "Toys & Games", "Office Products", "Pet Supplies"];

const mockProducts = [
  { rank: 1, img: "🎋", name: "Premium Bamboo Cutting Board Set", brand: "EcoHome", category: "Home & Kitchen", price: "₹2,499", bsr: 842, revenue: "₹4,54,280", reviews: 3241, rating: 4.7, margin: "34%", fbaFee: "₹450", opportunity: "High" },
  { rank: 2, img: "🧴", name: "Organic Shea Butter Body Lotion", brand: "NaturaCare", category: "Beauty", price: "₹1,299", bsr: 1203, revenue: "₹3,47,100", reviews: 1892, rating: 4.5, margin: "41%", fbaFee: "₹320", opportunity: "High" },
  { rank: 3, img: "💧", name: "Stainless Steel Water Bottle 32oz", brand: "HydroMax", category: "Sports", price: "₹1,499", bsr: 1587, revenue: "₹2,42,180", reviews: 5642, rating: 4.8, margin: "35%", fbaFee: "₹280", opportunity: "Medium" },
  { rank: 4, img: "🧘", name: "Non-Slip Yoga Mat Extra Thick 6mm", brand: "ZenFlow", category: "Sports", price: "₹3,199", bsr: 2104, revenue: "₹1,38,920", reviews: 2319, rating: 4.6, margin: "30%", fbaFee: "₹590", opportunity: "High" },
  { rank: 5, img: "💡", name: "LED Desk Lamp with USB-C Charging", brand: "BrightWork", category: "Electronics", price: "₹1,850", bsr: 2891, revenue: "₹1,34,200", reviews: 1245, rating: 4.4, margin: "28%", fbaFee: "₹410", opportunity: "Medium" },
  { rank: 6, img: "🍳", name: "Silicone Kitchen Utensil Set 6pc", brand: "ChefMate", category: "Home & Kitchen", price: "₹1,150", bsr: 3210, revenue: "₹1,31,500", reviews: 4102, rating: 4.6, margin: "38%", fbaFee: "₹220", opportunity: "High" },
];

const opportunityColors: Record<string, string> = {
  "High": "badge-success",
  "Medium": "badge-warning",
  "Low": "badge-danger",
};

export default function BlackBoxPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(mockProducts);
  const [searched, setSearched] = useState(true);
  const [filters, setFilters] = useState({ category: "All Categories", minRev: "", maxRev: "", minReviews: "", maxBsr: "", minMargin: "" });

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSearched(true); }, 1200);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Black Box</h1>
          <p className="page-subtitle">Discover profitable product opportunities using advanced filters</p>
        </div>
        {searched && (
          <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Download size={15} /> Export CSV
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <SlidersHorizontal size={16} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Search Filters</span>
          <span className="badge badge-accent" style={{ marginLeft: 4 }}>Advanced</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Category</label>
            <select className="input-field" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Min Monthly Revenue</label>
            <input className="input-field" placeholder="e.g. 10000" value={filters.minRev} onChange={e => setFilters({ ...filters, minRev: e.target.value })} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Max Monthly Revenue</label>
            <input className="input-field" placeholder="e.g. 100000" value={filters.maxRev} onChange={e => setFilters({ ...filters, maxRev: e.target.value })} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Max Reviews</label>
            <input className="input-field" placeholder="e.g. 5000" value={filters.minReviews} onChange={e => setFilters({ ...filters, minReviews: e.target.value })} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Max BSR</label>
            <input className="input-field" placeholder="e.g. 10000" value={filters.maxBsr} onChange={e => setFilters({ ...filters, maxBsr: e.target.value })} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Min Profit Margin %</label>
            <input className="input-field" placeholder="e.g. 30" value={filters.minMargin} onChange={e => setFilters({ ...filters, minMargin: e.target.value })} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-accent" onClick={handleSearch} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 160 }}>
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Searching...</> : <><Search size={15} /> Find Products</>}
          </button>
          <button className="btn-ghost" onClick={() => setFilters({ category: "All Categories", minRev: "", maxRev: "", minReviews: "", maxBsr: "", minMargin: "" })}>Reset Filters</button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Found <span style={{ color: "var(--accent)", fontWeight: 700 }}>{results.length.toLocaleString()}</span> product opportunities
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["High", "Medium", "Low"].map(o => (
                <span key={o} className={`badge ${opportunityColors[o]}`}>{o} Opportunity</span>
              ))}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>BSR</th>
                  <th>EST. REVENUE/MO</th>
                  <th>REVIEWS</th>
                  <th>RATING</th>
                  <th>MARGIN</th>
                  <th>FBA FEE</th>
                  <th>OPPORTUNITY</th>
                </tr>
              </thead>
              <tbody>
                {results.map((p) => (
                  <tr key={p.rank} style={{ cursor: "pointer" }}>
                    <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{p.rank}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{p.img}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue" style={{ fontSize: 11 }}>{p.category}</span></td>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p.price}</td>
                    <td>
                      <span style={{ fontSize: 13, color: p.bsr < 3000 ? "var(--success)" : p.bsr < 6000 ? "var(--warning)" : "var(--danger)", fontWeight: 600 }}>
                        #{p.bsr.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--accent)" }}>{p.revenue}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{p.reviews.toLocaleString()}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={12} color="var(--warning)" fill="var(--warning)" />
                        <span style={{ fontWeight: 600, color: "var(--warning)" }}>{p.rating}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--success)" }}>{p.margin}</td>
                    <td style={{ color: "var(--danger)", fontWeight: 600 }}>{p.fbaFee}</td>
                    <td><span className={`badge ${opportunityColors[p.opportunity]}`}>{p.opportunity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
