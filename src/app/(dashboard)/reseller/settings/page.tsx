"use client";

import React, { useState, useEffect } from "react";
import { fetchResellerInfoAction, updateResellerSettingsAction } from "../../../actions/reseller";
import { ShieldAlert, User, Mail, Phone, Lock, Save, CheckCircle } from "lucide-react";

export default function ResellerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function loadResellerInfo() {
      try {
        const info = await fetchResellerInfoAction();
        setFirstName(info.firstName);
        setLastName(info.lastName);
        setEmail(info.email);
        setMobile(info.mobile);
      } catch (err) {
        console.error("Failed to load reseller info:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResellerInfo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password && password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setSaving(true);
    try {
      await updateResellerSettingsAction({
        firstName,
        lastName,
        email,
        mobile,
        password: password || undefined,
      });
      setMessage({ type: "success", text: "Profile details updated successfully." });
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>Loading reseller profile...</div>;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--warning-muted)", color: "var(--warning)", borderRadius: 50, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          <ShieldAlert size={14} /> Reseller Control Center
        </div>
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Update your personal information, mobile contact, credentials, and password.</p>
      </div>

      <div className="glass-card" style={{ padding: 32 }}>
        {message && (
          <div style={{ 
            padding: "16px 20px", 
            borderRadius: 10, 
            background: message.type === "success" ? "rgba(0, 200, 150, 0.1)" : "rgba(255, 75, 75, 0.1)", 
            color: message.type === "success" ? "#00C896" : "#ff4b4b",
            border: `1px solid ${message.type === "success" ? "#00C896" : "#ff4b4b"}`,
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            {message.type === "success" ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Identity Name Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>First Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input 
                  type="text" 
                  required 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  style={{ width: "100%", padding: "12px 14px 12px 42px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, color: "white", outline: "none", fontSize: 14 }} 
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Last Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input 
                  type="text" 
                  required 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  style={{ width: "100%", padding: "12px 14px 12px 42px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, color: "white", outline: "none", fontSize: 14 }} 
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{ width: "100%", padding: "12px 14px 12px 42px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, color: "white", outline: "none", fontSize: 14 }} 
              />
            </div>
          </div>

          {/* Mobile Phone Number */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Mobile Phone Number</label>
            <div style={{ position: "relative" }}>
              <Phone size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="tel" 
                required 
                value={mobile} 
                onChange={e => setMobile(e.target.value)} 
                style={{ width: "100%", padding: "12px 14px 12px 42px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, color: "white", outline: "none", fontSize: 14 }} 
              />
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 18 }}>Change Password</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input 
                    type="password" 
                    placeholder="Leave blank to keep same"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    style={{ width: "100%", padding: "12px 14px 12px 42px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, color: "white", outline: "none", fontSize: 14 }} 
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Confirm New Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input 
                    type="password" 
                    placeholder="Leave blank to keep same"
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    style={{ width: "100%", padding: "12px 14px 12px 42px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, color: "white", outline: "none", fontSize: 14 }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button 
              type="submit" 
              className="btn-accent" 
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 10, fontWeight: 700 }}
            >
              <Save size={18} />
              {saving ? "Saving Changes..." : "Save Profile Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
