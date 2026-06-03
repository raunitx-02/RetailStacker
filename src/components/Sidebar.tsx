"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, Search, KeyRound, FileText, Settings, BarChart3,
  Wrench, ChevronRight, ChevronLeft, Bell, Package, TrendingUp,
  ShieldCheck, RefreshCcw, Mail, Boxes, Zap, Cpu, QrCode, Link2,
  Sparkles, Target, BookOpen, FlaskConical, IndianRupee, Truck, ScanLine, Lock, UserCircle,
  Upload, Store, Image as ImageIcon, ShoppingBag, Calculator
} from "lucide-react";
import clsx from "clsx";

const PLAN_ACCESS: Record<string, string[]> = {
  Lite: [
    "/dashboard", "/profile",
    "/tools/meesho-optimizer",
    "/tools/gst-calculator",
    "/keywords/frankenstein",
    "/listing/scribbles",
    "/tools/logistics-estimator",
    "/tools/url-builder",
    "/tools/qr-generator",
  ],
  Starter: [
    "/dashboard", "/profile",
    "/tools/meesho-optimizer",
    "/tools/gst-calculator",
    "/keywords/frankenstein",
    "/listing/scribbles",
    "/tools/logistics-estimator",
    "/tools/url-builder",
    "/tools/qr-generator",
    "/product-research/black-box",
    "/keywords/magnet",
    "/listing/builder",
    "/tools/bulk-analyzer",
    "/publish",
  ],
  Growth: [
    "/dashboard", "/profile",
    "/tools/meesho-optimizer",
    "/tools/gst-calculator",
    "/keywords/frankenstein",
    "/listing/scribbles",
    "/tools/logistics-estimator",
    "/tools/url-builder",
    "/tools/qr-generator",
    "/product-research/black-box",
    "/product-research/xray",
    "/keywords/magnet",
    "/keywords/cerebro",
    "/listing/builder",
    "/tools/bulk-analyzer",
    "/publish",
    "/tools/scanner",
    "/tools/copilot",
    "/tools/shopify-manager",
  ],
  Diamond: [] // Diamond has everything
};

const nav = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "My Profile",
    icon: UserCircle,
    href: "/profile",
  },
  {
    label: "Publish Products",
    icon: Upload,
    href: "/publish",
  },
  {
    label: "Product Research",
    icon: Search,
    children: [
      { label: "Black Box", href: "/product-research/black-box", icon: Package },
      { label: "Xray", href: "/product-research/xray", icon: Zap },
      { label: "Trendster", href: "/product-research/trendster", icon: TrendingUp },
      { label: "BSR Intelligence", href: "/product-research/bsr-intelligence", icon: Target },
      { label: "Trending Products", href: "/product-research/trending-products", icon: Zap },
    ],
  },
  {
    label: "Keywords",
    icon: KeyRound,
    children: [
      { label: "Cerebro", href: "/keywords/cerebro", icon: Cpu },
      { label: "Magnet", href: "/keywords/magnet", icon: Target },
      { label: "Frankenstein", href: "/keywords/frankenstein", icon: FlaskConical },
      { label: "Misspellinator", href: "/keywords/misspellinator", icon: Sparkles },
    ],
  },
  {
    label: "Listing Optimization",
    icon: FileText,
    children: [
      { label: "Meesho Image Optimizer", href: "/tools/meesho-optimizer", icon: ImageIcon },
      { label: "Listing Builder", href: "/listing/builder", icon: BookOpen },
      { label: "Scribbles", href: "/listing/scribbles", icon: FileText },
      { label: "Index Checker", href: "/listing/index-checker", icon: ShieldCheck },
      { label: "Listing Analyzer", href: "/listing/analyzer", icon: BarChart3 },
    ],
  },
  {
    label: "Operations",
    icon: Settings,
    children: [
      { label: "Alerts", href: "/operations/alerts", icon: Bell },
      { label: "Follow-Up", href: "/operations/follow-up", icon: Mail },
      { label: "Inventory", href: "/operations/inventory", icon: Boxes },
      { label: "Inventory Protector", href: "/operations/inventory-protector", icon: ShieldCheck },
      { label: "Refund Genie", href: "/operations/refund-genie", icon: RefreshCcw },
    ],
  },
  {
    label: "Analytics & Ads",
    icon: BarChart3,
    children: [
      { label: "Keyword Tracker", href: "/analytics/keyword-tracker", icon: TrendingUp },
      { label: "Bulk ASIN Analyzer", href: "/tools/bulk-analyzer", icon: FileText, highlight: true },
      { label: "Market Tracker", href: "/analytics/market-tracker", icon: BarChart3 },
      { label: "Ads (Adtomic)", href: "/analytics/ads", icon: Zap },
    ],
  },
  {
    label: "Tools",
    icon: Wrench,
    children: [
      { label: "Meesho Shipping Optimizer", href: "/tools/meesho-optimizer", icon: Package },
      { label: "AI Seller Scanner", href: "/tools/scanner", icon: ScanLine },
      { label: "AI Seller Copilot", href: "/tools/copilot", icon: Sparkles },
      { label: "Shopify Store Manager", href: "/tools/shopify-manager", icon: ShoppingBag },
      { label: "GST Invoice Builder", href: "/tools/gst-calculator", icon: Calculator },
      { label: "Logistics Estimator", href: "/tools/logistics-estimator", icon: Truck },
      { label: "URL Builder", href: "/tools/url-builder", icon: Link2 },
      { label: "QR Generator", href: "/tools/qr-generator", icon: QrCode },
    ],
  },
];

