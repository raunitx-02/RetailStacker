"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Search, HelpCircle, X, Send, Check, CheckCheck, ArrowRight, ChevronDown } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";

const NOTIFICATIONS = [
  { id: 1, type: "alert", icon: "🚨", title: "BSR Drop Detected", body: "ASIN B08XYZ123 BSR dropped from #1,200 to #2,800 in last 24h.", time: "5 min ago", read: false },
  { id: 2, type: "success", icon: "🎉", title: "Keyword Ranked!", body: "'bamboo cutting board' is now in Top 10 on Amazon India.", time: "2 hr ago", read: false },
  { id: 3, type: "warning", icon: "⚠️", title: "Low Inventory Alert", body: "Only 12 units left for 'Stainless Steel Bottle'. Reorder now!", time: "5 hr ago", read: false },
  { id: 4, type: "info", icon: "📊", title: "Weekly Report Ready", body: "Your Week 19 performance report is ready to download.", time: "1 day ago", read: true },
  { id: 5, type: "info", icon: "💡", title: "AI Copilot Insight", body: "Your conversion rate on ASIN B09ABC456 can be improved by 18% with updated images.", time: "2 days ago", read: true },
];

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{
      position: "fixed", top: 64, right: 0, width: 400, height: "calc(100vh - 64px)",
      background: "var(--bg-card)", borderLeft: "1px solid var(--border)",
      boxShadow: "-8px 0 32px rgba(0,0,0,0.1)", zIndex: 1000,
      display: "flex", flexDirection: "column",
      animation: "slideInRight 0.25s ease",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>Notifications</h3>
          {unreadCount > 0 && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{unreadCount} unread</p>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-ghost" style={{ fontSize: 12, padding: "6px 10px", display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          <button onClick={onClose} className="btn-ghost" style={{ padding: 6, display: "flex" }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
            style={{
              padding: 16, borderRadius: 12, cursor: "pointer",
              background: n.read ? "var(--bg-secondary)" : "var(--accent-muted)",
              border: `1px solid ${n.read ? "var(--border)" : "var(--accent)"}`,
              transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{n.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{n.title}</span>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 4 }} />}
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 6 }}>{n.body}</p>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{n.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 16, borderTop: "1px solid var(--border)" }}>
        <button className="btn-ghost" style={{ width: "100%", fontSize: 13, justifyContent: "center", display: "flex", gap: 6 }}>
          View All Notifications <ArrowRight size={14} />
        </button>
      </div>

      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim() || !subject.trim()) return;
    setSent(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "relative", background: "var(--bg-card)",
        border: "1px solid var(--border)", borderRadius: 20, padding: 40,
        width: "100%", maxWidth: 480, zIndex: 10,
        animation: "popIn 0.25s ease",
      }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--success-muted)", border: "2px solid var(--success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Check size={28} color="var(--success)" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)", marginBottom: 8 }}>Message Sent!</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Our support team will respond within 24 hours.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)" }}>Contact Support</h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>We typically respond within 24 hours</p>
              </div>
              <button onClick={onClose} className="btn-ghost" style={{ padding: 8, display: "flex" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              {["Bug Report", "Billing", "Feature Request", "General"].map(tag => (
                <button key={tag} onClick={() => setSubject(tag)} className="btn-ghost" style={{
                  fontSize: 12, padding: "6px 12px", borderRadius: 20,
                  background: subject === tag ? "var(--accent-muted)" : undefined,
                  border: subject === tag ? "1px solid var(--accent)" : undefined,
                  color: subject === tag ? "var(--accent)" : undefined,
                }}>{tag}</button>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>SUBJECT</label>
              <input className="input-field" placeholder="Briefly describe your issue" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>MESSAGE</label>
              <textarea
                className="input-field"
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
            <button onClick={handleSend} disabled={!message || !subject} className="btn-accent" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Send size={16} /> Send Message
            </button>
          </>
        )}
        <style>{`@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    </div>
  );
}

export default function Topbar({ title, user = "User", plan = "Starter" }: { title?: string; user?: string; plan?: string }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [market, setMarket] = useState("amazon");
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  const initials = user?.split("@")[0]?.slice(0, 2).toUpperCase() || "U";

  // Close notification panel on outside click
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // allow bell button clicks
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header style={{
        height: 64,
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-card)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 40,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--bg-secondary)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "8px 14px", width: 280,
          }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              placeholder="Search tools, keywords, ASINs..."
              style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 13, width: "100%", fontFamily: "Inter, sans-serif" }}
            />
          </div>

          {/* Marketplace Switcher */}
          <div style={{ display: "flex", alignItems: "center", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: 4, gap: 2 }}>
            {[
              { id: "amazon", label: "🛒 Amazon", color: "#FF9900" },
              { id: "flipkart", label: "🛍️ Flipkart", color: "#047BD5" },
              { id: "meesho", label: "🏪 Meesho", color: "#9B30FF" },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMarket(m.id)}
                style={{
                  padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                  background: market === m.id ? m.color : "transparent",
                  color: market === m.id ? "white" : "var(--text-muted)",
                  transition: "all 0.15s",
                }}
              >{m.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />

          {/* Notification Bell */}
          <button
            id="notif-bell"
            onClick={() => setNotifOpen(v => !v)}
            className="btn-ghost"
            style={{ position: "relative", padding: "8px", display: "flex", background: notifOpen ? "var(--accent-muted)" : undefined }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4,
                minWidth: 16, height: 16, padding: "0 4px",
                background: "var(--danger)", borderRadius: 8,
                border: "2px solid var(--bg-card)",
                fontSize: 9, fontWeight: 800, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{unreadCount}</span>
            )}
          </button>

          {/* Contact / Help */}
          <button onClick={() => setContactOpen(true)} className="btn-ghost" style={{ padding: "8px", display: "flex" }} title="Contact Support">
            <HelpCircle size={18} />
          </button>

          {/* Plan badge */}
          <div style={{
            background: plan === "Diamond" ? "var(--purple-muted)" : plan === "Growth" ? "var(--accent-muted)" : "var(--bg-secondary)",
            border: `1px solid ${plan === "Diamond" ? "var(--purple)" : plan === "Growth" ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700,
            color: plan === "Diamond" ? "var(--purple)" : plan === "Growth" ? "var(--accent)" : "var(--text-primary)",
            letterSpacing: "0.05em", textTransform: "uppercase" as const,
          }}>
            {plan === "Diamond" ? "💎 " : plan === "Growth" ? "⭐ " : ""}{plan}
          </div>

          {/* Profile Avatar */}
          <Link href="/profile" style={{ textDecoration: "none" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--accent)", display: "flex", alignItems: "center",
              justifyContent: "center", color: "white", fontWeight: 800, fontSize: 13,
              cursor: "pointer", boxShadow: "0 0 0 2px var(--accent-muted)",
              transition: "box-shadow 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-muted)")}
              title="My Profile"
            >
              {initials}
            </div>
          </Link>
        </div>
      </header>

      {/* Notification Panel */}
      {notifOpen && (
        <div ref={panelRef}>
          <NotificationPanel onClose={() => setNotifOpen(false)} />
        </div>
      )}

      {/* Contact Modal */}
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </>
  );
}
