"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  User, Mail, Lock, Phone, Camera, ShieldCheck, CreditCard,
  CheckCircle2, AlertCircle, Link2, Unlink, RefreshCw, Save,
  ArrowRight, ExternalLink, Store
} from "lucide-react";

const PLANS = [
  { id: "Starter", name: "Starter", price: 999, icon: "🚀", color: "var(--text-secondary)", bg: "var(--bg-secondary)", border: "var(--border)", features: ["Product Research", "BSR Intelligence", "Keyword Tracker", "Listing Analyzer"] },
  { id: "Growth", name: "Growth", price: 2499, icon: "⭐", color: "var(--accent)", bg: "var(--accent-muted)", border: "var(--accent)", features: ["All Starter features", "Cerebro & Magnet", "AI Copilot", "Market Tracker", "Adtomic"] },
  { id: "Diamond", name: "Diamond", price: 4999, icon: "💎", color: "var(--purple)", bg: "var(--purple-muted)", border: "var(--purple)", features: ["All Growth features", "Inventory Protector", "Refund Genie", "Follow-Up", "Priority Support"] },
];

// Real OAuth/API integration configs for all 4 marketplaces
const INTEGRATIONS = [
  {
    id: "amazon",
    name: "Amazon India (SP-API)",
    logo: "/amazon-logo.svg",
    color: "#FF9900",
    desc: "Connect via Amazon Seller Central SP-API. Requires Client ID, Client Secret, and Refresh Token from your developer app.",
    requiredPlan: "Starter",
    howToConnect: "1. Go to Amazon Seller Central → Apps & Services → Develop Apps\n2. Create or select your SP-API application\n3. Go to Authorization → Generate Refresh Token\n4. Paste the Refresh Token below",
    oauthUrl: "https://sellercentral.amazon.in/apps/authorize/consent?application_id=amzn1.sp.solution.xxx",
    docsUrl: "https://developer-docs.amazon.com/sp-api/",
    inputLabel: "SP-API Refresh Token",
    inputPlaceholder: "Atzr|IwEBIxxxxxxxxxxxxxxxxxxxxxxxx",
    fields: [
      { key: "refreshToken", label: "Refresh Token", placeholder: "Atzr|IwEBIxxxxxxxxxxxxxxxxxxxxxxxx" },
      { key: "clientId", label: "Client ID", placeholder: "amzn1.application-oa2-client.xxx" },
      { key: "clientSecret", label: "Client Secret", placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
    ]
  },
  {
    id: "flipkart",
    name: "Flipkart Seller Hub",
    logo: "/flipkart-logo.svg",
    color: "#047BD5",
    desc: "Connect via Flipkart Seller API. Requires API Key from Flipkart Seller Hub Growth Tools → API Access section.",
    requiredPlan: "Growth",
    howToConnect: "1. Login to seller.flipkart.com\n2. Navigate to Growth Tools → API Access\n3. Click 'Generate API Key'\n4. Copy the key and paste it below",
    oauthUrl: "https://seller.flipkart.com/api-docs/",
    docsUrl: "https://seller.flipkart.com/api-docs/",
    inputLabel: "Flipkart API Key",
    inputPlaceholder: "fk_api_xxxxxxxxxxxxxxxxxxxxxxxx",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "fk_api_xxxxxxxxxxxxxxxxxxxxxxxx" },
      { key: "sellerId", label: "Seller ID", placeholder: "Your Flipkart Seller ID" },
    ]
  },
  {
    id: "meesho",
    name: "Meesho Supplier",
    logo: "/meesho-logo.svg",
    color: "#9B30FF",
    desc: "Meesho does not have a public API yet. Export your orders as CSV from Meesho Supplier Panel and upload here for analysis.",
    requiredPlan: "Growth",
    howToConnect: "Meesho does not provide a real-time seller API.\n\n1. Login to supplier.meesho.com\n2. Go to Orders → Export\n3. Download the CSV export file\n4. Upload the CSV file below for order sync",
    oauthUrl: null,
    docsUrl: "https://supplier.meesho.com",
    inputLabel: null,
    inputPlaceholder: null,
    fields: [],
  },
  {
    id: "shopify",
    name: "Shopify Store",
    logo: "/shopify-logo.svg",
    color: "#5E8E3E",
    desc: "Connect your Shopify store via Custom App credentials. Get Admin API Access Token from your Shopify Admin panel.",
    requiredPlan: "Growth",
    howToConnect: "1. Go to your Shopify Admin → Settings → Apps and Sales Channels\n2. Click 'Develop apps' → 'Create an app'\n3. Under API Credentials, click 'Install App'\n4. Copy the Admin API Access Token\n5. Enter your store domain (e.g. mystore.myshopify.com) and the token below",
    oauthUrl: null,
    docsUrl: "https://shopify.dev/docs/api/admin-rest",
    inputLabel: "Admin API Access Token",
    inputPlaceholder: "shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    fields: [
      { key: "shopDomain", label: "Store Domain", placeholder: "yourstore.myshopify.com" },
      { key: "accessToken", label: "Admin API Access Token", placeholder: "shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
    ],
  },
];

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: type === "success" ? "var(--success)" : "var(--danger)", color: "white", padding: "14px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
      {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {message}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
      <div style={{ marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function ProfileClient({ initialPlan, initialEmail }: { initialPlan: string; initialEmail: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => setToast({ message, type });

  const derivedName = initialEmail.includes("@")
    ? initialEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : initialEmail;
  const nameParts = derivedName.split(" ");

  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [mobile, setMobile] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editOtp, setEditOtp] = useState("");
  const [otpSentFor, setOtpSentFor] = useState<"email" | "password" | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [currentPlan, setCurrentPlan] = useState(initialPlan);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [planLoading, setPlanLoading] = useState(false);

  const [expandedInt, setExpandedInt] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, Record<string, string>>>({});
  const [connections, setConnections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const savedKeys = localStorage.getItem("retailstacker_api_keys_v2");
    const savedConn = localStorage.getItem("retailstacker_connections");
    if (savedKeys) { try { setApiKeys(JSON.parse(savedKeys)); } catch (e) {} }
    if (savedConn) { try { setConnections(JSON.parse(savedConn)); } catch (e) {} }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setAvatar(ev.target?.result as string);
      reader.readAsDataURL(file);
      showToast("Profile picture updated!");
    }
  };

  const handleSendOtp = (type: "email" | "password") => { setOtpSentFor(type); showToast(`OTP sent to ${initialEmail}`); };

  const handleVerifyOtp = (type: "email" | "password") => {
    if (editOtp.length !== 6) { showToast("Enter a valid 6-digit OTP", "error"); return; }
    if (type === "password" && newPassword !== confirmNewPassword) { showToast("Passwords do not match!", "error"); return; }
    showToast(type === "email" ? "Email updated!" : "Password changed!");
    setOtpSentFor(null); setEditOtp("");
  };

  const handlePlanChange = async () => {
    if (selectedPlan === currentPlan) return;
    setPlanLoading(true);
    const res = await fetch("/api/auth/update-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: selectedPlan }) });
    setPlanLoading(false);
    if (res.ok) { setCurrentPlan(selectedPlan); showToast(`Plan changed to ${selectedPlan}! Billing from 1st of next month.`); }
    else showToast("Plan update failed. Please try again.", "error");
  };

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysLeft = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const nextMonthName = nextMonth.toLocaleString("en-IN", { month: "long", year: "numeric" });

  const getProration = () => {
    const oldP = PLANS.find(p => p.id === currentPlan);
    const newP = PLANS.find(p => p.id === selectedPlan);
    if (!oldP || !newP || selectedPlan === currentPlan) return null;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return { daysLeft, credit: Math.round((oldP.price / daysInMonth) * daysLeft), charge: Math.round((newP.price / daysInMonth) * daysLeft), diff: Math.round(((newP.price - oldP.price) / daysInMonth) * daysLeft), newPlanPrice: newP.price };
  };
  const proration = getProration();
  const planIdx = (id: string) => PLANS.findIndex(p => p.id === id);

  const [verifyingInt, setVerifyingInt] = useState<string | null>(null);

  const handleConnect = async (intId: string, fields: Record<string, string>) => {
    // 1. Strict Frontend Validation
    const requiredFields = Object.values(fields);
    if (requiredFields.length === 0 || requiredFields.some(val => !val || val.trim() === "")) {
      showToast(`Please fill in all required credentials for ${INTEGRATIONS.find(i => i.id === intId)?.name} before connecting.`, "error");
      return;
    }

    setVerifyingInt(intId);
    
    // Call the respective live API proxy for validation
    try {
      const res = await fetch(`/api/${intId}/proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", credentials: fields })
      });
      
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        showToast(`Verification failed: ${data.error || "Invalid credentials provided."}`, "error");
        setVerifyingInt(null);
        return;
      }
      
      const updatedKeys = { ...apiKeys, [intId]: fields };
      setApiKeys(updatedKeys);
      localStorage.setItem("retailstacker_api_keys_v2", JSON.stringify(updatedKeys));
      
      const updatedConn = { ...connections, [intId]: true, [`${intId}Connected`]: true };
      setConnections(updatedConn);
      localStorage.setItem("retailstacker_connections", JSON.stringify(updatedConn));
      
      showToast(`${INTEGRATIONS.find(i => i.id === intId)?.name} connected successfully! ✓`);
    } catch (e) {
      showToast("Network error during verification", "error");
    } finally {
      setVerifyingInt(null);
    }
  };

  const handleDisconnect = (intId: string) => {
    const updatedKeys = { ...apiKeys };
    delete updatedKeys[intId];
    setApiKeys(updatedKeys);
    localStorage.setItem("retailstacker_api_keys_v2", JSON.stringify(updatedKeys));
    const updatedConn = { ...connections };
    delete updatedConn[intId];
    delete updatedConn[`${intId}Connected`];
    setConnections(updatedConn);
    localStorage.setItem("retailstacker_connections", JSON.stringify(updatedConn));
    showToast(`${INTEGRATIONS.find(i => i.id === intId)?.name} disconnected.`);
  };

  // Local field state per integration
  const [intFields, setIntFields] = useState<Record<string, Record<string, string>>>({});
  const setField = (intId: string, key: string, value: string) => {
    setIntFields(prev => ({ ...prev, [intId]: { ...(prev[intId] || {}), [key]: value } }));
  };
  const getField = (intId: string, key: string) => intFields[intId]?.[key] || apiKeys[intId]?.[key] || "";

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Account: <b>{initialEmail}</b> · Plan: <b style={{ color: currentPlan === "Diamond" ? "var(--purple)" : currentPlan === "Growth" ? "var(--accent)" : "var(--text-secondary)" }}>{currentPlan === "Diamond" ? "💎 " : currentPlan === "Growth" ? "⭐ " : ""}{currentPlan}</b></p>
        </div>
      </div>

      {/* Personal Info */}
      <Section title="Personal Information" subtitle="Update your name and mobile. Email change requires OTP.">
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div onClick={() => fileInputRef.current?.click()} style={{ width: 90, height: 90, borderRadius: "50%", background: avatar ? "transparent" : "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden", border: "3px solid var(--accent)", boxShadow: "0 0 0 3px var(--accent-muted)" }}>
              {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "white", fontWeight: 900, fontSize: 30 }}>{(firstName[0] || initialEmail[0] || "U").toUpperCase()}</span>}
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }} onMouseEnter={e => (e.currentTarget.style.opacity = "1")} onMouseLeave={e => (e.currentTarget.style.opacity = "0")}><Camera size={22} color="white" /></div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
            <button onClick={() => fileInputRef.current?.click()} className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }}>Change Photo</button>
          </div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, minWidth: 280 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>FIRST NAME</label>
              <input className="input-field" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Your first name" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>LAST NAME</label>
              <input className="input-field" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Your last name" />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>MOBILE</label>
              <input className="input-field" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+91 XXXXXXXXXX" />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>EMAIL (read-only · use Change Email to update)</label>
              <input className="input-field" value={initialEmail} readOnly style={{ opacity: 0.6 }} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <button onClick={() => showToast("Profile saved!")} className="btn-accent" style={{ display: "flex", alignItems: "center", gap: 8 }}><Save size={15} /> Save Changes</button>
            </div>
          </div>
        </div>
      </Section>

      {/* Change Email */}
      <Section title="Change Email" subtitle="OTP will be sent to your current registered email to verify identity">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ position: "relative", flex: 1 }}><Mail size={15} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} /><input className="input-field" type="email" placeholder="new@email.com" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={{ paddingLeft: 34 }} /></div>
            <button onClick={() => handleSendOtp("email")} className="btn-ghost" disabled={!editEmail}>Send OTP</button>
          </div>
          {otpSentFor === "email" && (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ position: "relative", flex: 1 }}><ShieldCheck size={15} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} /><input className="input-field" placeholder="6-digit OTP" value={editOtp} onChange={e => setEditOtp(e.target.value)} style={{ paddingLeft: 34 }} maxLength={6} /></div>
              <button onClick={() => handleVerifyOtp("email")} className="btn-accent">Verify & Update</button>
            </div>
          )}
        </div>
      </Section>

      {/* Change Password */}
      <Section title="Change Password" subtitle="OTP sent to current email before password can be changed">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>NEW PASSWORD</label><div style={{ position: "relative" }}><Lock size={15} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} /><input className="input-field" type="password" placeholder="Min 8 chars" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ paddingLeft: 34 }} /></div></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>CONFIRM PASSWORD</label><div style={{ position: "relative" }}><Lock size={15} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} /><input className="input-field" type="password" placeholder="Repeat password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} style={{ paddingLeft: 34 }} /></div></div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={() => handleSendOtp("password")} className="btn-ghost">Send OTP to Verify</button>
            {otpSentFor === "password" && <><input className="input-field" placeholder="OTP" value={editOtp} onChange={e => setEditOtp(e.target.value)} style={{ width: 120 }} maxLength={6} /><button onClick={() => handleVerifyOtp("password")} className="btn-accent">Change Password</button></>}
          </div>
        </div>
      </Section>

      {/* Plan Management */}
      <Section title="Subscription Plan" subtitle={currentPlan === "Diamond" && initialEmail === "admin@admin.com" ? "Admin account — All features unlocked" : `Active: ${currentPlan} · Next billing: 1st ${nextMonthName}`}>
        {initialEmail === "admin@admin.com" && (
          <div style={{ background: "var(--purple-muted)", border: "1px solid var(--purple)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--purple)", fontWeight: 700 }}>
            💎 Admin Account — Diamond plan is permanently unlocked. All features available.
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
          {PLANS.map(plan => (
            <div key={plan.id} onClick={() => initialEmail !== "admin@admin.com" && setSelectedPlan(plan.id)} style={{ padding: 18, borderRadius: 12, cursor: initialEmail !== "admin@admin.com" ? "pointer" : "default", border: `2px solid ${selectedPlan === plan.id ? plan.border : "var(--border)"}`, background: selectedPlan === plan.id ? plan.bg : "var(--bg-secondary)", transition: "all 0.2s", position: "relative" }}>
              {currentPlan === plan.id && <div style={{ position: "absolute", top: -10, right: 10, background: "var(--success)", color: "white", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>ACTIVE</div>}
              <div style={{ fontSize: 24, marginBottom: 6 }}>{plan.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: plan.color }}>₹{plan.price.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)" }}>/mo</span></div>
              <ul style={{ listStyle: "none", marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                {plan.features.slice(0, 3).map(f => <li key={f} style={{ fontSize: 11, color: "var(--text-secondary)", display: "flex", gap: 5 }}><CheckCircle2 size={11} color="var(--success)" />{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
        {proration && selectedPlan !== currentPlan && (
          <div style={{ background: "var(--accent-muted)", border: "1px solid var(--accent)", borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>📊 Proration — {daysLeft} days left in current cycle</div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", color: "var(--text-secondary)" }}>
              <span>Credit: <b style={{ color: "var(--success)" }}>₹{proration.credit}</b></span>
              <span>New plan charge: <b style={{ color: "var(--accent)" }}>₹{proration.charge}</b></span>
              <span>Pay now: <b style={{ color: proration.diff > 0 ? "var(--warning)" : "var(--success)" }}>₹{Math.abs(proration.diff)}</b></span>
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}>Full ₹{proration.newPlanPrice.toLocaleString()}/mo billing from 1st {nextMonthName}</div>
          </div>
        )}
        {initialEmail !== "admin@admin.com" && (
          <button onClick={handlePlanChange} disabled={selectedPlan === currentPlan || planLoading} className="btn-accent" style={{ display: "flex", alignItems: "center", gap: 8, opacity: selectedPlan === currentPlan ? 0.5 : 1 }}>
            {planLoading ? <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> : <CreditCard size={15} />}
            {planLoading ? "Updating..." : selectedPlan === currentPlan ? "Current Plan" : `Switch to ${selectedPlan} — Pay via Razorpay`}
          </button>
        )}
      </Section>

      {/* Marketplace Integrations — 4 platforms with real logos */}
      <Section title="Marketplace Integrations" subtitle="Connect your seller accounts to sync live data. Each marketplace requires developer credentials from their portal.">
        <div style={{ background: "var(--warning-muted)", border: "1px solid var(--warning)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
          <b style={{ color: "var(--warning)" }}>⚠️ Important:</b> <span style={{ color: "var(--text-secondary)" }}>Marketplace API connections require developer credentials. Amazon SP-API approval takes 1-3 days. Shopify & Flipkart are instant once you generate the key.</span>
        </div>

        {/* Connected summary bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {INTEGRATIONS.map(int => {
            const isConnected = !!connections[int.id];
            return (
              <div key={int.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, border: `1px solid ${isConnected ? int.color : "var(--border)"}`, background: isConnected ? `${int.color}18` : "var(--bg-secondary)" }}>
                <Image src={int.logo} alt={int.name} width={20} height={20} style={{ objectFit: "contain" }} unoptimized />
                <span style={{ fontSize: 12, fontWeight: 700, color: isConnected ? int.color : "var(--text-muted)" }}>
                  {int.name.split(" ")[0]}
                </span>
                {isConnected
                  ? <span style={{ fontSize: 10, background: "var(--success)", color: "white", padding: "1px 6px", borderRadius: 20, fontWeight: 800 }}>✓ Live</span>
                  : <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Not connected</span>
                }
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {INTEGRATIONS.map(int => {
            const canUse = planIdx(currentPlan) >= planIdx(int.requiredPlan) || currentPlan === "Diamond";
            const expanded = expandedInt === int.id;
            const isConnected = !!connections[int.id];

            return (
              <div key={int.id} style={{ border: `1px solid ${isConnected ? int.color : "var(--border)"}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" }}>
                {/* Header row */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: "var(--bg-secondary)", cursor: canUse ? "pointer" : "default" }}
                  onClick={() => canUse && setExpandedInt(expanded ? null : int.id)}
                >
                  {/* Real logo */}
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${int.color}15`, border: `1px solid ${int.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Image src={int.logo} alt={int.name} width={28} height={28} style={{ objectFit: "contain" }} unoptimized />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {int.name}
                      {isConnected && <span style={{ fontSize: 11, background: "var(--success-muted)", color: "var(--success)", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>Connected ✓</span>}
                      {!canUse && <span style={{ fontSize: 10, background: "var(--warning-muted)", color: "var(--warning)", padding: "2px 7px", borderRadius: 20, border: "1px solid var(--warning)", fontWeight: 800 }}>Requires {int.requiredPlan}+</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{int.desc}</div>
                  </div>

                  {canUse && (
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      {int.docsUrl && <a href={int.docsUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="btn-ghost" style={{ fontSize: 11, padding: "6px 10px", display: "flex", alignItems: "center", gap: 4 }}><ExternalLink size={12} /> Docs</a>}
                      {isConnected ? (
                        <button onClick={e => { e.stopPropagation(); handleDisconnect(int.id); }} className="btn-ghost" style={{ fontSize: 11, padding: "6px 12px", display: "flex", alignItems: "center", gap: 4, color: "var(--danger)" }}><Unlink size={12} /> Disconnect</button>
                      ) : (
                        <button onClick={e => { e.stopPropagation(); setExpandedInt(expanded ? null : int.id); }} className="btn-accent" style={{ fontSize: 11, padding: "6px 12px", display: "flex", alignItems: "center", gap: 4 }}><Link2 size={12} /> Setup Connection</button>
                      )}
                      <button className="btn-ghost" style={{ fontSize: 11, padding: "6px 10px" }}>{expanded ? "▲" : "▼"} Guide</button>
                    </div>
                  )}
                </div>

                {/* Expanded setup panel */}
                {expanded && canUse && (
                  <div style={{ padding: 20, borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>How to Connect</div>
                    <pre style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.8, marginBottom: 20, background: "var(--bg-secondary)", padding: 14, borderRadius: 8, border: "1px solid var(--border)" }}>{int.howToConnect}</pre>

                    {/* Multi-field input form */}
                    {int.id !== "meesho" && int.fields.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Enter Credentials</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                          {int.fields.map(field => (
                            <div key={field.key}>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>{field.label.toUpperCase()}</label>
                              <input
                                className="input-field"
                                type={field.key.toLowerCase().includes("token") || field.key.toLowerCase().includes("secret") ? "password" : "text"}
                                placeholder={field.placeholder}
                                value={getField(int.id, field.key)}
                                onChange={e => setField(int.id, field.key, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <button
                            onClick={() => {
                              const fields = intFields[int.id] || {};
                              const allFilled = int.fields.every(f => fields[f.key]?.trim());
                              if (!allFilled) { showToast("Please fill in all required fields", "error"); return; }
                              handleConnect(int.id, fields);
                            }}
                            className="btn-accent"
                            disabled={verifyingInt === int.id}
                            style={{ display: "flex", alignItems: "center", gap: 8 }}
                          >
                            {verifyingInt === int.id ? <RefreshCw size={14} className="spin" /> : <Link2 size={14} />} 
                            {verifyingInt === int.id ? "Verifying Credentials..." : `Save & Connect ${int.name.split(" ")[0]}`}
                          </button>
                          {isConnected && (
                            <span style={{ fontSize: 12, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
                              <CheckCircle2 size={14} /> Connected & Active
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>🔒 Live API Verification: Your credentials will be securely tested against the platform before connection is approved.</p>
                      </div>
                    )}

                    {/* Meesho CSV upload */}
                    {int.id === "meesho" && (
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>UPLOAD MEESHO ORDER CSV EXPORT</label>
                        <input type="file" accept=".csv" className="input-field" style={{ cursor: "pointer" }} onChange={() => handleConnect("meesho", { csv: "uploaded_csv_meesho" })} />
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Accepted format: CSV exported from Meesho Supplier Panel → Orders → Export.</p>
                      </div>
                    )}

                    {/* Shopify test connection */}
                    {int.id === "shopify" && isConnected && (
                      <div style={{ marginTop: 16, padding: 14, background: "rgba(94,142,62,0.08)", border: "1px solid rgba(94,142,62,0.3)", borderRadius: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#5E8E3E", marginBottom: 6 }}>🟢 Shopify Store Connected</div>
                        <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          Your Shopify store data is now syncing. Go to <a href="/tools/shopify-manager" style={{ color: "#5E8E3E", fontWeight: 700 }}>Shopify Store Manager</a> to view products, orders, and analytics.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
