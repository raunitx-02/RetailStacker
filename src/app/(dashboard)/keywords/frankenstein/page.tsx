"use client";
import React, { useState } from "react";
import { FlaskConical, Copy, Download, Trash2, Check } from "lucide-react";
import confetti from "canvas-confetti";

const sampleInput = `bamboo cutting board
cutting board bamboo
bamboo board for cutting
bamboo cutting boards
bamboo kitchen cutting board
large bamboo cutting board
bamboo board kitchen
bamboo chopping board
chopping board bamboo
bamboo kitchen board
kitchen bamboo board
bamboo wood cutting board
bamboo cutting board large
cutting boards bamboo
bamboo boards cutting
eco cutting board
eco-friendly cutting board
eco friendly cutting board
sustainable cutting board
green cutting board`;

const STOP_WORDS = new Set([
  "a", "an", "the", "for", "of", "and", "or", "but", "in", "on", "at", "with",
  "by", "to", "from", "is", "are", "was", "were", "this", "that", "these", "those"
]);

export default function FrankensteinPage() {
  const [input, setInput] = useState(sampleInput);
  const [output, setOutput] = useState<string[]>([]);
  const [processed, setProcessed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    lowercase: true,
    removeDups: true,
    sortByFreq: true,
    removeStopWords: true,
    oneWordPerLine: false
  });

  const processKeywords = () => {
    let keywords = input.split("\n").map(k => k.trim()).filter(Boolean);
    
    if (options.lowercase) {
      keywords = keywords.map(k => k.toLowerCase());
    }

    if (options.removeStopWords) {
      keywords = keywords.map(phrase => {
        return phrase.split(/\s+/).filter(word => !STOP_WORDS.has(word.toLowerCase())).join(" ");
      }).filter(Boolean);
    }

    if (options.oneWordPerLine) {
      const allWords = keywords.flatMap(k => k.split(/\s+/));
      keywords = Array.from(new Set(allWords));
    }

    if (options.removeDups) {
      const wordFreq: Record<string, number> = {};
      keywords.forEach(phrase => {
        phrase.split(/\s+/).forEach(word => {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
      });

      const unique = Array.from(new Set(keywords));
      if (options.sortByFreq) {
        unique.sort((a, b) => {
          const freqA = a.split(/\s+/).reduce((sum, w) => sum + (wordFreq[w] || 0), 0);
          const freqB = b.split(/\s+/).reduce((sum, w) => sum + (wordFreq[w] || 0), 0);
          return freqB - freqA;
        });
      }
      keywords = unique;
    }

    setOutput(keywords);
    setProcessed(true);
    confetti({ particleCount: 30, spread: 30 });
  };

  const handleCopy = () => {
    if (output.length === 0) return;
    const text = output.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (output.length === 0) return;
    const text = output.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `frankenstein_keywords_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Word frequency analysis based on INPUT
  const wordFreq: Record<string, number> = {};
  input.split("\n").forEach(phrase => {
    phrase.trim().split(/\s+/).forEach(word => {
      if (word) {
        const clean = word.toLowerCase().replace(/[^a-z0-9-]/g, "");
        if (clean) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
      }
    });
  });
  const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Statistics
  const originalCharCount = input.length;
  const originalWordCount = input.split(/\s+/).filter(Boolean).length;
  const processedText = output.join("\n");
  const processedCharCount = processedText.length;
  const processedWordCount = output.flatMap(o => o.split(/\s+/)).filter(Boolean).length;

  const charReduction = originalCharCount > 0 ? Math.max(0, Math.round(((originalCharCount - processedCharCount) / originalCharCount) * 100)) : 0;
  const wordReduction = originalWordCount > 0 ? Math.max(0, Math.round(((originalWordCount - processedWordCount) / originalWordCount) * 100)) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Frankenstein Keywords</h1>
          <p className="page-subtitle">Keyword processor — clean, deduplicate, and organize large keyword lists</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Input */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Keyword Input</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{input.split("\n").filter(Boolean).length} phrases entered</p>
            </div>
            <button className="btn-ghost" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, color: "var(--danger)" }} onClick={() => setInput("")}>
              <Trash2 size={13} /> Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            className="input-field"
            placeholder="Paste your keywords here (one per line)..."
            style={{ minHeight: 300, resize: "vertical", fontFamily: "monospace", fontSize: 13, lineHeight: 1.7 }}
          />
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
            <span>Words: <strong>{originalWordCount}</strong></span>
            <span>Characters: <strong>{originalCharCount}</strong></span>
          </div>
        </div>

        {/* Output */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Processed Output</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{processed ? `${output.length} unique phrases` : "Run processor to see results"}</p>
            </div>
            {processed && output.length > 0 && (
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  className="btn-ghost" 
                  style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, color: copied ? "var(--success)" : undefined }}
                  onClick={handleCopy}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied!" : "Copy"}
                </button>
                <button 
                  className="btn-ghost" 
                  style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
                  onClick={handleDownload}
                >
                  <Download size={13} /> Export
                </button>
              </div>
            )}
          </div>
          <div style={{
            minHeight: 300,
            background: "rgba(0,0,0,0.2)",
            borderRadius: 10,
            border: "1px solid var(--border)",
            padding: 16,
            fontFamily: "monospace",
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            overflowY: "auto",
            maxHeight: 300,
          }}>
            {processed ? output.map((kw, i) => (
              <div key={i} style={{ padding: "2px 0", color: i < 5 ? "var(--accent)" : "var(--text-secondary)" }}>{kw}</div>
            )) : <span style={{ color: "var(--text-muted)" }}>Processed keywords will appear here...</span>}
          </div>

          {processed && (
            <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
              <span>Words: <strong>{processedWordCount}</strong> ({wordReduction}% reduction)</span>
              <span>Chars: <strong>{processedCharCount}</strong> ({charReduction}% reduction)</span>
            </div>
          )}
        </div>
      </div>

      {/* Options + Run */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 16 }}>Processing Options</h2>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { key: "lowercase", label: "Convert to Lowercase" },
            { key: "removeDups", label: "Remove Duplicates" },
            { key: "sortByFreq", label: "Sort by Word Frequency" },
            { key: "removeStopWords", label: "Remove Stop Words (SEO)" },
            { key: "oneWordPerLine", label: "One Word Per Line" },
          ].map(opt => (
            <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={options[opt.key as keyof typeof options]} 
                  onChange={e => setOptions({ ...options, [opt.key]: e.target.checked })} 
                />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{opt.label}</span>
            </label>
          ))}
        </div>
        <button className="btn-accent" onClick={processKeywords} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FlaskConical size={15} /> Process Keywords
        </button>
      </div>

      {/* Word frequency analysis */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 16 }}>Top Word Frequency</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          {topWords.length === 0 ? (
            <div style={{ gridColumn: "span 5", textAlign: "center", color: "var(--text-muted)", padding: 12 }}>No word inputs detected.</div>
          ) : (
            topWords.map(([word, count]) => (
              <div key={word} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "12px 16px", textAlign: "center", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--accent)" }}>{count}×</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{word}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
