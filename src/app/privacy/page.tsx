"use client";
import PublicNavbar from "@/components/PublicNavbar";

const sections = [
  { id: "information", title: "1. Information We Collect" },
  { id: "use", title: "2. How We Use Your Information" },
  { id: "sharing", title: "3. Sharing of Information" },
  { id: "security", title: "4. Data Security" },
  { id: "retention", title: "5. Data Retention" },
  { id: "rights", title: "6. Your Rights" },
  { id: "third-party", title: "7. Third-Party Services" },
  { id: "children", title: "8. Children's Privacy" },
  { id: "international", title: "9. International Data Transfers" },
  { id: "changes", title: "10. Changes to This Policy" },
  { id: "contact", title: "11. Contact Us" },
];

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <PublicNavbar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 100px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 48, alignItems: "start" }} className="privacy-layout">
        {/* Sticky Sidebar */}
        <div className="privacy-sidebar" style={{ position: "sticky", top: 90, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 16 }}>Contents</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{ textDecoration: "none", padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)", e.currentTarget.style.background = "var(--accent-muted)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)", e.currentTarget.style.background = "transparent")}
              >{s.title}</a>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div>
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent-muted)", border: "1px solid var(--accent)", borderRadius: 50, padding: "6px 18px", fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 24 }}>
              Legal
            </div>
            <h1 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}>Privacy Policy</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Effective Date: May 28, 2026</p>
          </div>

          <div style={{ fontSize: 15, lineHeight: 1.9, color: "var(--text-secondary)" }}>
            <p style={{ marginBottom: 24 }}>Welcome to <strong style={{ color: "var(--text-primary)" }}>RetailStacker</strong> ("Company", "we", "our", or "us"). At RetailStacker, accessible from <a href="https://retailstacker.com" style={{ color: "var(--accent)" }}>https://retailstacker.com</a>, we value your privacy and are committed to protecting your personal information.</p>
            <p style={{ marginBottom: 40 }}>By accessing or using our services, you agree to the practices described in this Privacy Policy.</p>

            {[
              {
                id: "information", title: "1. Information We Collect",
                content: (
                  <>
                    <p style={{ marginBottom: 16 }}><strong style={{ color: "var(--text-primary)" }}>a. Personal Information</strong> — When you register, contact us, subscribe, or use our services, we may collect: Full name, Email address, Phone number, Company name, Billing information, Account login credentials.</p>
                    <p style={{ marginBottom: 16 }}><strong style={{ color: "var(--text-primary)" }}>b. Usage Information</strong> — We automatically collect: IP address, Browser type, Device information, Pages visited, Session duration, Referral URLs, Operating system.</p>
                    <p><strong style={{ color: "var(--text-primary)" }}>c. Cookies and Tracking Technologies</strong> — We use cookies to improve user experience, analyze traffic, remember preferences, and deliver relevant content. You can disable cookies through your browser settings, but some features may not function properly.</p>
                  </>
                )
              },
              {
                id: "use", title: "2. How We Use Your Information",
                content: <p>We use collected information to: provide and maintain services, create and manage user accounts, improve platform functionality, process payments, respond to support requests, send updates and notifications, monitor security, analyze usage trends, and comply with legal obligations.</p>
              },
              {
                id: "sharing", title: "3. Sharing of Information",
                content: (
                  <>
                    <p style={{ marginBottom: 16 }}><strong style={{ color: "var(--success)" }}>We do not sell your personal information.</strong></p>
                    <p style={{ marginBottom: 16 }}><strong style={{ color: "var(--text-primary)" }}>a. Service Providers</strong> — Third-party vendors assisting with hosting, payment processing, analytics, email, customer support, and security.</p>
                    <p style={{ marginBottom: 16 }}><strong style={{ color: "var(--text-primary)" }}>b. Legal Requirements</strong> — We may disclose information to comply with applicable laws, respond to lawful requests, or protect our rights.</p>
                    <p><strong style={{ color: "var(--text-primary)" }}>c. Business Transfers</strong> — If RetailStacker is involved in a merger or acquisition, your information may be transferred as part of that transaction.</p>
                  </>
                )
              },
              {
                id: "security", title: "4. Data Security",
                content: <p>We implement appropriate technical and organizational measures to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no online platform is completely secure, and we cannot guarantee absolute security.</p>
              },
              {
                id: "retention", title: "5. Data Retention",
                content: <p>We retain personal information only as long as necessary to provide services, fulfill legal obligations, resolve disputes, and enforce agreements. When no longer required, we securely delete or anonymize it.</p>
              },
              {
                id: "rights", title: "6. Your Rights",
                content: (
                  <>
                    <p style={{ marginBottom: 16 }}>Depending on your jurisdiction, you may have rights including: access to your personal data, correction of inaccurate information, deletion of your data, restriction of processing, objection to marketing communications, and data portability.</p>
                    <p>To exercise your rights, contact us at: <a href="mailto:privacy@retailstacker.com" style={{ color: "var(--accent)", fontWeight: 600 }}>privacy@retailstacker.com</a></p>
                  </>
                )
              },
              {
                id: "third-party", title: "7. Third-Party Services",
                content: <p>Our platform may contain links to third-party websites or integrations. We are not responsible for the privacy practices or content of those external services. We encourage users to review the privacy policies of any third-party services they access.</p>
              },
              {
                id: "children", title: "8. Children's Privacy",
                content: <p>RetailStacker does not knowingly collect personal information from children under the age of 13. If we become aware that such information has been collected, we will take reasonable steps to delete it promptly.</p>
              },
              {
                id: "international", title: "9. International Data Transfers",
                content: <p>If you access our services from outside the country where our servers are located, your information may be transferred and processed internationally. By using our services, you consent to such transfers where permitted by law.</p>
              },
              {
                id: "changes", title: "10. Changes to This Privacy Policy",
                content: <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Continued use of the platform after updates constitutes acceptance of the revised policy.</p>
              },
              {
                id: "contact", title: "11. Contact Us",
                content: (
                  <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
                    <p style={{ marginBottom: 8 }}><strong style={{ color: "var(--text-primary)" }}>RetailStacker</strong></p>
                    <p>Website: <a href="https://retailstacker.com" style={{ color: "var(--accent)" }}>https://retailstacker.com</a></p>
                    <p>Email: <a href="mailto:privacy@retailstacker.com" style={{ color: "var(--accent)" }}>privacy@retailstacker.com</a></p>
                  </div>
                )
              },
            ].map(section => (
              <div key={section.id} id={section.id} style={{ marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid var(--border)" }}>
                <h2 style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 800, color: "var(--text-primary)", marginBottom: 20 }}>{section.title}</h2>
                {section.content}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .privacy-layout { grid-template-columns: 1fr !important; }
          .privacy-sidebar { position: static !important; }
        }
      `}</style>
    </div>
  );
}
