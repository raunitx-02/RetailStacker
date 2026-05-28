import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

export default function EnterprisePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "32px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "var(--accent)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 18 }}>N</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20 }}>RetailStacker</span>
        </Link>
        <Link href="/" style={{ textDecoration: "none", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </nav>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--warning-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Building2 size={40} color="var(--warning)" />
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>RetailStacker Enterprise Solutions</h1>
        <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 600 }}>
          Custom APIs, dedicated account managers, and bulk intelligence reporting for Top 100 brands and large-scale marketing agencies.
        </p>
        <div style={{ marginTop: 40, padding: "12px 24px", background: "var(--accent-muted)", color: "var(--accent)", borderRadius: 50, fontWeight: 700 }}>
          Contact Sales (Coming Soon)
        </div>
      </div>
    </div>
  );
}
