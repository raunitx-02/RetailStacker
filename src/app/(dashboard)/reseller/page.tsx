"use client";

import React, { useState, useEffect } from "react";
import { fetchUsersAction, activatePlanAction, deleteUserAction, createUserAction } from "../../actions/reseller";
import { ShieldAlert, UserPlus, Search, Trash2, ShieldCheck, Mail, Calendar, KeyRound } from "lucide-react";

export default function ResellerPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPlan, setNewPlan] = useState("Free");

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

  const handleActivatePlan = async (email: string, plan: string) => {
    try {
      await activatePlanAction(email, plan);
      await loadUsers();
    } catch (e) {
      alert("Failed to activate plan");
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
      await createUserAction(newEmail, newPassword, newPlan);
      setNewEmail("");
      setNewPassword("");
      setNewPlan("Free");
      setIsCreateModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to create user");
    }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div style={{ padding: 40 }}>Loading Reseller Panel...</div>;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--warning-muted)", color: "var(--warning)", borderRadius: 50, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            <ShieldAlert size={14} /> Reseller Admin Access
          </div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Activate plans and manage registered users.</p>
        </div>
        <button className="btn-accent" onClick={() => setIsCreateModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search users by email..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, background: "transparent", border: "none", color: "white", fontSize: 16, outline: "none" }}
        />
      </div>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
              <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>EMAIL ADDRESS</th>
              <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>JOINED</th>
              <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>CURRENT PLAN</th>
              <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No users found.</td>
              </tr>
            ) : filteredUsers.map(user => (
              <tr key={user.email} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontWeight: 700 }}>
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 14 }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <select 
                    value={user.plan}
                    onChange={(e) => handleActivatePlan(user.email, e.target.value)}
                    style={{
                      background: user.plan === "Diamond" ? "rgba(155, 48, 255, 0.15)" : user.plan === "Pro" ? "rgba(4, 123, 213, 0.15)" : "var(--bg-secondary)",
                      color: user.plan === "Diamond" ? "var(--purple)" : user.plan === "Pro" ? "var(--accent)" : "var(--text-muted)",
                      border: `1px solid ${user.plan === "Diamond" ? "var(--purple)" : user.plan === "Pro" ? "var(--accent)" : "var(--border)"}`,
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="Free">Free Plan</option>
                    <option value="Pro">Pro Plan</option>
                    <option value="Diamond">Diamond Plan</option>
                  </select>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <button onClick={() => handleDeleteUser(user.email)} style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", padding: 8, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
          <div className="glass-card" style={{ width: 400, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <UserPlus size={20} color="var(--accent)" /> Create User
            </h2>
            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 36px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "white", outline: "none" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Temporary Password</label>
                <div style={{ position: "relative" }}>
                  <KeyRound size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 36px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "white", outline: "none" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Initial Plan</label>
                <select value={newPlan} onChange={e => setNewPlan(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "white", outline: "none" }}>
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Diamond">Diamond</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ flex: 1, padding: 12, background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "white", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" className="btn-accent" style={{ flex: 1, padding: 12, borderRadius: 8, fontWeight: 600 }}>Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
