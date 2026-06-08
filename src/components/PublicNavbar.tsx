"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Download } from "lucide-react";

const NAV_LINKS = [
  { label: "UGC-Video", href: "https://ugc.retailstacker.com" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "About Us", href: "/about" },
];

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [installStepsOpen, setInstallStepsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<{ loggedIn: boolean } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    fetch("/api/extension/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
      })
      .catch((e) => console.error("Error loading navbar session:", e));

    const handleOpenModal = () => {
      setInstallStepsOpen(true);
    };
    window.addEventListener("open-extension-modal", handleOpenModal);
    return () => window.removeEventListener("open-extension-modal", handleOpenModal);
  }, []);

  const handleDownload = async () => {
    try {
      const res = await fetch("/api/extension/auth/me");
      const data = await res.json();
      const allowedPlans = ["Lite", "Starter", "Growth", "Diamond"];

      if (data.loggedIn && data.user && allowedPlans.includes(data.user.plan)) {
        // Trigger download
        const link = document.createElement("a");
        link.href = "/retailstacker-extension.zip";
        link.download = "retailstacker-extension.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show popup
        setInstallStepsOpen(true);
        setMobileOpen(false);
      } else {
        alert("To download the RetailStacker Chrome Extension, please register or log in and subscribe to the Lite Plan (₹500/month) or higher!");
        window.location.href = "/pricing";
      }
    } catch (err) {
      console.error("Failed checking download permission:", err);
      window.location.href = "/pricing";
    }
  };

  return (
    <nav style={{
      padding: "0 40px",
      height: 72,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-primary)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      backdropFilter: "blur(12px)",
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/logo.png" alt="RetailStacker" style={{ width: 36, height: 36 }} />
        <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em", display: "flex", alignItems: "center" }}>
          <span style={{ 
            background: "linear-gradient(135deg, #0C1E36 65%, #00B4D8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block"
          }}>R</span>
          <span style={{ color: "#0C1E36" }}>etail</span>
          <span style={{ color: "#1A56DB" }}>Stacker</span>
        </span>
      </Link>

      {/* Desktop Nav */}
      <div className="public-nav-links" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: pathname === link.href ? "var(--accent)" : "var(--text-secondary)",
              background: pathname === link.href ? "var(--accent-muted)" : "transparent",
              transition: "all 0.2s",
            }}
          >
            {link.label}
          </Link>
        ))}
        <button
          onClick={handleDownload}
          style={{
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
          className="rs-download-btn"
        >
          <Download size={15} />
          Download Extension
        </button>
        {mounted && session?.loggedIn ? (
          <Link href="/dashboard" style={{
            textDecoration: "none",
            padding: "9px 20px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            color: "white",
            background: "var(--accent)",
            boxShadow: "0 4px 12px var(--accent-glow)",
          }}>
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" style={{
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}>
              Login
            </Link>
            <Link href="/login?mode=signup" style={{
              textDecoration: "none",
              padding: "9px 20px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              color: "white",
              background: "var(--accent)",
              boxShadow: "0 4px 12px var(--accent-glow)",
            }}>
              Get Started Free
            </Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", padding: 8 }}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div style={{
          position: "absolute",
          top: 72,
          left: 0,
          right: 0,
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          zIndex: 999,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                color: pathname === link.href ? "var(--accent)" : "var(--text-primary)",
                background: pathname === link.href ? "var(--accent-muted)" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}
          {mounted && session?.loggedIn ? (
            <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={{ textDecoration: "none", padding: "12px 16px", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "white", background: "var(--accent)", textAlign: "center", marginTop: 8 }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} style={{ textDecoration: "none", padding: "12px 16px", borderRadius: 8, fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                Login
              </Link>
              <Link href="/login?mode=signup" onClick={() => setMobileOpen(false)} style={{ textDecoration: "none", padding: "12px 16px", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "white", background: "var(--accent)", textAlign: "center", marginTop: 8 }}>
                Get Started Free
              </Link>
            </>
          )}
          <button
            onClick={handleDownload}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              textAlign: "center",
              marginTop: 4,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            className="rs-download-btn"
          >
            <Download size={16} />
            Download Extension
          </button>
        </div>
      )}

      {/* Installation Steps Dialog */}
      {mounted && installStepsOpen && createPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(10, 22, 40, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: 20
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: 16,
            width: "100%",
            maxWidth: 550,
            padding: 32,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
            position: "relative",
            border: "1px solid var(--border)",
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

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
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

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
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
                padding: "12px",
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
        @media (max-width: 768px) {
          .public-nav-links { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        .rs-download-btn {
          background: var(--accent-muted, rgba(26, 86, 219, 0.08)) !important;
          border: 1px solid var(--accent, #1a56db) !important;
          color: var(--accent, #1a56db) !important;
          transition: all 0.2s !important;
        }
        .rs-download-btn:hover {
          background: var(--accent, #1a56db) !important;
          border-color: var(--accent, #1a56db) !important;
          color: white !important;
          box-shadow: 0 4px 12px var(--accent-glow, rgba(26, 86, 219, 0.2)) !important;
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
    </nav>
  );
}
