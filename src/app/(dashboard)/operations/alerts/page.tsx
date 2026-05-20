"use client";
import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, ShieldAlert, CheckCircle, X, Settings, Info, Play } from "lucide-react";
import confetti from "canvas-confetti";

interface Alert {
  id: number;
  type: string;
  asin: string;
  product: string;
  message: string;
  time: string;
  status: "Critical" | "Warning" | "Resolved";
  read: boolean;
}

const DEFAULT_ALERTS: Alert[] = [
  { id: 1, type: "Hijacker Alert", asin: "B08XYZ1234", product: "Premium Bamboo Cutting Board", message: "A new third-party seller 'FastShip_Store' has listed on your ASIN at a 15% discount. Check buy box status immediately.", time: "2 min ago", status: "Critical", read: false },
  { id: 2, type: "Title Hijacked", asin: "B09ABC5678", product: "Stainless Steel Water Bottle", message: "Your product listing title was modified in Category catalog. Automatically scheduled template rollback.", time: "47 min ago", status: "Warning", read: false },
  { id: 3, type: "Buy Box Lost", asin: "B08XYZ1234", product: "Premium Bamboo Cutting Board", message: "Lost primary seller buy box status to 'GreenDeals_IN'. Buy box win rate decreased to 52%.", time: "1 hr ago", status: "Critical", read: false },
  { id: 4, type: "Listing Suppressed", asin: "B07DEF9012", product: "Silicone Kitchen Utensil Set", message: "Main product search node suppressed due to non-compliant white background density. Re-upload main asset.", time: "3 hrs ago", status: "Critical", read: false },
  { id: 5, type: "1-Star Feedback", asin: "B09ABC5678", product: "Stainless Steel Water Bottle", message: "Critical buyer rating received. Review detail: 'Cap leaks whenever bottle is tilted horizontally.'", time: "5 hrs ago", status: "Warning", read: false },
  { id: 6, type: "Competitor Price Cut", asin: "B0AGHI012", product: "Yoga Mat Non-Slip", message: "Main competitor 'YogaPrime' lowered their pricing to ₹1,499. High risk of search volume redirection.", time: "8 hrs ago", status: "Warning", read: true },
  { id: 7, type: "Buy Box Reclaimed", asin: "B07DEF9012", product: "Silicone Kitchen Utensil Set", message: "Successfully regained primary seller Buy Box share. Active winning percentage: 99%.", time: "12 hrs ago", status: "Resolved", read: true },
];

const statusColors: Record<string, string> = { Critical: "badge-danger", Warning: "badge-warning", Resolved: "badge-success" };

