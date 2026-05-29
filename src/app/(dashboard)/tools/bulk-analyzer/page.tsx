"use client";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, Star, ExternalLink, RefreshCcw, Package } from "lucide-react";

interface AnalyzedProduct {
  asin: string;
  title: string;
  brand: string;
  image: string;
  price: string;
  priceNum: number;
  bsr: number;
  rating: number;
  reviews: number;
  revenueEstimate: string;
  revenueNum: number;
  fbaFee: string;
  margin: string;
  marginNum: number;
  category: string;
}

export default function BulkAnalyzer() {
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalAsins, setTotalAsins] = useState(0);
  const [results, setResults] = useState<AnalyzedProduct[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractAsins = (file: File) => {
    setError("");
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        let allText = "";
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          allText += csv + " ";
        });

        // Regex to find ASINs (B0 followed by 8 alphanumeric chars)
        const asinRegex = /\bB0[A-Z0-9]{8}\b/g;
        const matches = allText.match(asinRegex) || [];
        const uniqueAsins = [...new Set(matches)];

        if (uniqueAsins.length === 0) {
          setError("No ASINs found in the uploaded file. Ensure ASINs start with 'B0'.");
          return;
        }

        analyzeAsinsInBatches(uniqueAsins);
      } catch (err) {
        setError("Failed to parse the file. Please upload a valid Excel or CSV file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const analyzeAsinsInBatches = async (asins: string[]) => {
    setAnalyzing(true);
    setTotalAsins(asins.length);
    setResults([]);
    setProgress(0);
    setError("");

    const batchSize = 50;
    let accumulated: AnalyzedProduct[] = [];

    for (let i = 0; i < asins.length; i += batchSize) {
      const batch = asins.slice(i, i + batchSize);
      try {
        const res = await fetch("/api/bulk-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asins: batch }),
        });
        
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          accumulated = [...accumulated, ...data.products];
          // Sort by BSR dynamically
          accumulated.sort((a, b) => a.bsr - b.bsr);
          setResults(accumulated);
        }
        
        setProgress(Math.round(((i + batch.length) / asins.length) * 100));
        
        // Small delay to respect Keepa rate limits
        if (i + batchSize < asins.length) {
          await new Promise(r => setTimeout(r, 600));
        }
      } catch (err: any) {
        console.error("Batch error:", err);
        // Continue with next batch even if one fails
      }
    }

    setAnalyzing(false);
    setProgress(100);
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bulk ASIN Analyzer</h1>
          <p className="page-subtitle">
            Upload an Excel file containing Amazon India ASINs. We'll automatically extract them and fetch their latest analytics, sorted by Best Seller Rank.
          </p>
        </div>
      </div>

      {/* ── Upload Zone ── */}
      {!analyzing && results.length === 0 && (
        <div 
          className="glass-card"
          style={{
            padding: 60,
            textAlign: "center",
            cursor: "pointer",
            border: isDragging ? "2px dashed var(--accent)" : "2px dashed var(--border)",
            background: isDragging ? "var(--accent-muted)" : "var(--bg-card)",
            transition: "all 0.2s",
            marginBottom: 24,
          }}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              extractAsins(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={48} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Click or drag & drop an Excel file</h3>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Supports .xlsx, .xls, .csv. We will automatically find and extract all ASINs from any row or column.</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: "none" }} 
            accept=".xlsx, .xls, .csv" 
            onChange={e => e.target.files && extractAsins(e.target.files[0])}
          />
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ background: "var(--danger-muted)", border: "1px solid var(--danger)", borderRadius: 12, padding: "14px 20px", marginBottom: 24, color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {/* ── Loading / Progress ── */}
      {(analyzing || results.length > 0) && (
        <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
          
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Package size={16} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                {results.length} / {totalAsins || results.length} Products Analyzed
              </span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>· Amazon.in · Live Keepa Data</span>
            </div>

            {!analyzing && (
              <button 
                onClick={() => { setResults([]); setProgress(0); setTotalAsins(0); }}
                className="btn-ghost"
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "6px 12px" }}
              >
                <RefreshCcw size={14} /> Analyze Another File
              </button>
            )}
          </div>

          {analyzing && (
            <div style={{ padding: "20px 24px", background: "var(--bg-secondary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>
                <span>Extracting data in batches...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: "100%", background: "var(--border)", borderRadius: 10, height: 6, overflow: "hidden" }}>
                <div style={{ background: "var(--accent)", height: "100%", width: `${progress}%`, transition: "width 0.3s ease" }} />
              </div>
            </div>
          )}

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>PRICE</th>
                  <th>BSR</th>
                  <th>EST. REV/MO</th>
                  <th>REVIEWS</th>
                  <th>RATING</th>
                  <th>MARGIN</th>
                  <th>FBA FEE</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {results.map(p => (
                  <tr key={p.asin}>
                    <td style={{ minWidth: 250 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", background: "#fff", flexShrink: 0, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img
                            src={p.image}
                            alt={p.title}
                            onError={e => { (e.target as HTMLImageElement).src = `https://images.amazon.com/images/P/${p.asin}.01._SCLZZZZZZZ_.jpg`; }}
                            style={{ width: 40, height: 40, objectFit: "contain" }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontFamily: "monospace" }}>{p.asin}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{p.price}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: p.bsr < 5000 ? "var(--success)" : p.bsr < 20000 ? "var(--warning)" : "var(--danger)" }}>
                        {p.bsr === 999999 ? "N/A" : `#${p.bsr.toLocaleString("en-IN")}`}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--accent)" }}>{p.revenueEstimate}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{p.reviews.toLocaleString("en-IN")}</td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={11} fill="var(--warning)" color="var(--warning)" />
                        <span style={{ fontWeight: 600, color: "var(--warning)" }}>{p.rating > 0 ? p.rating.toFixed(1) : "0.0"}</span>
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: p.marginNum > 25 ? "var(--success)" : p.marginNum > 15 ? "var(--warning)" : "var(--danger)" }}>{p.margin}</td>
                    <td style={{ color: "var(--danger)", fontWeight: 600 }}>{p.fbaFee}</td>
                    <td>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                        onClick={() => window.open(`https://www.amazon.in/dp/${p.asin}`, "_blank")}>
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {results.length === 0 && !analyzing && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                      No results to display
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
