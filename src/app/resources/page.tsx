import { BookOpen } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

export default function ResourcesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", display: "flex", flexDirection: "column" }}>
      <PublicNavbar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--purple-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <BookOpen size={40} color="var(--purple)" />
        </div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: 16 }}>Seller Resources</h1>
        <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--text-muted)", maxWidth: 600 }}>
          We are currently building the ultimate library of case studies, video tutorials, and webinars to help you master Amazon India, Flipkart, and Meesho.
        </p>
        <div style={{ marginTop: 40, padding: "12px 24px", background: "var(--accent-muted)", color: "var(--accent)", borderRadius: 50, fontWeight: 700 }}>
          Coming Soon
        </div>
      </div>
    </div>
  );
}