const typeIcons: Record<string, React.ReactNode> = {
  "Hijacker Alert": <ShieldAlert size={16} color="var(--danger)" />,
  "Title Hijacked": <AlertTriangle size={16} color="var(--warning)" />,
  "Buy Box Lost": <ShieldAlert size={16} color="var(--danger)" />,
  "Listing Suppressed": <X size={16} color="var(--danger)" />,
  "1-Star Feedback": <Bell size={16} color="var(--warning)" />,
  "Competitor Price Cut": <AlertTriangle size={16} color="var(--warning)" />,
  "Buy Box Reclaimed": <CheckCircle size={16} color="var(--success)" />,
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<"All" | "Critical" | "Warning" | "Resolved">("All");
  
  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    whatsappAlerts: true,
    hijackerTreshold: "immediate"
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const savedAlerts = localStorage.getItem("neon10_operations_alerts");
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      } else {
        setAlerts(DEFAULT_ALERTS);
        localStorage.setItem("neon10_operations_alerts", JSON.stringify(DEFAULT_ALERTS));
      }

      const savedSettings = localStorage.getItem("neon10_alert_settings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.error(e);
      setAlerts(DEFAULT_ALERTS);
    }
  }, []);

  const saveAlertsToStorage = (updated: Alert[]) => {
    setAlerts(updated);
    localStorage.setItem("neon10_operations_alerts", JSON.stringify(updated));
  };

  const markAllRead = () => {
    const updated = alerts.map(a => ({ ...a, read: true }));
    saveAlertsToStorage(updated);
  };

  const dismissAlert = (id: number) => {
    const updated = alerts.filter(a => a.id !== id);
    saveAlertsToStorage(updated);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("neon10_alert_settings", JSON.stringify(settings));
    setIsSettingsOpen(false);
    confetti({ particleCount: 30, spread: 30 });
  };

  const handleSimulateAlert = () => {
    const simulationTypes = [
      { type: "Hijacker Alert", asin: "B09ABC5678", product: "Insulated Water Bottle", message: "New Chinese merchant 'SellersDirect_CN' hijacked listing offering parallel distribution.", status: "Critical" },
      { type: "Listing Suppressed", asin: "B0AGHI012", product: "Yoga Mat Non-Slip", message: "Listing flagged due to high customer return rate on material degradation.", status: "Critical" },
      { type: "Competitor Price Cut", asin: "B08XYZ1234", product: "Premium Bamboo Cutting Board", message: "Price floor violated by vendor 'EcoChef' slicing prices to ₹1,800.", status: "Warning" }
    ];

    const pick = simulationTypes[Math.floor(Math.random() * simulationTypes.length)];
    const newAlert: Alert = {
      id: Date.now(),
      type: pick.type,
      asin: pick.asin,
      product: pick.product,
      message: pick.message,
      time: "Just now",
      status: pick.status as any,
      read: false
    };

    const updated = [newAlert, ...alerts];
    saveAlertsToStorage(updated);

    // Dynamic warning vibration / confetti pop
    confetti({ particleCount: 30, spread: 25, colors: ["#ef4444", "#f59e0b"] });
  };

  const handleResolveAlert = (id: number) => {
    const updated = alerts.map(a => a.id === id ? { ...a, status: "Resolved" as const, read: true } : a);
    saveAlertsToStorage(updated);
    setActiveAlert(null);
    confetti({ particleCount: 50, spread: 45 });
  };

  const filtered = filter === "All" ? alerts : alerts.filter(a => a.status === filter);
  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Alerts</h1>
          <p className="page-subtitle">Real-time active listener filters tracking buy boxes, suppressions, hijackers, and ratings</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost" onClick={handleSimulateAlert} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Play size={13} color="var(--accent)" /> Simulate Threat
          </button>
          {unreadCount > 0 && <button className="btn-ghost" onClick={markAllRead}>Mark Read ({unreadCount})</button>}
          <button className="btn-accent" style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={() => setIsSettingsOpen(true)}>
            <Settings size={15} /> Configure Preferences
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Notifications", value: alerts.length, color: "var(--text-secondary)" },
          { label: "Critical Incidents", value: alerts.filter(a => a.status === "Critical").length, color: "var(--danger)" },
          { label: "System Warnings", value: alerts.filter(a => a.status === "Warning").length, color: "var(--warning)" },
          { label: "Resolved Actions", value: alerts.filter(a => a.status === "Resolved").length, color: "var(--success)" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* FILTER TABS */}
      <div className="tabs" style={{ marginBottom: 20, maxWidth: 400 }}>
        {(["All", "Critical", "Warning", "Resolved"] as const).map(f => (
          <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* ALERTS FEED CONTAINER */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>
              No alerts found matching "{filter}". Your brand portals are fully operational.
            </div>
          ) : (
            filtered.map(alert => (
              <div 
                key={alert.id} 
                style={{
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: 16,
                  padding: "16px 20px", 
                  borderRadius: 12,
                  background: !alert.read ? "rgba(255,107,53,0.04)" : "rgba(0,0,0,0.15)",
                  border: `1px solid ${!alert.read ? "var(--accent-muted)" : "var(--border)"}`,
                  transition: "all 0.2s",
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {typeIcons[alert.type] || <Bell size={16} color="var(--text-secondary)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{alert.type}</span>
                    <span className={`badge ${statusColors[alert.status]}`} style={{ fontSize: 11 }}>{alert.status}</span>
                    {!alert.read && <span className="badge badge-accent" style={{ fontSize: 10 }}>NEW</span>}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6, lineHeight: 1.5 }}>{alert.message}</p>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>{alert.asin}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>·</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{alert.product}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>·</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{alert.time}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button 
                    className="btn-ghost" 
                    style={{ fontSize: 12, padding: "6px 12px" }}
                    onClick={() => {
                      // Mark read on click
                      const updated = alerts.map(a => a.id === alert.id ? { ...a, read: true } : a);
                      saveAlertsToStorage(updated);
                      setActiveAlert(alert);
                    }}
                  >
                    Inspect
                  </button>
                  <button 
                    onClick={() => dismissAlert(alert.id)} 
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 6, borderRadius: 6 }}
                    title="Dismiss alert"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* INSPECT ALERT DETAILS DRAWER MODAL */}
      {activeAlert && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-card" style={{ width: 480, padding: 28, position: "relative" }}>
            <button 
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              onClick={() => setActiveAlert(null)}
            >
              <X size={20} />
            </button>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {typeIcons[activeAlert.type] || <Bell size={18} />}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{activeAlert.type}</h3>
                <span className={`badge ${statusColors[activeAlert.status]}`}>{activeAlert.status}</span>
              </div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 10, border: "1px solid var(--border)", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>INCIDENT SUMMARY</div>
              <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>{activeAlert.message}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24, fontSize: 13 }}>
              <div>
                <div style={{ color: "var(--text-muted)" }}>Target Product</div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>{activeAlert.product}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)" }}>Target ASIN</div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "monospace", marginTop: 2 }}>{activeAlert.asin}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setActiveAlert(null)}>Close</button>
              {activeAlert.status !== "Resolved" && (
                <button className="btn-accent" style={{ flex: 1 }} onClick={() => handleResolveAlert(activeAlert.id)}>
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURE PREFERENCES MODAL */}
      {isSettingsOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-card" style={{ width: 440, padding: 28, position: "relative" }}>
            <button 
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              onClick={() => setIsSettingsOpen(false)}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Alert Preferences</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Configure automatic delivery integration channels.</p>

            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { key: "emailAlerts", label: "Email Dispatcher Notifications", desc: "Sends critical logs to connected developer email" },
                { key: "whatsappAlerts", label: "WhatsApp Automated Alerts", desc: "Push direct seller updates to mobile phones" },
                { key: "smsAlerts", label: "SMS Backup Notifications", desc: "Standard text message alerts on hijacker buy box losses" }
              ].map(item => (
                <div key={item.key} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <label className="toggle" style={{ marginTop: 2 }}>
                    <input 
                      type="checkbox" 
                      checked={settings[item.key as keyof typeof settings] as boolean} 
                      onChange={e => setSettings({ ...settings, [item.key]: e.target.checked })} 
                    />
                    <span className="toggle-slider" />
                  </label>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setIsSettingsOpen(false)}>Cancel</button>
                <button type="submit" className="btn-accent" style={{ flex: 1 }}>Save Settings</button>
              </div>
            </form>
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