export default function Sidebar({ plan = "Starter", user = "", role = "user" }: { plan?: string; user?: string; role?: string }) {
  const pathname = usePathname();
  // Derive display name: if email, take part before @; capitalize
  const displayName = user
    ? user.includes("@")
      ? user.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase())
      : user
    : "Account";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(["Product Research", "Keywords", "Listing Optimization", "Operations", "Analytics & Ads", "Tools"]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/plans")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.plans) {
          setPlans(data.plans);
        }
      })
      .catch(e => console.error("Error loading plans:", e));
  }, []);

  const isActive = (href: string) => pathname === href;
  const hasAccess = (href: string, label: string) => {
    if (role === "admin") return true;
    const activePlan = plans.find(p => p.name === plan);
    if (!activePlan) {
      return plan === "Diamond" || (PLAN_ACCESS[plan] && PLAN_ACCESS[plan].includes(href));
    }
    if (activePlan.features.includes(label)) return true;
    if (activePlan.features.includes("Everything in Starter")) {
      const starterPlan = plans.find(p => p.name === "Starter");
      if (starterPlan && starterPlan.features.includes(label)) return true;
    }
    if (activePlan.features.includes("Everything in Growth")) {
      const growthPlan = plans.find(p => p.name === "Growth");
      if (growthPlan && growthPlan.features.includes(label)) return true;
      const starterPlan = plans.find(p => p.name === "Starter");
      if (starterPlan && starterPlan.features.includes(label)) return true;
    }
    if (["/dashboard", "/profile"].includes(href)) return true;
    return false;
  };

  return (
    <aside
      style={{
        width: collapsed ? "72px" : "260px",
        minWidth: collapsed ? "72px" : "260px",
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: "20px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        gap: 12,
        minHeight: 70,
      }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="RetailStacker Logo" style={{ width: 36, height: 36, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", display: "flex", alignItems: "center" }}>
                <span style={{ 
                  background: "linear-gradient(135deg, #0C1E36 65%, #00B4D8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block"
                }}>R</span>
                <span style={{ color: "#0C1E36" }}>etail</span>
                <span style={{ color: "#1A56DB" }}>Stacker</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Seller Platform</div>
            </div>
          </div>
        )}
        {collapsed && (
            <img src="/logo.png" alt="RetailStacker Logo" style={{ width: 36, height: 36 }} />
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 6, display: "flex" }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            margin: "12px auto",
            background: "var(--accent-muted)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            color: "var(--accent)",
            padding: "6px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 10px" }}>
        {nav.map((item) => {
          if (!item.children) {
            const access = hasAccess(item.href!, item.label);
            return (
              <div key={item.href} title={!access ? `Upgrade to unlock` : ""}>
                <Link href={access ? item.href! : `/dashboard?error=upgrade_required`} style={{ textDecoration: "none", pointerEvents: access ? "auto" : "none", opacity: access ? 1 : 0.6 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: collapsed ? "10px 14px" : "10px 12px",
                    borderRadius: 10,
                    marginBottom: 2,
                    cursor: access ? "pointer" : "not-allowed",
                    justifyContent: collapsed ? "center" : "space-between",
                    background: isActive(item.href!) ? "var(--accent-muted)" : "transparent",
                    border: isActive(item.href!) ? "1px solid var(--border-hover)" : "1px solid transparent",
                    color: isActive(item.href!) ? "var(--accent)" : "var(--text-secondary)",
                    transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <item.icon size={18} style={{ flexShrink: 0 }} />
                      {!collapsed && <span style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</span>}
                    </div>
                    {!collapsed && !access && <Lock size={14} color="var(--text-muted)" />}
                  </div>
                </Link>
              </div>
            );
          }

          const groupOpen = openGroups.includes(item.label);
          const groupActive = item.children.some(c => isActive(c.href));

          return (
            <div key={item.label} style={{ marginBottom: 4 }}>
              <button
                onClick={() => !collapsed && toggleGroup(item.label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: collapsed ? "10px 14px" : "10px 12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  justifyContent: collapsed ? "center" : "space-between",
                  background: groupActive ? "var(--accent-muted)" : "transparent",
                  border: "1px solid transparent",
                  color: groupActive ? "var(--accent)" : "var(--text-secondary)",
                  width: "100%",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (!groupActive) (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)"; }}
                onMouseLeave={e => { if (!groupActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <item.icon size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</span>}
                </div>
                {!collapsed && (
                  <ChevronRight
                    size={14}
                    style={{
                      transition: "transform 0.2s",
                      transform: groupOpen ? "rotate(90deg)" : "rotate(0deg)",
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>

              {!collapsed && groupOpen && (
                <div style={{ paddingLeft: 14, marginTop: 2 }}>
                  {item.children.map((child) => {
                    const access = hasAccess(child.href, child.label);
                    return (
                    <div key={child.href} title={!access ? `Upgrade to unlock` : ""}>
                      <Link href={access ? child.href : `/dashboard?error=upgrade_required`} style={{ textDecoration: "none", pointerEvents: access ? "auto" : "none", opacity: access ? 1 : 0.6 }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: 8,
                          marginBottom: 2,
                          cursor: access ? "pointer" : "not-allowed",
                          background: isActive(child.href) ? "var(--accent-muted)" : "transparent",
                          border: isActive(child.href) ? "1px solid var(--border-hover)" : "1px solid transparent",
                          color: isActive(child.href) ? "var(--accent)" : "var(--text-muted)",
                          transition: "all 0.15s",
                          fontSize: 13,
                          fontWeight: isActive(child.href) ? 600 : 400,
                        }}
                          onMouseEnter={e => { if (!isActive(child.href) && access) { (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}}
                          onMouseLeave={e => { if (!isActive(child.href) && access) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                            <child.icon size={14} style={{ flexShrink: 0, color: (child as any).highlight ? "var(--warning)" : "inherit" }} />
                            <span style={{ fontWeight: (child as any).highlight ? 700 : "inherit", color: (child as any).highlight ? "var(--accent)" : "inherit" }}>
                              {child.label}
                            </span>
                            {(child as any).highlight && (
                              <span style={{ 
                                marginLeft: "auto", 
                                background: "linear-gradient(135deg, #ff8c00, #ff007f)", 
                                color: "white", 
                                fontSize: 9, 
                                fontWeight: 800, 
                                padding: "2px 6px", 
                                borderRadius: 6, 
                                textTransform: "uppercase", 
                                letterSpacing: "0.05em",
                                boxShadow: "0 0 8px rgba(255, 0, 127, 0.5)",
                                flexShrink: 0
                              }}>
                                HOT
                              </span>
                            )}
                          </div>
                          {!access && <Lock size={12} color="var(--text-muted)" />}
                        </div>
                      </Link>
                    </div>
                  )})}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Reseller Admin Link */}
      {role === "reseller" && (
        <div style={{ padding: "0 16px 16px 16px" }}>
          <Link href="/reseller" style={{ textDecoration: "none" }}>
            <div style={{
              padding: "10px 12px",
              borderRadius: "10px",
              background: isActive("/reseller") ? "var(--accent)" : "rgba(255,107,53,0.1)",
              color: isActive("/reseller") ? "white" : "var(--accent)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              transition: "all 0.15s ease",
              border: isActive("/reseller") ? "1px solid var(--accent-glow)" : "1px solid transparent"
            }}>
              <ShieldCheck size={20} />
              {!collapsed && <span style={{ fontWeight: 600, fontSize: "14px" }}>Reseller Panel</span>}
            </div>
          </Link>
        </div>
      )}

      {/* Admin Panel Link */}
      {role === "admin" && (
        <div style={{ padding: "0 16px 16px 16px" }}>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <div style={{
              padding: "10px 12px",
              borderRadius: "10px",
              background: isActive("/admin") ? "var(--purple)" : "rgba(147,51,234,0.1)",
              color: isActive("/admin") ? "white" : "var(--purple)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              transition: "all 0.15s ease",
              border: isActive("/admin") ? "1px solid var(--purple)" : "1px solid transparent"
            }}>
              <ShieldCheck size={20} />
              {!collapsed && <span style={{ fontWeight: 600, fontSize: "14px" }}>Admin Panel</span>}
            </div>
          </Link>
        </div>
      )}

      {/* User profile at bottom */}
      {!collapsed && (
        <Link href="/profile" style={{ textDecoration: "none" }}>
          <div style={{
            padding: "16px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: plan === "Diamond" ? "linear-gradient(135deg, var(--purple), var(--blue))" : plan === "Growth" ? "var(--accent)" : "var(--text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontWeight: 700, fontSize: 14, color: "white",
              boxShadow: "0 0 0 2px var(--accent-muted)",
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{plan} Plan · Manage Profile</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
              <button 
                onClick={async (e) => {
                  e.preventDefault();
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
                style={{ fontSize: 10, color: "var(--danger)", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
              >
                Log Out
              </button>
            </div>
          </div>
        </Link>
      )}
    </aside>
  );
}
