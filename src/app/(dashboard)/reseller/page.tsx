"use client";

import React, { useState, useEffect } from "react";
import { fetchResellerStatsAction } from "../../actions/reseller";
import { Users, UserCheck, ShieldAlert, Award, Calendar, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ResellerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetchResellerStatsAction();
        setStats(res);
      } catch (e) {
        console.error("Failed to load reseller stats:", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div style={{ padding: 40, background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>Loading reseller metrics...</div>;

  const { totalUsers = 0, activeUsers = 0, planCounts = {}, soonExpiring = [] } = stats || {};

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--warning-muted)", color: "var(--warning)", borderRadius: 50, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          <ShieldAlert size={14} /> Reseller Control Center
        </div>
        <h1 className="page-title">Reseller Overview</h1>
        <p className="page-subtitle">Track registered user acquisitions, subscription status, and upcoming renewals.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 40 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600 }}>Total Registered Customers</span>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "var(--accent)" }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)" }}>{totalUsers}</div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Users created from this reseller account</p>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600 }}>Active Subscriptions</span>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(0, 200, 150, 0.1)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "#00C896" }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)" }}>{activeUsers}</div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Users with active paid plans</p>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600 }}>Active Conversion Rate</span>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(124, 58, 237, 0.1)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "#8b5cf6" }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)" }}>
            {totalUsers > 0 ? `${Math.round((activeUsers / totalUsers) * 100)}%` : "0%"}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Ratio of paid subscriptions to total users</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32 }}>
        {/* Soon Expiring Alert Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={18} color="var(--warning)" /> Attention Required: Expiry List (Next 7 Days)
            </h3>
            
            {soonExpiring.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                No active plans are expiring within the next 7 days. Excellent!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {soonExpiring.map((u: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "var(--bg-secondary)", borderRadius: 12, border: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{u.firstName} {u.lastName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-block", background: "rgba(255, 107, 53, 0.1)", color: "var(--accent)", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20, textTransform: "uppercase", marginBottom: 4 }}>
                        {u.plan} Plan
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={12} /> Expires: {new Date(u.expiresAt).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Plan Breakdown Side Panel */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20 }}>Plan Allocations</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {["Diamond", "Growth", "Starter", "Lite", "Free"].map((planName) => {
              const count = planCounts[planName] || 0;
              const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
              
              const barColors: Record<string, string> = {
                Diamond: "var(--purple)",
                Growth: "var(--accent)",
                Starter: "#3b82f6",
                Lite: "#00B4D8",
                Free: "var(--text-muted)",
              };

              return (
                <div key={planName}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    <span>{planName}</span>
                    <span>{count} ({percentage}%)</span>
                  </div>
                  <div style={{ width: "100%", height: 8, background: "var(--bg-secondary)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${percentage}%`, height: "100%", background: barColors[planName] || "var(--border)", borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 32, borderTop: "1px solid var(--border)", paddingTop: 24, textAlign: "center" }}>
            <Link href="/reseller/users" style={{ textDecoration: "none", color: "var(--accent)", fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>
              Go to User Registry <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
