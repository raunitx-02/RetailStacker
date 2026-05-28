"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "About Us", href: "/about" },
];

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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
        <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em" }}>RetailStacker</span>
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
          <Link href="/login" onClick={() => setMobileOpen(false)} style={{ textDecoration: "none", padding: "12px 16px", borderRadius: 8, fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
            Login
          </Link>
          <Link href="/login?mode=signup" onClick={() => setMobileOpen(false)} style={{ textDecoration: "none", padding: "12px 16px", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "white", background: "var(--accent)", textAlign: "center", marginTop: 8 }}>
            Get Started Free
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .public-nav-links { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
