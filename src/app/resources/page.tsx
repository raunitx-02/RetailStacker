import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function ResourcesPage() {
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
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--purple-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <BookOpen size={40} color="var(--purple)" />
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>Seller Resources</h1>
        <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 600 }}>
          We are currently building the ultimate library of case studies, video tutorials, and webinars to help you master Amazon India, Flipkart, and Meesho.
        </p>
        <div style={{ marginTop: 40, padding: "12px 24px", background: "var(--accent-muted)", color: "var(--accent)", borderRadius: 50, fontWeight: 700 }}>
          Coming Soon
        </div>
      </div>
    </div>
  );
}
