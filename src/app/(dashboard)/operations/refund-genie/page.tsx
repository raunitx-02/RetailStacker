"use client";
import React, { useState, useEffect } from "react";
import { RefreshCw, Clipboard, CheckCircle, Info, Sparkles, X, ChevronRight, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface ReimbursementCase {
  id: string;
  type: string;
  asin: string;
  units: number;
  amtOwed: number;
  status: "Open" | "Submitted" | "Reimbursed";
  date: string;
  reasonCode: string;
}

const DEFAULT_CASES: ReimbursementCase[] = [
  { id: "FBA-2026-10841", type: "Lost Inventory", asin: "B08XYZ1234", units: 12, amtOwed: 287.88, status: "Open", date: "May 10, 2026", reasonCode: "M-LOST-WH" },
  { id: "FBA-2026-10792", type: "Damaged Inventory", asin: "B09ABC5678", units: 6, amtOwed: 149.94, status: "Submitted", date: "May 06, 2026", reasonCode: "D-DAMG-WH" },
  { id: "FBA-2026-10654", type: "Lost Inbound Shipment", asin: "B07DEF9012", units: 24, amtOwed: 719.76, status: "Reimbursed", date: "Apr 28, 2026", reasonCode: "M-LOST-INB" },
  { id: "FBA-2026-10512", type: "Customer Return Destroyed", asin: "B0AGHI012", units: 8, amtOwed: 319.92, status: "Reimbursed", date: "Apr 15, 2026", reasonCode: "R-RET-DEST" },
  { id: "FBA-2026-10489", type: "Warehouse Damage", asin: "B0CJKL345", units: 15, amtOwed: 689.85, status: "Submitted", date: "Apr 12, 2026", reasonCode: "D-DAMG-CAR" },
  { id: "FBA-2026-10341", type: "Lost Inventory", asin: "B08MNO678", units: 9, amtOwed: 170.91, status: "Reimbursed", date: "Apr 05, 2026", reasonCode: "M-LOST-WH" },
  { id: "FBA-2026-10208", type: "Damaged Inventory", asin: "B0DPQR901", units: 3, amtOwed: 83.97, status: "Open", date: "Mar 28, 2026", reasonCode: "D-DAMG-WH" },
];

const statusStyle: Record<string, string> = {
  "Open": "badge-accent",
  "Submitted": "badge-blue",
  "Reimbursed": "badge-success",
};

export default function RefundGeniePage() {
  const [cases, setCases] = useState<ReimbursementCase[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  const [activeClaimModal, setActiveClaimModal] = useState<ReimbursementCase | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("neon10_refund_cases");
      if (saved) {
        setCases(JSON.parse(saved));
      } else {
        setCases(DEFAULT_CASES);
        localStorage.setItem("neon10_refund_cases", JSON.stringify(DEFAULT_CASES));
      }
    } catch (e) {
      console.error(e);
      setCases(DEFAULT_CASES);
    }
  }, []);

  const saveCasesToStorage = (updated: ReimbursementCase[]) => {
    setCases(updated);
    localStorage.setItem("neon10_refund_cases", JSON.stringify(updated));
  };

  // Run new refund audit scan simulation
  const handleRunScan = () => {
    setIsScanning(true);
    const steps = [
      "Downloading FBA Inventory Adjustments Log...",
      "Analyzing Inbound Shipment Reconciliation Sheets...",
      "Matching customer return tags with FBA receive timestamps...",
      "Evaluating warehouse disposal and scrap receipts...",
      "Synthesizing dynamic reimbursement discrepancy reports..."
    ];

    let currentStepIdx = 0;
    setScanStep(steps[currentStepIdx]);

    const interval = setInterval(() => {
      currentStepIdx++;
      if (currentStepIdx < steps.length) {
        setScanStep(steps[currentStepIdx]);
      } else {
        clearInterval(interval);
        // Complete scan, append new mock cases if any
        setIsScanning(false);
        setScanStep("");

        const newDetectedCase: ReimbursementCase = {
          id: `FBA-2026-${Math.floor(20000 + Math.random() * 90000)}`,
          type: "FBA Lost Inventory",
          asin: "B0CJKL345",
          units: 14,
          amtOwed: 420.00,
          status: "Open",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          reasonCode: "M-LOST-WH"
        };

        const updated = [newDetectedCase, ...cases];
        saveCasesToStorage(updated);

        confetti({
          particleCount: 50,
          spread: 40,
          colors: ["#22c55e", "#ff6b35"]
        });
      }
    }, 1000);
  };

  // Submit Claim Confirmation
  const handleSubmitClaimConfirmation = (id: string) => {
    const updated = cases.map(c => c.id === id ? { ...c, status: "Submitted" as const } : c);
    saveCasesToStorage(updated);
    setActiveClaimModal(null);
    confetti({ particleCount: 30, spread: 35 });
  };

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const total = cases.reduce((sum, c) => sum + c.amtOwed, 0);
  const reimbursed = cases.filter(c => c.status === "Reimbursed").reduce((sum, c) => sum + c.amtOwed, 0);
  const pending = cases.filter(c => c.status !== "Reimbursed").reduce((sum, c) => sum + c.amtOwed, 0);

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reimbursement Refund Genie</h1>
          <p className="page-subtitle">Reconcile FBA adjustments automatically to capture reimbursement opportunities for missing or broken stock</p>
        </div>
        <button 
          className="btn-accent" 
          onClick={handleRunScan}
          disabled={isScanning}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <RefreshCw size={15} className={isScanning ? "spin" : ""} />
          {isScanning ? "Auditing FBA Data..." : "Run New FBA Audit"}
        </button>
      </div>

      {/* RECONCILIATION SUMMARY BANNER */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24, background: "rgba(34,197,94,0.03)", border: "1px solid var(--success-muted)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: "var(--text-primary)" }}>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Total Audited Discrepancy</div>
          </div>
          <div style={{ textAlign: "center", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: "var(--success)" }}>₹{reimbursed.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Total Reimbursed Recovered</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: "var(--warning)" }}>₹{pending.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Unclaimed Pending Recovery</div>
          </div>
        </div>
      </div>

      {/* QUICK STATUS STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Audit Mismatches Found", value: cases.length, color: "var(--text-secondary)" },
          { label: "Actionable Claims Left", value: cases.filter(c => c.status === "Open").length, color: "var(--accent)" },
          { label: "Submitted Under Review", value: cases.filter(c => c.status === "Submitted").length, color: "var(--blue)" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* CASES TABLE */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 20 }}>Reimbursement Case Auditor Reports</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>CASE ID</th><th>DISCREPANCY TYPE</th><th>ASIN</th><th>REASON CODE</th><th>UNITS</th><th>EST. DEBT VALUE</th><th>DATE IDENTIFIED</th><th>STATUS</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {cases.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{c.id}</td>
                  <td style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{c.type}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>{c.asin}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent)" }}>{c.reasonCode}</td>
                  <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{c.units} units</td>
                  <td style={{ fontWeight: 800, color: "var(--success)" }}>₹{c.amtOwed.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{c.date}</td>
                  <td><span className={`badge ${statusStyle[c.status]}`}>{c.status}</span></td>
                  <td>
                    {c.status === "Open" ? (
                      <button 
                        className="btn-accent" 
                        style={{ fontSize: 12, padding: "6px 12px" }}
                        onClick={() => setActiveClaimModal(c)}
                      >
                        Submit Claim
                      </button>
                    ) : (
                      <button 
                        className="btn-ghost" 
                        style={{ fontSize: 12, padding: "6px 12px", opacity: 0.5 }}
                        disabled
                      >
                        No Action Left
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCANNING PROGRESS OVERLAY DRAWER */}
      {isScanning && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ position: "relative", width: 100, height: 100, marginBottom: 24 }}>
            {/* Circular spinner design */}
            <div style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.05)",
              borderTopColor: "var(--accent)",
              animation: "spin 1.2s linear infinite"
            }} />
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "var(--accent)"
            }}>
              AUDITING
            </div>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>FBA Warehouse Discrepancy Scanner</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", height: 20, textAlign: "center" }}>{scanStep}</p>
        </div>
      )}

      {/* SUBMIT CLAIM MODAL WINDOW WITH COPY/PASTE CODES */}
      {activeClaimModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div className="glass-card" style={{ width: 550, padding: 28, position: "relative" }}>
            <button 
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              onClick={() => setActiveClaimModal(null)}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Reimbursement Seller Central Copy Helper</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Use this template in your Amazon Seller Central contact ticket for immediate validation response.</p>

            {/* Template Codes Box */}
            <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 10, padding: 18, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>SUPPORT CASE TICKET FIELD</span>
                <button 
                  className="btn-ghost" 
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, padding: "4px 10px" }}
                  onClick={() => handleCopyToClipboard(
                    `Subject: Reimbursement Request - Lost Inventory reconciliation for ASIN ${activeClaimModal.asin}\n\nDear Seller Support Team,\n\nWe are submitting a formal FBA warehouse discrepancy claim. According to our FBA inventory adjustment logs, we have verified inventory discrepancies that have remained unreconciled for more than 30 days.\n\nCase Details:\n- Case ID ref: ${activeClaimModal.id}\n- Discrepancy Reason Code: ${activeClaimModal.reasonCode}\n- Target Product ASIN: ${activeClaimModal.asin}\n- Missing Unreconciled Units: ${activeClaimModal.units}\n- Estimated Recovery Value: ₹${activeClaimModal.amtOwed.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n\nKindly audit these discrepancies and credit the reimbursement balance back to our seller account.\n\nRegards,\nOperations Lead`
                  )}
                >
                  {copiedText ? <Check size={12} color="var(--success)" /> : <Clipboard size={12} />}
                  {copiedText ? "Copied!" : "Copy Template"}
                </button>
              </div>

              {/* Subject Copy */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Case Ticket Subject:</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                  Reimbursement Request - Lost Inventory reconciliation for ASIN {activeClaimModal.asin}
                </div>
              </div>

              {/* Message Copy */}
              <div>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Case Ticket Message Body:</span>
                <textarea 
                  readOnly 
                  className="input-field" 
                  style={{ 
                    width: "100%", 
                    height: 180, 
                    fontSize: 12, 
                    lineHeight: 1.5, 
                    fontFamily: "monospace", 
                    resize: "none", 
                    background: "rgba(255,255,255,0.03)" 
                  }}
                  value={`Dear Seller Support Team,

We are submitting a formal FBA warehouse discrepancy claim. According to our FBA inventory adjustment logs, we have verified inventory discrepancies that have remained unreconciled for more than 30 days.

Case Details:
- Case ID ref: ${activeClaimModal.id}
- Discrepancy Reason Code: ${activeClaimModal.reasonCode}
- Target Product ASIN: ${activeClaimModal.asin}
- Missing Unreconciled Units: ${activeClaimModal.units}
- Estimated Recovery Value: ₹${activeClaimModal.amtOwed.toLocaleString("en-IN", { minimumFractionDigits: 2 })}

Kindly audit these discrepancies and credit the reimbursement balance back to our seller account.

Regards,
Operations Lead`}
                />
              </div>
            </div>

            {/* Instruction Banner */}
            <div style={{ display: "flex", gap: 10, padding: 12, background: "rgba(255,107,53,0.04)", border: "1px solid var(--accent-muted)", borderRadius: 8, marginBottom: 20 }}>
              <Info size={16} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                Copy the text above, navigate to your Amazon Seller Central support center, open a new ticket under <strong>Inventory &gt; Lost/Damaged Warehouse</strong>, paste the content, and click submit. Once complete, return here and mark the claim as submitted.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setActiveClaimModal(null)}>Cancel</button>
              <button 
                className="btn-accent" 
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} 
                onClick={() => handleSubmitClaimConfirmation(activeClaimModal.id)}
              >
                Mark as Case Submitted
              </button>
            </div>
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
