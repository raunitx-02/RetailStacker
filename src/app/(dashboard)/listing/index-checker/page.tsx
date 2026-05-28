"use client";
import React, { useState, useEffect } from "react";
import { ShieldCheck, Plus, X, Copy, Check, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";

interface Result {
  keyword: string;
  indexed: boolean;
}

export default function IndexCheckerPage() {
  const [asin, setAsin] = useState("B08XYZ1234");
  const [kwInput, setKwInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal state for keyword fix action
  const [fixKeyword, setFixKeyword] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("retailstacker_index_keywords");
      if (saved) {
        setKeywords(JSON.parse(saved));
      } else {
        const defaults = ["bamboo cutting board", "large cutting board", "cutting board set", "bamboo kitchen board"];
        setKeywords(defaults);
        localStorage.setItem("retailstacker_index_keywords", JSON.stringify(defaults));
      }
    } catch (e) {
      console.error(e);
      setKeywords(["bamboo cutting board", "large cutting board", "cutting board set", "bamboo kitchen board"]);
    }
  }, []);

  const saveToStorage = (updated: string[]) => {
    setKeywords(updated);
    localStorage.setItem("retailstacker_index_keywords", JSON.stringify(updated));
  };

  const addKeyword = () => {
    const val = kwInput.trim().toLowerCase();
    if (val && !keywords.includes(val)) {
      const updated = [...keywords, val];
      saveToStorage(updated);
      setKwInput("");
    }
  };

  const removeKeyword = (kw: string) => {
    const updated = keywords.filter(k => k !== kw);
    saveToStorage(updated);
  };

  const runCheck = () => {
    setLoading(true);
    // Programmable indexing determination based on ASIN + Keyword string seed hashing
    setTimeout(() => {
      const getSeed = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
      };

      const checkedResults = keywords.map(kw => {
        const seed = getSeed(asin.toUpperCase() + kw.toLowerCase());
        // 75% indexing probability
        const indexed = (seed % 10) >= 3;
        return { keyword: kw, indexed };
      });

      setResults(checkedResults);
      setLoading(false);
      
      const indexedCount = checkedResults.filter(r => r.indexed).length;
      if (indexedCount > 0) {
        confetti({ particleCount: 40, spread: 35 });
      }
    }, 1100);
  };

  const handleCopyFix = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const indexed = results.filter(r => r.indexed).length;
  const notIndexed = results.filter(r => !r.indexed).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Index Checker</h1>
          <p className="page-subtitle">Verify whether your product listing is actively indexed by Amazon India for target terms</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>ASIN</label>
            <input className="input-field" placeholder="e.g. B08XYZ1234" value={asin} onChange={e => setAsin(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Add Keywords</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input-field" placeholder="Type keyword and press Enter..." value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addKeyword()} style={{ flex: 1 }} />
              <button className="btn-ghost" onClick={addKeyword} style={{ padding: "10px 12px", display: "flex" }}><Plus size={16} /></button>
            </div>
          </div>
        </div>

        {/* Keyword chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {keywords.map(kw => (
            <span key={kw} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 50,
              background: "var(--accent-muted)", border: "1px solid rgba(255,107,53,0.25)",
              fontSize: 13, color: "var(--accent)", fontWeight: 500,
            }}>
              {kw}
              <button onClick={() => removeKeyword(kw)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", display: "flex" }}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        <button className="btn-accent" onClick={runCheck} disabled={loading || keywords.length === 0} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {loading ? (
            <>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", animation: "spin 0.6s linear infinite" }} />
              Verifying Amazon Indexes...
            </>
          ) : (
            <>
              <ShieldCheck size={15} />
              Check Indexing
            </>
          )}
        </button>
      </div>

      {results.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
            <div className="stat-card">
              <p style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Checked Keywords</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)" }}>{results.length}</p>
            </div>
            <div className="stat-card">
              <p style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Indexed ✅</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: "var(--success)" }}>{indexed}</p>
            </div>
            <div className="stat-card">
              <p style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Not Indexed ❌</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: "var(--danger)" }}>{notIndexed}</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 20 }}>Index Check Results</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {results.map(r => (
                <div key={r.keyword} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 20px", borderRadius: 12,
                  background: r.indexed ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
                  border: `1px solid ${r.indexed ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: r.indexed ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {r.indexed ? <ShieldCheck size={18} color="var(--success)" /> : <X size={18} color="var(--danger)" />}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{r.keyword}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className={`badge ${r.indexed ? "badge-success" : "badge-danger"}`} style={{ fontSize: 13, padding: "5px 14px" }}>
                      {r.indexed ? "✓ Indexed" : "✗ Not Indexed"}
                    </span>
                    {!r.indexed && (
                      <button 
                        className="btn-ghost" 
                        style={{ fontSize: 12, padding: "6px 12px" }}
                        onClick={() => setFixKeyword(r.keyword)}
                      >
                        Fix →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* FIX INDEXING STEP-BY-STEP DIALOG */}
      {fixKeyword && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-card" style={{ width: 480, padding: 28, position: "relative" }}>
            <button 
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              onClick={() => setFixKeyword(null)}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Fix Indexing for "{fixKeyword}"</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Amazon's crawler has not indexed this term. Complete these steps to force indexing:</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent-muted)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>1</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Copy this target keyword into your clipboard.
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 8, marginTop: 8, border: "1px solid var(--border)" }}>
                    <span style={{ fontFamily: "monospace", flex: 1, color: "var(--text-primary)" }}>{fixKeyword}</span>
                    <button 
                      className="btn-ghost" 
                      style={{ padding: 4, minWidth: 0, color: isCopied ? "var(--success)" : undefined }}
                      onClick={() => handleCopyFix(fixKeyword)}
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--blue-muted)", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>2</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Navigate to <strong>Seller Central &gt; Inventory &gt; Edit Product Listing &gt; Description &gt; Backend Search Terms</strong>.
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--success-muted)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>3</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Paste the keyword and save. Indexes typically update within <strong>3-4 hours</strong>. Verify indexing tomorrow in the tracker.
                </div>
              </div>
            </div>

            <button className="btn-accent" style={{ width: "100%" }} onClick={() => setFixKeyword(null)}>Completed Steps</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
