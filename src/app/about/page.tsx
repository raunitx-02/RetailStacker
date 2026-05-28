import PublicNavbar from "@/components/PublicNavbar";
import { CheckCircle, Eye, Users, TrendingUp, Lightbulb } from "lucide-react";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <PublicNavbar />

      {/* Hero */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent-muted)", border: "1px solid var(--accent)", borderRadius: 50, padding: "6px 18px", fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 32 }}>
          Our Story
        </div>
        <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 24, lineHeight: 1.1 }}>
          Built by Sellers,<br />for Sellers.
        </h1>
        <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: 720, margin: "0 auto" }}>
          We believe successful eCommerce businesses are built on smart decisions, data-driven product research, and deep market understanding. Our mission is to help sellers discover winning products faster and make confident business decisions with the power of intelligent product hunting.
        </p>
      </section>

      {/* Origin Story */}
      <section style={{ maxWidth: 860, margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 20, padding: "clamp(32px, 5vw, 56px)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, var(--accent), var(--purple))" }} />
          <div style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "var(--text-secondary)", lineHeight: 2 }}>
            <p style={{ marginBottom: 24 }}>
              <strong style={{ color: "var(--text-primary)" }}>This software was born from real industry experience — not theory.</strong>
            </p>
            <p style={{ marginBottom: 24 }}>
              After spending <strong style={{ color: "var(--accent)" }}>8+ years working directly in eCommerce</strong> and over <strong style={{ color: "var(--accent)" }}>18 years across multiple industries</strong>, we experienced firsthand the challenges sellers face every day: finding profitable products, analyzing market trends, understanding competition, and reducing the risks involved in launching new products.
            </p>
            <p style={{ marginBottom: 24 }}>
              We realized that most sellers spend countless hours researching products manually, switching between tools, and making decisions based on incomplete information. That's why we created a platform designed to <strong style={{ color: "var(--text-primary)" }}>simplify the entire product discovery process.</strong>
            </p>
            <p>
              Our software helps entrepreneurs, online sellers, and growing brands uncover product opportunities through smart analytics, market insights, and efficient research tools — all in one place. Whether you are just starting your eCommerce journey or scaling an established business, our goal is to give you the data and confidence needed to <strong style={{ color: "var(--text-primary)" }}>stay ahead in a competitive market.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section style={{ maxWidth: 1100, margin: "0 auto 80px", padding: "0 24px" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, textAlign: "center", marginBottom: 16, letterSpacing: "-0.02em" }}>What Makes Us Different</h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 16, marginBottom: 56 }}>We're not just another SaaS tool. We are your unfair advantage.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {[
            { icon: <Users size={24} color="var(--accent)" />, title: "Built by Real Professionals", desc: "Built by real eCommerce professionals with hands-on industry experience — not by people who have only read about it." },
            { icon: <TrendingUp size={24} color="var(--success)" />, title: "Saves Time & Money", desc: "Designed to save time and reduce product research guesswork so you can focus on growing, not searching." },
            { icon: <Lightbulb size={24} color="var(--warning)" />, title: "Practical Insights", desc: "Focused on practical insights that help sellers make profitable decisions, not vanity metrics." },
            { icon: <CheckCircle size={24} color="var(--purple)" />, title: "Always Evolving", desc: "Continuously evolving based on real user needs and market trends. Your feedback shapes the product." },
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: 32, textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--bg-primary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                {item.icon}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision */}
      <section style={{ maxWidth: 900, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ background: "linear-gradient(135deg, var(--accent-muted), var(--purple-muted))", border: "1px solid var(--accent)", borderRadius: 20, padding: "clamp(40px, 6vw, 72px)", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", borderRadius: 50, padding: "6px 18px", fontSize: 13, fontWeight: 700, color: "white", marginBottom: 24 }}>
            <Eye size={14} /> Our Vision
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Empowering eCommerce Sellers<br />Around the World
          </h2>
          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto 32px" }}>
            We aim to empower eCommerce sellers around the world with smarter tools, better insights, and a simpler way to discover winning products.
          </p>
          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.8 }}>
            "Because behind every successful online store is a great product —<br />and behind every great product is smart research."
          </p>
          <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid var(--border)", fontSize: 15, color: "var(--text-secondary)", fontWeight: 600 }}>
            Thank you for being part of our journey. 🙏
          </div>
        </div>
      </section>
    </div>
  );
}
