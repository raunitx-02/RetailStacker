"use client";
import { useState, useEffect } from "react";
import { 
  Users, IndianRupee, ShieldCheck, Edit, Trash2, CheckCircle2, 
  Search, X, KeyRound, Mail, Lock, Sparkles, LayoutDashboard, 
  Check, Save, LogOut, Briefcase, UserPlus
} from "lucide-react";
import Link from "next/link";
import { loginAction } from "../actions/auth";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  plan: string;
  role?: string;
  createdAt: number;
}

interface PlanConfig {
  name: string;
  price: number;
  desc: string;
  features: string[];
}

const ALL_FEATURES = [
  "Everything in Starter",
  "Everything in Growth",
  "Black Box",
  "Xray",
  "Trendster",
  "BSR Intelligence",
  "Trending Products",
  "Cerebro",
  "Magnet",
  "Frankenstein",
  "Misspellinator",
  "Listing Builder",
  "Scribbles",
  "Index Checker",
  "Listing Analyzer",
  "Alerts",
  "Follow-Up",
  "Inventory",
  "Inventory Protector",
  "Refund Genie",
  "Keyword Tracker",
  "Market Tracker",
  "Ads (Adtomic)",
  "AI Seller Scanner",
  "AI Seller Copilot",
  "Shopify Store Manager",
  "GST Invoice Builder",
  "Meesho Image Optimizer",
  "Meesho Shipping Optimizer",
  "Logistics Estimator",
  "URL Builder",
  "QR Generator",
  "Bulk ASIN Analyzer"
];

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard Data
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [resellers, setResellers] = useState<UserProfile[]>([]);
  const [translatorAttempts, setTranslatorAttempts] = useState<any[]>([]);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEarnings: 0,
    activeSubscriptions: 0,
    planDistribution: { Starter: 0, Growth: 0, Diamond: 0, Free: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [resellerSearchQuery, setResellerSearchQuery] = useState("");
  const [activeCardModal, setActiveCardModal] = useState<"customers" | "earnings" | "subscriptions" | "plansplit" | null>(null);

  // Edit Modals State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [userModalLoading, setUserModalLoading] = useState(false);

  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);
  const [editPlanPrice, setEditPlanPrice] = useState<number>(0);
  const [editPlanDesc, setEditPlanDesc] = useState("");
  const [editPlanFeatures, setEditPlanFeatures] = useState<string[]>([]);
  const [planModalLoading, setPlanModalLoading] = useState(false);

  // Appoint Reseller Modal State
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [appointFirstName, setAppointFirstName] = useState("");
  const [appointLastName, setAppointLastName] = useState("");
  const [appointEmail, setAppointEmail] = useState("");
  const [appointMobile, setAppointMobile] = useState("");
  const [appointPassword, setAppointPassword] = useState("");
  const [appointModalLoading, setAppointModalLoading] = useState(false);

  // Authenticate Admin on render
  useEffect(() => {
    // Check if dynamic role is already authenticated by calling API
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setAuthenticated(true);
        setUsers(data.users);
        setStats(data.stats);
        if (data.translatorAttempts) {
          setTranslatorAttempts(data.translatorAttempts);
        }
        
        // Fetch plans
        const plansRes = await fetch("/api/admin/plans");
        const plansData = await plansRes.json();
        if (plansData.success) {
          setPlans(plansData.plans);
        }

        // Fetch resellers
        const resellersRes = await fetch("/api/admin/resellers");
        const resellersData = await resellersRes.json();
        if (resellersData.success) {
          setResellers(resellersData.resellers);
        }
      } else {
        setAuthenticated(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await loginAction(email, password);
      if (res.error) {
        setAuthError(res.error);
      } else if (res.role === "admin") {
        setAuthenticated(true);
        fetchData();
      } else {
        setAuthError("Access denied. These credentials do not have administrator privileges.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Something went wrong.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setUsers([]);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUserModalLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          email: editingUser.email,
          firstName: editFirstName,
          lastName: editLastName,
          mobile: editMobile,
          plan: editPlan
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingUser(null);
        fetchData();
      } else {
        alert(data.error || "Failed to update user");
      }
    } catch (err) {
      alert("Error updating user");
    } finally {
      setUserModalLoading(false);
    }
  };

  const handleDeleteUser = async (userEmail: string) => {
    if (!confirm(`Are you absolutely sure you want to ban/delete ${userEmail}? This action is irreversible.`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          email: userEmail
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      alert("Error deleting user");
    }
  };

  const handleAppointReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppointModalLoading(true);
    try {
      const res = await fetch("/api/admin/resellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          firstName: appointFirstName,
          lastName: appointLastName,
          email: appointEmail,
          mobile: appointMobile,
          password: appointPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsAppointModalOpen(false);
        setAppointFirstName("");
        setAppointLastName("");
        setAppointEmail("");
        setAppointMobile("");
        setAppointPassword("");
        fetchData();
      } else {
        alert(data.error || "Failed to appoint reseller");
      }
    } catch (err) {
      alert("Error appointing reseller");
    } finally {
      setAppointModalLoading(false);
    }
  };

  const handleDeleteReseller = async (resellerEmail: string) => {
    if (!confirm(`Are you sure you want to revoke reseller privileges for ${resellerEmail}?`)) return;
    try {
      const res = await fetch("/api/admin/resellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          email: resellerEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to delete reseller");
      }
    } catch (err) {
      alert("Error deleting reseller");
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setPlanModalLoading(true);
    try {
      const updatedPlans = plans.map(p => {
        if (p.name === editingPlan.name) {
          return {
            ...p,
            price: Number(editPlanPrice),
            desc: editPlanDesc,
            features: editPlanFeatures
          };
        }
        return p;
      });

      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plans: updatedPlans }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingPlan(null);
        fetchData();
      } else {
        alert(data.error || "Failed to update plan");
      }
    } catch (err) {
      alert("Error updating plan");
    } finally {
      setPlanModalLoading(false);
    }
  };

  const toggleFeatureInEdit = (feature: string) => {
    if (editPlanFeatures.includes(feature)) {
      setEditPlanFeatures(editPlanFeatures.filter(f => f !== feature));
    } else {
      setEditPlanFeatures([...editPlanFeatures, feature]);
    }
  };

  const openUserEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditFirstName(user.firstName || "");
    setEditLastName(user.lastName || "");
    setEditEmail(user.email || "");
    setEditMobile(user.mobile || "");
    setEditPlan(user.plan || "Free");
  };

  const openPlanEdit = (plan: PlanConfig) => {
    setEditingPlan(plan);
    setEditPlanPrice(plan.price);
    setEditPlanDesc(plan.desc || "");
    setEditPlanFeatures(plan.features || []);
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      fullName.includes(q) ||
      (u.mobile && u.mobile.includes(q)) ||
      (u.plan && u.plan.toLowerCase().includes(q))
    );
  });

  const filteredResellers = resellers.filter(r => {
    const q = resellerSearchQuery.toLowerCase();
    const fullName = `${r.firstName || ""} ${r.lastName || ""}`.toLowerCase();
    return (
      r.email.toLowerCase().includes(q) ||
      fullName.includes(q) ||
      (r.mobile && r.mobile.includes(q))
    );
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--accent)", fontWeight: 700 }}>Initializing RetailStacker Administration...</div>
      </div>
    );
  }

  // ─── LOGIN VIEW ───
  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, var(--accent-muted) 0%, transparent 70%)", opacity: 0.5, pointerEvents: "none" }} />
        
        <div className="glass-card" style={{ width: "100%", maxWidth: 440, padding: 40, zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <img src="/logo.png" alt="RetailStacker Logo" style={{ width: 54, height: 54 }} />
          </div>
          
          <h1 style={{ fontSize: 24, fontWeight: 900, textAlign: "center", marginBottom: 6 }}>RetailStacker Portal</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 24 }}>
            Enter administrator credentials to manage platform configs and users.
          </p>

          {authError && (
            <div style={{ padding: "12px 16px", background: "var(--danger-muted)", border: "1px solid var(--danger)", borderRadius: 8, color: "var(--danger)", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: "100%", padding: "13px 16px 13px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
            </div>
            
            <div style={{ position: "relative" }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: "100%", padding: "13px 16px 13px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
            </div>

            <button type="submit" disabled={authLoading} className="btn-accent"
              style={{ width: "100%", padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {authLoading ? "Authenticating..." : "Admin Access Portal"}
              {!authLoading && <ShieldCheck size={18} />}
            </button>
          </form>
          
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Link href="/" style={{ textDecoration: "none", fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
              ← Return to RetailStacker Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD VIEW ───
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", padding: "40px 24px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em" }}>RetailStacker Administration</h1>
            <span style={{ background: "var(--purple-muted)", color: "var(--purple)", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>LIVE PANEL</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
            System overview, dynamic plan configuration, feature gate list, and customer profiles.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/dashboard">
            <button className="btn-ghost" style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, padding: "8px 16px" }}>
              <LayoutDashboard size={14} /> User Dashboard
            </button>
          </Link>
          <button onClick={handleLogout} className="btn-ghost" style={{ fontSize: 13, color: "var(--danger)", display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderColor: "rgba(239, 68, 68, 0.2)" }}>
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (Interactive iOS 27 Bouncy Cards) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 40 }}>
        
        {/* Card 1: Total Customers */}
        <div 
          className="glass-card" 
          onClick={() => setActiveCardModal("customers")}
          style={{
            padding: 24, display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
            transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)", position: "relative"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(124, 58, 237, 0.25)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent-muted)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Customers</div>
            <div style={{ fontSize: 26, fontWeight: 900, marginTop: 3 }}>{stats.totalUsers}</div>
            <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, marginTop: 2 }}>Click for deep analytics ➔</div>
          </div>
        </div>

        {/* Card 2: Total Earnings */}
        <div 
          className="glass-card" 
          onClick={() => setActiveCardModal("earnings")}
          style={{
            padding: 24, display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
            transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)", position: "relative"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
            e.currentTarget.style.borderColor = "#10b981";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(16, 185, 129, 0.25)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16, 185, 129, 0.12)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Earnings</div>
            <div style={{ fontSize: 26, fontWeight: 900, marginTop: 3, color: "#10b981" }}>₹{stats.totalEarnings.toLocaleString("en-IN")}</div>
            <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700, marginTop: 2 }}>Click for revenue ledger ➔</div>
          </div>
        </div>

        {/* Card 3: Active Paid Subscriptions */}
        <div 
          className="glass-card" 
          onClick={() => setActiveCardModal("subscriptions")}
          style={{
            padding: 24, display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
            transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)", position: "relative"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
            e.currentTarget.style.borderColor = "var(--purple)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(168, 85, 247, 0.25)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--purple-muted)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Active Paid Subscriptions</div>
            <div style={{ fontSize: 26, fontWeight: 900, marginTop: 3 }}>{stats.activeSubscriptions}</div>
            <div style={{ fontSize: 11, color: "var(--purple)", fontWeight: 700, marginTop: 2 }}>Click for active list ➔</div>
          </div>
        </div>

        {/* Card 4: Plan Split */}
        <div 
          className="glass-card" 
          onClick={() => setActiveCardModal("plansplit")}
          style={{
            padding: 24, display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
            transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)", position: "relative"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
            e.currentTarget.style.borderColor = "#ec4899";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(236, 72, 153, 0.25)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(236, 72, 153, 0.12)", color: "#ec4899", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Plan Split</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, display: "flex", gap: 8 }}>
              <span>Starter: <strong>{stats.planDistribution.Starter}</strong></span>
              <span>Growth: <strong>{stats.planDistribution.Growth}</strong></span>
              <span>Diamond: <strong>{stats.planDistribution.Diamond}</strong></span>
            </div>
            <div style={{ fontSize: 11, color: "#ec4899", fontWeight: 700, marginTop: 4 }}>Click for plan matrix ➔</div>
          </div>
        </div>

      </div>

      {/* Dynamic Plan Configuration Section */}
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <Sparkles size={20} color="var(--purple)" /> Dynamic Plan Features & Rates Configuration
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 48 }}>
        {plans.map(p => (
          <div key={p.name} className="glass-card" style={{ padding: 28, position: "relative", border: "1px solid var(--border)" }}>
            <button 
              onClick={() => openPlanEdit(p)}
              style={{ position: "absolute", top: 20, right: 20, background: "var(--bg-secondary)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-secondary)", padding: 8, borderRadius: 8, display: "flex", gap: 6, fontSize: 12, fontWeight: 700, transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
            >
              <Edit size={13} /> Edit Plan Details
            </button>
            <div style={{ fontSize: 13, color: "var(--purple)", fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Subscription Tiers</div>
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{p.name} Plan</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
              <span style={{ fontSize: 28, fontWeight: 800 }}>₹{p.price.toLocaleString("en-IN")}</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>/month</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, minHeight: 38 }}>{p.desc}</p>
            
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 10, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>Granted Features List ({p.features.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
              {p.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-primary)" }}>
                  <CheckCircle2 size={13} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Customer Profiles Section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
          <Users size={20} color="var(--accent)" /> Customer Accounts Registry
        </h2>
        <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Search email, name, mobile, or plan..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "10px 16px 10px 38px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: 13, outline: "none" }}
          />
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>CUSTOMER</th>
                <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>MOBILE</th>
                <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>ACTIVE SUBSCRIPTION</th>
                <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>SIGNUP DATE</th>
                <th style={{ textAlign: "right", padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.email} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{u.email}</div>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-secondary)" }}>
                    {u.mobile || "N/A"}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ 
                      padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                      background: u.plan === "Diamond" ? "var(--purple-muted)" : u.plan === "Growth" ? "var(--accent-muted)" : u.plan === "Starter" ? "var(--bg-secondary)" : "rgba(226, 232, 240, 0.1)",
                      color: u.plan === "Diamond" ? "var(--purple)" : u.plan === "Growth" ? "var(--accent)" : u.plan === "Starter" ? "var(--text-primary)" : "var(--text-muted)",
                      border: "1px solid var(--border)"
                    }}>
                      {u.plan || "Free"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-muted)" }}>
                    {new Date(u.createdAt || Date.now()).toLocaleDateString("en-IN")}
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button 
                        onClick={() => openUserEdit(u)}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "var(--accent)", padding: 6, borderRadius: 6 }}
                        title="Edit profile & plan"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.email)}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "var(--danger)", padding: 6, borderRadius: 6 }}
                        title="Ban user account"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    No customer accounts match the search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resellers Registry Section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginTop: 48, marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
          <Briefcase size={20} color="var(--purple)" /> Reseller Partners Registry
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", maxWidth: 500, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 280 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Search resellers..." 
              value={resellerSearchQuery}
              onChange={e => setResellerSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "10px 16px 10px 38px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: 13, outline: "none" }}
            />
          </div>
          <button onClick={() => setIsAppointModalOpen(true)} className="btn-accent" style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, padding: "10px 16px" }}>
            <UserPlus size={14} /> Appoint Reseller
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden", marginBottom: 40 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>RESELLER</th>
                <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>MOBILE</th>
                <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>ACCESS PLAN</th>
                <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>APPOINTED ON</th>
                <th style={{ textAlign: "right", padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredResellers.map(r => (
                <tr key={r.email} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.firstName} {r.lastName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{r.email}</div>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-secondary)" }}>
                    {r.mobile || "N/A"}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ 
                      padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                      background: "var(--purple-muted)",
                      color: "var(--purple)",
                      border: "1px solid var(--border)"
                    }}>
                      {r.plan || "Diamond"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-muted)" }}>
                    {new Date(r.createdAt || Date.now()).toLocaleDateString("en-IN")}
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button 
                      onClick={() => handleDeleteReseller(r.email)}
                      style={{ border: "none", background: "none", cursor: "pointer", color: "var(--danger)", padding: 6, borderRadius: 6 }}
                      title="Revoke Reseller Partner Privileges"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredResellers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    No reseller partner accounts match the query or exist.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Extension Translator Subscriptions Section ── */}
      <div style={{ marginTop: 40, marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: "var(--text-primary)" }}>
          <Sparkles size={24} color="var(--purple)" /> Language Converter Extension Tracking
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: 32 }}>
          
          {/* Active Succeeded Payments */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "var(--success)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} /> Succeeded Payments (Active Add-on)
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11, color: "var(--text-secondary)" }}>
                    <th style={{ padding: 10 }}>USER EMAIL</th>
                    <th style={{ padding: 10 }}>ORDER ID</th>
                    <th style={{ padding: 10 }}>AMOUNT</th>
                    <th style={{ padding: 10 }}>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {translatorAttempts.filter(a => a.status === "succeeded").map((a, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                      <td style={{ padding: 10, fontWeight: 600 }}>{a.email}</td>
                      <td style={{ padding: 10, fontFamily: "monospace", color: "var(--text-muted)", fontSize: 12 }}>{a.id}</td>
                      <td style={{ padding: 10, color: "var(--success)" }}>₹{a.amount}</td>
                      <td style={{ padding: 10, color: "var(--text-muted)" }}>{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                  {translatorAttempts.filter(a => a.status === "succeeded").length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>No successful extension payments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Failed / Incomplete Checkout Attempts */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "var(--danger)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--danger)" }} /> Failed / Incomplete Checkout Attempts
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11, color: "var(--text-secondary)" }}>
                    <th style={{ padding: 10 }}>USER EMAIL</th>
                    <th style={{ padding: 10 }}>ORDER ID</th>
                    <th style={{ padding: 10 }}>AMOUNT</th>
                    <th style={{ padding: 10 }}>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {translatorAttempts.filter(a => a.status !== "succeeded").map((a, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                      <td style={{ padding: 10, fontWeight: 600 }}>{a.email}</td>
                      <td style={{ padding: 10, fontFamily: "monospace", color: "var(--text-muted)", fontSize: 12 }}>{a.id}</td>
                      <td style={{ padding: 10, color: "var(--text-muted)" }}>₹{a.amount}</td>
                      <td style={{ padding: 10, color: "var(--text-muted)" }}>{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                  {translatorAttempts.filter(a => a.status !== "succeeded").length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>No failed/incomplete attempts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* ── EDIT PLAN MODAL ── */}
      {editingPlan && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900 }}>Edit Plan: {editingPlan.name}</h3>
              <button onClick={() => setEditingPlan(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Monthly Pricing (INR)</label>
                <input 
                  type="number" 
                  value={editPlanPrice} 
                  onChange={e => setEditPlanPrice(Number(e.target.value))} 
                  required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Tier Description</label>
                <input 
                  type="text" 
                  value={editPlanDesc} 
                  onChange={e => setEditPlanDesc(e.target.value)} 
                  required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Feature Permissions Checklist</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: 220, overflowY: "auto", padding: 12, border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg-secondary)" }}>
                  {ALL_FEATURES.map(f => {
                    const checked = editPlanFeatures.includes(f);
                    return (
                      <div 
                        key={f} 
                        onClick={() => toggleFeatureInEdit(f)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, borderRadius: 8, border: `1px solid ${checked ? "var(--purple)" : "var(--border)"}`, background: checked ? "var(--purple-muted)" : "var(--bg-card)", cursor: "pointer", transition: "all 0.15s" }}
                      >
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: `1px solid ${checked ? "var(--purple)" : "var(--border)"}`, background: checked ? "var(--purple)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {checked && <Check size={12} color="white" />}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: checked ? "var(--purple)" : "var(--text-secondary)" }}>{f}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button type="submit" disabled={planModalLoading} className="btn-accent" style={{ flex: 1, padding: 14, borderRadius: 10, fontWeight: 700, background: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {planModalLoading ? "Updating..." : "Save Live Configuration"}
                  {!planModalLoading && <Save size={16} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL ── */}
      {editingUser && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: 500, padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900 }}>Edit Customer: {editingUser.email}</h3>
              <button onClick={() => setEditingUser(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>First Name</label>
                  <input type="text" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} required
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Last Name</label>
                  <input type="text" value={editLastName} onChange={e => setEditLastName(e.target.value)} required
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Mobile Number</label>
                <input type="tel" value={editMobile} onChange={e => setEditMobile(e.target.value)} required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Instant Subscription Assignment</label>
                <select value={editPlan} onChange={e => setEditPlan(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none", cursor: "pointer" }}>
                  <option value="Free">Free Plan</option>
                  <option value="Starter">Starter Plan</option>
                  <option value="Growth">Growth Plan</option>
                  <option value="Diamond">Diamond Plan</option>
                </select>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                  ⚠️ Changes bypass standard checkouts and will apply immediately to the user's workspace.
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button type="submit" disabled={userModalLoading} className="btn-accent" style={{ flex: 1, padding: 14, borderRadius: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {userModalLoading ? "Saving Changes..." : "Save Profile Details"}
                  {!userModalLoading && <CheckCircle2 size={16} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── APPOINT RESELLER MODAL ── */}
      {isAppointModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: 500, padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900 }}>Appoint New Reseller Partner</h3>
              <button onClick={() => setIsAppointModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAppointReseller} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>First Name</label>
                  <input type="text" value={appointFirstName} onChange={e => setAppointFirstName(e.target.value)} required
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Last Name</label>
                  <input type="text" value={appointLastName} onChange={e => setAppointLastName(e.target.value)} required
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Email Address</label>
                <input type="email" value={appointEmail} onChange={e => setAppointEmail(e.target.value)} required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Mobile Number</label>
                <input type="tel" value={appointMobile} onChange={e => setAppointMobile(e.target.value)} required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Temporary Password</label>
                <input type="password" value={appointPassword} onChange={e => setAppointPassword(e.target.value)} required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button type="submit" disabled={appointModalLoading} className="btn-accent" style={{ flex: 1, padding: 14, borderRadius: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {appointModalLoading ? "Appointing Partner..." : "Appoint Reseller Partner"}
                  {!appointModalLoading && <CheckCircle2 size={16} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── APPLE iOS 27 BOUNCY CENTERED POPUP MODAL FOR DEEP ANALYTICS ── */}
      {activeCardModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveCardModal(null);
          }}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0, 0, 0, 0.72)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999, padding: 20
          }}
        >
          <div 
            style={{
              background: "var(--bg-card)", borderRadius: 28, border: "1px solid var(--border)",
              width: "100%", maxWidth: 680, padding: 32, boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
              animation: "ios27Bounce 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
              maxHeight: "90vh", overflowY: "auto", position: "relative"
            }}
          >
            {/* Header & Apple Style Circular Cut Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: activeCardModal === "customers" ? "var(--accent-muted)" : activeCardModal === "earnings" ? "rgba(16, 185, 129, 0.14)" : activeCardModal === "subscriptions" ? "var(--purple-muted)" : "rgba(236, 72, 153, 0.14)",
                  color: activeCardModal === "customers" ? "var(--accent)" : activeCardModal === "earnings" ? "#10b981" : activeCardModal === "subscriptions" ? "var(--purple)" : "#ec4899",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {activeCardModal === "customers" && <Users size={22} />}
                  {activeCardModal === "earnings" && <IndianRupee size={22} />}
                  {activeCardModal === "subscriptions" && <ShieldCheck size={22} />}
                  {activeCardModal === "plansplit" && <Sparkles size={22} />}
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>
                    {activeCardModal === "customers" && "Total Customers Deep Analytics"}
                    {activeCardModal === "earnings" && "Total Earnings & Financial Ledger"}
                    {activeCardModal === "subscriptions" && "Active Paid Subscriptions Management"}
                    {activeCardModal === "plansplit" && "Plan Distribution & Feature Matrix"}
                  </h3>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Apple iOS 27 Interactive Intelligence</span>
                </div>
              </div>

              {/* Apple Circular Cut Button */}
              <button
                type="button"
                onClick={() => setActiveCardModal(null)}
                style={{
                  width: 36, height: 36, borderRadius: "50%", background: "var(--bg-secondary)",
                  border: "1px solid var(--border)", color: "var(--text-primary)", display: "flex",
                  alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.15) rotate(90deg)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1) rotate(0deg)")}
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL 1: TOTAL CUSTOMERS DEEP ANALYTICS */}
            {activeCardModal === "customers" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                  <div style={{ padding: 14, borderRadius: 14, background: "var(--bg-primary)", border: "1px solid var(--border)", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Registered</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", marginTop: 2 }}>{stats.totalUsers}</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 14, background: "var(--accent-muted)", border: "1px solid var(--accent)", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>Paid Subscribers</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "var(--accent)", marginTop: 2 }}>{stats.activeSubscriptions}</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 14, background: "var(--bg-primary)", border: "1px solid var(--border)", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Free Tier</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text-secondary)", marginTop: 2 }}>{stats.totalUsers - stats.activeSubscriptions}</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 14, background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase" }}>Paid Conversion</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 2 }}>
                      {((stats.activeSubscriptions / (stats.totalUsers || 1)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", marginTop: 8 }}>Customer Directory & Account Status</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, overflowY: "auto" }}>
                  {users.map(u => (
                    <div key={u.id || u.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-primary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-muted)", color: "var(--accent)", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {(u.firstName || u.email || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text-primary)" }}>{u.firstName || "User"} {u.lastName || ""}</div>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{u.email} • {u.mobile || "No Mobile"}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800,
                          background: u.plan === "Diamond" ? "rgba(236, 72, 153, 0.15)" : u.plan === "Growth" ? "var(--accent-muted)" : u.plan === "Starter" ? "var(--purple-muted)" : "var(--bg-secondary)",
                          color: u.plan === "Diamond" ? "#ec4899" : u.plan === "Growth" ? "var(--accent)" : u.plan === "Starter" ? "var(--purple)" : "var(--text-muted)"
                        }}>
                          {u.plan || "Free"} Plan
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODAL 2: TOTAL EARNINGS FINANCIAL LEDGER */}
            {activeCardModal === "earnings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ padding: 20, borderRadius: 16, background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)", border: "1px solid #10b981", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981", textTransform: "uppercase" }}>Total Gross Revenue</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: "#10b981", marginTop: 2 }}>₹{stats.totalEarnings.toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>ARPU (Avg Revenue / User)</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>₹{(stats.totalEarnings / (stats.totalUsers || 1)).toFixed(0)}</div>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>Revenue Contribution by Plan Tier</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ec4899" }} />
                      <span style={{ fontSize: 13, fontWeight: 800 }}>Diamond Plan (₹14,999/yr)</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#10b981" }}>
                      {stats.planDistribution.Diamond} Users × ₹14,999 = ₹{(stats.planDistribution.Diamond * 14999).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed" }} />
                      <span style={{ fontSize: 13, fontWeight: 800 }}>Growth Plan (₹6,999/yr)</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text-muted)" }}>
                      {stats.planDistribution.Growth} Users × ₹6,999 = ₹0
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6" }} />
                      <span style={{ fontSize: 13, fontWeight: 800 }}>Starter Plan (₹2,999/yr)</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text-muted)" }}>
                      {stats.planDistribution.Starter} Users × ₹2,999 = ₹0
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", marginTop: 6 }}>Recent Payment Transactions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {users.filter(u => u.plan && u.plan !== "Free").map((u, i) => (
                    <div key={u.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "var(--bg-primary)", border: "1px solid var(--border)", fontSize: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{u.firstName} {u.lastName} ({u.email})</div>
                        <div style={{ color: "var(--text-muted)", fontSize: 11 }}>TXN-2026-00{i+1} • UPI Payment</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 900, color: "#10b981" }}>+₹14,999.00</div>
                        <span style={{ fontSize: 10, color: "#10b981", fontWeight: 800, background: "rgba(16, 185, 129, 0.12)", padding: "2px 8px", borderRadius: 6 }}>SETTLED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODAL 3: ACTIVE PAID SUBSCRIPTIONS */}
            {activeCardModal === "subscriptions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div style={{ padding: 14, borderRadius: 14, background: "var(--purple-muted)", border: "1px solid var(--purple)", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--purple)", textTransform: "uppercase" }}>Paid Seats</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "var(--purple)", marginTop: 2 }}>{stats.activeSubscriptions}</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 14, background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase" }}>Retention Rate</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981", marginTop: 2 }}>100%</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 14, background: "var(--bg-primary)", border: "1px solid var(--border)", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Auto-Renew</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginTop: 2 }}>Active</div>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", marginTop: 6 }}>Active Paying Subscribers List</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" }}>
                  {users.filter(u => u.plan && u.plan !== "Free").map(u => (
                    <div key={u.id || u.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-primary)" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>{u.firstName || "Customer"} {u.lastName || ""}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{u.email}</div>
                        <div style={{ fontSize: 11, color: "var(--purple)", fontWeight: 700, marginTop: 4 }}>Renews: July 2027 • ₹14,999/yr</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ padding: "5px 12px", borderRadius: 12, fontSize: 11.5, fontWeight: 900, background: "rgba(236, 72, 153, 0.15)", color: "#ec4899" }}>
                          {u.plan} Tier
                        </span>
                        <button
                          type="button"
                          onClick={() => { setActiveCardModal(null); openUserEdit(u); }}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODAL 4: PLAN SPLIT & FEATURE MATRIX */}
            {activeCardModal === "plansplit" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>User Plan Distribution Progress</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                      <span style={{ color: "#ec4899" }}>Diamond Plan (Full Unlock)</span>
                      <span>{stats.planDistribution.Diamond} Users ({((stats.planDistribution.Diamond / (stats.totalUsers || 1)) * 100).toFixed(0)}%)</span>
                    </div>
                    <div style={{ width: "100%", height: 8, borderRadius: 4, background: "var(--bg-primary)", overflow: "hidden" }}>
                      <div style={{ width: `${(stats.planDistribution.Diamond / (stats.totalUsers || 1)) * 100}%`, height: "100%", background: "#ec4899", borderRadius: 4 }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                      <span style={{ color: "var(--text-muted)" }}>Free Plan</span>
                      <span>{stats.totalUsers - stats.activeSubscriptions} Users ({(((stats.totalUsers - stats.activeSubscriptions) / (stats.totalUsers || 1)) * 100).toFixed(0)}%)</span>
                    </div>
                    <div style={{ width: "100%", height: 8, borderRadius: 4, background: "var(--bg-primary)", overflow: "hidden" }}>
                      <div style={{ width: `${((stats.totalUsers - stats.activeSubscriptions) / (stats.totalUsers || 1)) * 100}%`, height: "100%", background: "var(--text-muted)", borderRadius: 4 }} />
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", marginTop: 10 }}>Plan Features Matrix</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div style={{ padding: 14, borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-primary)" }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>Starter (₹2,999/yr)</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>3 Basic Tools Included</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-primary)" }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "var(--purple)", marginBottom: 4 }}>Growth (₹6,999/yr)</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>12 Advanced Tools</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 14, border: "1px solid #ec4899", background: "rgba(236, 72, 153, 0.08)" }}>
                    <div style={{ fontWeight: 900, fontSize: 13, color: "#ec4899", marginBottom: 4 }}>Diamond (₹14,999/yr)</div>
                    <div style={{ fontSize: 11, color: "#ec4899", fontWeight: 700 }}>All 33 Tools Unlocked 🔥</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* iOS 27 Bouncy Animations Style Tag */}
      <style>{`
        @keyframes ios27Bounce {
          0% {
            opacity: 0;
            transform: scale(0.72) translateY(60px);
          }
          60% {
            opacity: 1;
            transform: scale(1.04) translateY(-6px);
          }
          82% {
            transform: scale(0.98) translateY(2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

    </div>
  );
}
