"use client";
import { useState } from "react";
import { Target, Download, TrendingUp, TrendingDown } from "lucide-react";

const magnetResults = [
  { keyword: "bamboo cutting board", volume: 48200, iqScore: 92, competition: "Low", cpc: "₹68", growth: "+12%", trend: "up" },
  { keyword: "bamboo cutting board large", volume: 31400, iqScore: 88, competition: "Low", cpc: "₹55", growth: "+8%", trend: "up" },
  { keyword: "bamboo kitchen board", volume: 18700, iqScore: 85, competition: "Low", cpc: "₹45", growth: "+21%", trend: "up" },
  { keyword: "bamboo board for cutting", volume: 14200, iqScore: 81, competition: "Medium", cpc: "₹72", growth: "+5%", trend: "up" },
  { keyword: "bamboo cutting board set of 3", volume: 11800, iqScore: 79, competition: "Low", cpc: "₹85", growth: "+18%", trend: "up" },
  { keyword: "best bamboo cutting board", volume: 9400, iqScore: 76, competition: "High", cpc: "₹110", growth: "+2%", trend: "up" },
  { keyword: "bamboo chopping board", volume: 8900, iqScore: 74, competition: "Medium", cpc: "₹58", growth: "+9%", trend: "up" },
];

const compColors: Record<string, string> = { "Low": "badge-success", "Medium": "badge-warning", "High": "badge-danger" };

export default function MagnetPage() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSearched(true); }, 1300);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Magnet</h1>
          <p className="page-subtitle">Keyword aggregator — discover high-volume search terms from a single seed keyword</p>
        </div>
        {searched && (
          <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8 }}><Download size={15} /> Export</button>
        )}
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            className="input-field"
            placeholder="Enter a seed keyword (e.g. bamboo cutting board)..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={{ flex: 1 }}
          />
          <button className="btn-accent" onClick={handleSearch} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 160 }}>
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Finding...</> : <><Target size={15} />Get Keywords</>}
          </button>
        </div>
        {!searched && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {["yoga mat", "water bottle", "bamboo cutting board"].map(k => (
              <button key={k} className="btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setKeyword(k)}>{k}</button>
            ))}
          </div>
        )}
      </div>

      {searched && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Keywords Found", value: "157", color: "var(--accent)" },
              { label: "Total Search Volume", value: "301,200", color: "var(--success)" },
              { label: "Avg IQ Score", value: "71.8", color: "var(--blue)" },
              { label: "Low Competition", value: "64%", color: "var(--purple)" },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Showing top <span style={{ color: "var(--accent)", fontWeight: 700 }}>{magnetResults.length}</span> keywords</span>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="badge badge-success">IQ ≥ 80 = Best</span>
                <span className="badge badge-warning">IQ 60–79 = Good</span>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>KEYWORD</th>
                    <th>SEARCH VOLUME</th>
                    <th>MAGNET IQ SCORE</th>
                    <th>COMPETITION</th>
                    <th>AVG CPC</th>
                    <th>GROWTH</th>
                    <th>TREND</th>
                  </tr>
                </thead>
                <tbody>
                  {magnetResults.map(kw => (
                    <tr key={kw.keyword}>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{kw.keyword}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div className="progress-bar-fill" style={{ width: `${Math.min((kw.volume / 50000) * 100, 100)}%` }} />
                          </div>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)", minWidth: 50 }}>{kw.volume.toLocaleString()}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div className="progress-bar-fill" style={{ width: `${kw.iqScore}%`, background: kw.iqScore >= 80 ? "var(--success)" : kw.iqScore >= 65 ? "var(--warning)" : "var(--danger)" }} />
                          </div>
                          <span style={{ fontWeight: 800, color: kw.iqScore >= 80 ? "var(--success)" : kw.iqScore >= 65 ? "var(--warning)" : "var(--danger)" }}>{kw.iqScore}</span>
                        </div>
                      </td>
                      <td><span className={`badge ${compColors[kw.competition]}`}>{kw.competition}</span></td>
                      <td style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{kw.cpc}</td>
                      <td style={{ color: kw.growth.startsWith("+") ? "var(--success)" : "var(--danger)", fontWeight: 700 }}>{kw.growth}</td>
                      <td>{kw.trend === "up" ? <TrendingUp size={16} color="var(--success)" /> : <TrendingDown size={16} color="var(--danger)" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
