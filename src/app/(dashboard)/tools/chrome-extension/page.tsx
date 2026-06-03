"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Download, Zap, ShieldCheck, Calculator, Copy, 
  Layers, ChevronRight, X, Sparkles, AlertCircle, CheckCircle2 
} from "lucide-react";
import Link from "next/link";

const ChromeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" y1="8" x2="12" y2="8" />
    <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
    <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
  </svg>
);

interface UserSession {
  loggedIn: boolean;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
    plan: string;
    role: string;
  };
}

export default function ChromeExtensionPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [installStepsOpen, setInstallStepsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/extension/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
        setLoadingSession(false);
      })
      .catch((err) => {
        console.error("Error fetching session:", err);
        setLoadingSession(false);
      });
  }, []);

  const userPlan = session?.user?.plan || "Free";
  const allowedPlans = ["Lite", "Starter", "Growth", "Diamond"];
  const hasAccess = allowedPlans.includes(userPlan);

  const handleDownload = () => {
    if (!session?.loggedIn) {
      alert("Please log in first!");
      window.location.href = "/login";
      return;
    }

    if (!hasAccess) {
      alert(`To download the RetailStacker Chrome Extension, please subscribe to the Lite Plan (₹500/month) or higher! Current plan: ${userPlan}`);
      window.location.href = "/profile";
      return;
    }

    // Trigger zip download
    const link = document.createElement("a");
    link.href = "/retailstacker-extension.zip";
    link.download = "retailstacker-extension.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Open steps popup
    setInstallStepsOpen(true);
  };

  const features = [
    {
      icon: Zap,
      title: "Xray — Live Product Intelligence",
      desc: "Instantly overlays search results on Amazon India with key metrics: BSR, estimated sales, revenue, active sellers, and review velocity. Find goldmine opportunities directly inline.",
      color: "var(--accent)"
    },
    {
      icon: Calculator,
      title: "India-Specific Profit Calculator",
      desc: "Calculates accurate margins on individual product pages using real Amazon India referral fee slabs, Easy Ship/FBA logistics costs, and GST parameters.",
      color: "#a78bfa"
    },
    {
      icon: ShieldCheck,
      title: "Active Sellers & Buy Box Analyzer",
      desc: "Instantly identifies wholesale and arbitrage listings with active seller counts, mapping out private label territory versus open competitive listings.",
      color: "#34d399"
    },
    {
      icon: Copy,
      title: "One-Click Bulk ASIN Grabber",
      desc: "Instantly grab all product ASINs from any Amazon India search page and copy them to your clipboard, ready for Frankenstein, Cerebro, or Magnet analysis.",
      color: "#f43f5e"
    },
    {
      icon: Layers,
      title: "Inventory Level Indicator",
      desc: "Monitors and displays competitor inventory levels in real-time, showing stock depth so you can plan pricing strategies and capture the Buy Box.",
      color: "#fb923c"
    },
    {
      icon: Sparkles,
      title: "Deep Web-SaaS Syncing",
      desc: "Perfect synchronization between your browser extension and the RetailStacker dashboard. Send ASINs to Listing Builder or Keyword Tracker instantly.",
      color: "#22d3ee"
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 24px 48px" }}>
      {/* Hero Header Banner */}
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, rgba(12, 30, 54, 0.95) 0%, rgba(20, 15, 45, 0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "48px 40px",
        marginBottom: 36,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)"
      }}>
        {/* Glow effects */}
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "40%", height: "60%", background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)", opacity: 0.25, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "45%", height: "60%", background: "radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)", opacity: 0.25, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
          <div style={{ flex: "1 1 600px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(26, 86, 219, 0.2)", border: "1px solid rgba(26, 86, 219, 0.4)", padding: "6px 14px", borderRadius: 30, color: "var(--accent)", fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
              <ChromeIcon style={{ width: 14, height: 14 }} /> RetailStacker Chrome Extension
            </div>
            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 900, color: "#ffffff", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 16 }}>
              Supercharge Amazon India<br />
              <span style={{ background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Research In Real-Time</span>
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 28, maxWidth: 640 }}>
              Bring India's most powerful seller intelligence tools directly onto Amazon India, Flipkart, and Meesho. Compute profits, analyze competitor inventory, check sales volume, and research keywords without ever leaving the page.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
              <button 
                onClick={handleDownload}
                style={{
                  padding: "14px 28px",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="rs-accent-btn"
              >
                <Download size={18} /> Download Chrome Extension
              </button>

              <Link href="/pricing" style={{ textDecoration: "none" }}>
                <div style={{ fontSize: 14, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }} className="hover-link">
                  View Subscription Plans <ChevronRight size={16} />
                </div>
              </Link>
            </div>

            {loadingSession ? (
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>Checking authorization status...</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20 }}>
                {hasAccess ? (
                  <>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span style={{ fontSize: 13, color: "#a7f3d0", fontWeight: 600 }}>Access Unlocked ({userPlan} Plan)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} color="#f87171" />
                    <span style={{ fontSize: 13, color: "#fca5a5", fontWeight: 600 }}>Lite plan (₹500/mo) or higher required. Current plan: {userPlan}</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center" }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border)",
              borderRadius: 24,
              padding: 24,
              width: "100%",
              maxWidth: 320,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 20 }}>R</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", margin: 0 }}>RetailStacker</h3>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>v1.4.2 · Manifest V3</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                  <span style={{ color: "var(--text-muted)" }}>Platform:</span>
                  <span style={{ color: "white", fontWeight: 600 }}>Chrome (MV3)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                  <span style={{ color: "var(--text-muted)" }}>Target Sites:</span>
                  <span style={{ color: "white", fontWeight: 600 }}>Amazon.in, Meesho, Flipkart</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 2 }}>
                  <span style={{ color: "var(--text-muted)" }}>Calculators:</span>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>India GST & easy Ship</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 24 }}>Everything you get in the Extension</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20, marginBottom: 48 }}>
        {features.map((feat, idx) => {
          const IconComponent = feat.icon;
          return (
            <div 
              key={idx} 
              className="glass-card flex-feature-card" 
              style={{
                padding: "28px 24px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{
                background: `${feat.color}15`,
                border: `1px solid ${feat.color}40`,
                color: feat.color,
                width: 44,
                height: 44,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}>
                <IconComponent size={22} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>{feat.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.55 }}>{feat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 5-Step Installation Dialog */}
      {mounted && installStepsOpen && createPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(10, 22, 40, 0.82)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: 20
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: 18,
            width: "100%",
            maxWidth: 550,
            padding: 32,
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
            position: "relative",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            display: "flex",
            flexDirection: "column",
            animation: "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
          }}>
            <button
              onClick={() => setInstallStepsOpen(false)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                padding: 4
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{
                background: "rgba(6, 182, 212, 0.1)",
                padding: 10,
                borderRadius: 12,
                color: "#00B4D8"
              }}>
                <Download size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>Extension Downloaded!</h3>
                <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0 0" }}>Follow these 5 simple steps to install in Chrome:</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
              {[
                { step: "1", title: "Extract the Zip file", desc: "Locate the downloaded 'retailstacker-extension.zip' file on your computer and extract/unzip it into a folder." },
                { step: "2", title: "Open Chrome Extensions", desc: "Open Google Chrome and navigate to chrome://extensions/ in the URL bar." },
                { step: "3", title: "Enable Developer Mode", desc: "Toggle the Developer mode switch in the top-right corner of the extensions page to ON." },
                { step: "4", title: "Load Unpacked Folder", desc: "Click the Load unpacked button in the top-left corner of the page." },
                { step: "5", title: "Select Extracted Folder", desc: "Browse to the folder you extracted in Step 1 and select it to install. You're ready to stack!" }
              ].map((item) => (
                <div key={item.step} style={{ display: "flex", gap: 14 }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #0C1E36 0%, #00B4D8 100%)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    flexShrink: 0,
                    boxShadow: "0 2px 6px rgba(0, 180, 216, 0.3)"
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1E293B", margin: "0 0 2px 0" }}>{item.title}</h4>
                    <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setInstallStepsOpen(false)}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 10,
                background: "#0C1E36",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(12, 30, 54, 0.2)"
              }}
              className="rs-modal-ok-btn"
            >
              Got it, let's start!
            </button>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .rs-accent-btn {
          background: var(--accent, #1a56db);
          color: white;
          box-shadow: 0 4px 14px var(--accent-glow);
        }
        .rs-accent-btn:hover {
          background: #1e4bb2;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--accent-glow);
        }
        .flex-feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover) !important;
          background: var(--bg-card-hover) !important;
        }
        .hover-link {
          transition: all 0.2s;
        }
        .hover-link:hover {
          color: white !important;
        }
        .rs-modal-ok-btn:hover {
          background: #1a3a60 !important;
          box-shadow: 0 4px 16px rgba(12, 30, 54, 0.3) !important;
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.85);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
