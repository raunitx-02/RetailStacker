"use client";

import React, { useState, useEffect } from "react";
import { fetchUsersAction, activatePlanAction, deleteUserAction, createUserAction } from "../../../actions/reseller";
import { ShieldAlert, UserPlus, Search, Trash2, Mail, Calendar, KeyRound, User, Phone } from "lucide-react";

export default function ResellerUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // New User Fields
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newPlan, setNewPlan] = useState("Lite");
  const [newValidity, setNewValidity] = useState("1 Month");

  const loadUsers = async () => {
    try {
      const data = await fetchUsersAction();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdatePlanAndValidity = async (email: string, plan: string, validity: string) => {
    try {
      await activatePlanAction(email, plan, validity);
      await loadUsers();
    } catch (e) {
      alert("Failed to update user subscription");
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;
    try {
      await deleteUserAction(email);
      await loadUsers();
    } catch (e) {
      alert("Failed to delete user");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserAction(
        newEmail, 
        newPassword, 
        newPlan, 
        newFirstName, 
        newLastName, 
        newMobile, 
        newValidity
      );
      setNewEmail("");
      setNewPassword("");
      setNewFirstName("");
      setNewLastName("");
      setNewMobile("");
      setNewPlan("Lite");
      setNewValidity("1 Month");
      setIsCreateModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to create user");
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase();
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    return u.email.toLowerCase().includes(q) || fullName.includes(q) || (u.mobile && u.mobile.includes(q));
  });

  if (loading) return <div style={{ padding: 40, background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>Loading users registry...</div>;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--warning-muted)", color: "var(--warning)", borderRadius: 50, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            <ShieldAlert size={14} /> Reseller User Registry
          </div>
          <h1 className="page-title">Manage Customer Subscriptions</h1>
          <p className="page-subtitle">Add users, customize plans, set mobile numbers, and define plan validity.</p>
        </div>
        <button className="btn-accent" onClick={() => setIsCreateModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserPlus size={18} /> Add New Customer
        </button>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search customers by email, name, or phone..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, background: "transparent", border: "none", color: "white", fontSize: 16, outline: "none" }}
        />
      </div>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
              <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>CUSTOMER DETAILS</th>
              <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>MOBILE</th>
              <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>SUBSCRIPTION TIER & VALIDITY</th>
              <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>EXPIRES ON</th>
              <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 13, fontWeight: 700, textAlign: "right" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No customers registered under your reseller account.</td>
              </tr>
            ) : filteredUsers.map(user => (
              <tr key={user.email} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontWeight: 700 }}>
                      {(user.firstName || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.firstName} {user.lastName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 24px", color: "var(--text-secondary)", fontSize: 14 }}>
                  {user.mobile || "N/A"}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select 
                      value={user.plan}
                      onChange={(e) => handleUpdatePlanAndValidity(user.email, e.target.value, user.planValidity)}
                      style={{
                        background: user.plan === "Diamond" ? "rgba(155, 48, 255, 0.15)" : user.plan === "Growth" ? "rgba(255, 107, 53, 0.15)" : "var(--bg-secondary)",
                        color: user.plan === "Diamond" ? "var(--purple)" : user.plan === "Growth" ? "var(--accent)" : "var(--text-primary)",
                        border: `1px solid ${user.plan === "Diamond" ? "var(--purple)" : user.plan === "Growth" ? "var(--accent)" : "var(--border)"}`,
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 700,
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      <option value="Free">Free Plan</option>
                      <option value="Lite">Lite Plan</option>
                      <option value="Starter">Starter Plan</option>
                      <option value="Growth">Growth Plan</option>
                      <option value="Diamond">Diamond Plan</option>
                    </select>

                    <select 
                      value={user.planValidity}
                      onChange={(e) => handleUpdatePlanAndValidity(user.email, user.plan, e.target.value)}
                      style={{
                        background: "var(--bg-secondary)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      <option value="1 Month">1 Month</option>
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                      <option value="1 Year">1 Year</option>
                      <option value="Lifetime">Lifetime</option>
                    </select>
                  </div>
                </td>
                <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 13 }}>
                  {user.planExpiresAt 
                    ? new Date(user.planExpiresAt).toLocaleDateString("en-IN") 
                    : "Lifetime (Never)"}
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <button onClick={() => handleDeleteUser(user.email)} style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", padding: 8, borderRadius: 8, marginLeft: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-card" style={{ width: 440, padding: 32, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 10, color: "var(--text-primary)" }}>
              <UserPlus size={20} color="var(--accent)" /> Appoint New User
            </h2>
            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>First Name</label>
                  <div style={{ position: "relative" }}>
                    <User size={15} color="var(--text-muted)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                    <input type="text" required value={newFirstName} onChange={e => setNewFirstName(e.target.value)} className="input-field" style={{ paddingLeft: 32 }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Last Name</label>
                  <div style={{ position: "relative" }}>
                    <User size={15} color="var(--text-muted)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                    <input type="text" required value={newLastName} onChange={e => setNewLastName(e.target.value)} className="input-field" style={{ paddingLeft: 32 }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Mobile Number</label>
                <div style={{ position: "relative" }}>
                  <Phone size={15} color="var(--text-muted)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="tel" required value={newMobile} onChange={e => setNewMobile(e.target.value)} className="input-field" style={{ paddingLeft: 32 }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} color="var(--text-muted)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="input-field" style={{ paddingLeft: 32 }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Temporary Password</label>
                <div style={{ position: "relative" }}>
                  <KeyRound size={15} color="var(--text-muted)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" style={{ paddingLeft: 32 }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Subscription Tier</label>
                  <select value={newPlan} onChange={e => setNewPlan(e.target.value)} className="input-field" style={{ cursor: "pointer" }}>
                    <option value="Free" style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>Free</option>
                    <option value="Lite" style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>Lite</option>
                    <option value="Starter" style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>Starter</option>
                    <option value="Growth" style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>Growth</option>
                    <option value="Diamond" style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>Diamond</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Plan Validity</label>
                  <select value={newValidity} onChange={e => setNewValidity(e.target.value)} className="input-field" style={{ cursor: "pointer" }}>
                    <option value="1 Month" style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>1 Month</option>
                    <option value="3 Months" style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>3 Months</option>
                    <option value="6 Months" style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>6 Months</option>
                    <option value="1 Year" style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>1 Year</option>
                    <option value="Lifetime" style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>Lifetime</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-ghost" style={{ flex: 1, padding: "10px 14px", height: "auto" }}>Cancel</button>
                <button type="submit" className="btn-accent" style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: 600 }}>Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
