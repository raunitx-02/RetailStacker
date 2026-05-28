"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import Script from "next/script";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  {
    name: "Starter",
    price: 2999,
    priceStr: "₹2,999",
    period: "/month",
    color: "var(--text-muted)",
    desc: "Perfect for new sellers starting their Amazon India journey.",
    features: [
      "Black Box India (Basic)",
      "Magnet Keywords (50 searches/mo)",
      "Listing Optimizer",
      "GST & Customs Calculator",
      "Logistics Estimator",
      "1 Marketplace (Amazon.in)",
      "Community Support",
    ],
    highlight: false,
  },
  {
    name: "Growth",
    price: 5999,
    priceStr: "₹5,999",
    period: "/month",
    color: "var(--accent)",
    desc: "For serious sellers scaling across Indian marketplaces.",
    features: [
      "Everything in Starter",
      "Cerebro Reverse ASIN (Unlimited)",
      "Xray Live Market Intelligence",
      "Magnet Keywords (500 searches/mo)",
      "AI Seller Health Scanner",
      "Flipkart + Meesho Intelligence",
      "Keyword Tracker (500 words)",
      "Priority Email Support",
    ],
    highlight: true,
  },
  {
    name: "Diamond",
    price: 12999,
    priceStr: "₹12,999",
    period: "/month",
    color: "var(--purple)",
    desc: "For agencies and power sellers dominating multiple categories.",
    features: [
      "Everything in Growth",
      "Unlimited Search & Tracking",
      "ONDC Intelligence",
      "WhatsApp Commerce Analytics",
      "Multi-storefront AI Scanner",
      "AI Auto-Fix Listings (Hindi/Eng)",
      "Dedicated Account Manager",
      "Full API Access",
    ],
    highlight: false,
  },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  const handlePayment = async (planName: string, amount: number) => {
    setLoadingPlan(planName);
    try {
      // 1. Create order
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName, amount }),
      });

      if (orderRes.status === 401) {
        router.push("/login?mode=signup&callbackUrl=/pricing");
        return;
      }

      const orderData = await orderRes.json();
      
      if (!orderData.order) throw new Error("Order creation failed");

      // 2. Init Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "RetailStacker",
        description: `${planName} Plan Subscription`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          // 3. Verify payment
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planName
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            router.push(`/success?plan=${planName}`);
          } else {
            alert("Payment verification failed.");
            setLoadingPlan(null);
          }
        },
        prefill: {
          name: "Seller",
          email: "seller@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#00E5FF", // RetailStacker Accent
        },
        modal: {
          ondismiss: function() {
            setLoadingPlan(null);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
        setLoadingPlan(null);
      });
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", overflowX: "hidden" }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Nav */}
      <nav style={{ padding: "32px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "var(--accent)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 18 }}>N</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20 }}>RetailStacker</span>
        </Link>
        <Link href="/" style={{ textDecoration: "none", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </nav>

      {/* Header */}
      <section style={{ textAlign: "center", maxWidth: 800, margin: "60px auto 80px", padding: "0 24px" }}>
        <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 20 }}>
          Unlock the ultimate <br />seller intelligence
        </h1>
        <p style={{ fontSize: 20, color: "var(--text-muted)", lineHeight: 1.5 }}>
          Transparent pricing for serious sellers. Choose the plan that fits your scale.
        </p>
      </section>

      {/* Pricing Cards */}
      <section style={{ maxWidth: 1200, margin: "0 auto 120px", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, alignItems: "stretch" }}>
          {PLANS.map(plan => (
            <div key={plan.name} className="glass-card" style={{
              padding: 40, position: "relative", display: "flex", flexDirection: "column",
              border: plan.highlight ? "2px solid var(--accent)" : "1px solid var(--border)",
              transform: plan.highlight ? "scale(1.02)" : "none",
              boxShadow: plan.highlight ? "0 12px 60px var(--accent-glow)" : "none",
            }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "white", fontSize: 12, fontWeight: 800, padding: "6px 24px", borderRadius: "0 0 12px 12px", whiteSpace: "nowrap" }}>
                  RECOMMENDED FOR SCALING
                </div>
              )}
              <div style={{ marginBottom: 12, marginTop: plan.highlight ? 12 : 0 }}>
                <div style={{ fontWeight: 900, fontSize: 24, marginBottom: 8, color: plan.highlight ? "var(--accent)" : "var(--text-primary)" }}>{plan.name}</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, minHeight: 42 }}>{plan.desc}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 48, fontWeight: 900 }}>{plan.priceStr}</span>
                  <span style={{ fontSize: 16, color: "var(--text-muted)", fontWeight: 600 }}>{plan.period}</span>
                </div>
              </div>
              
              <button
                onClick={() => handlePayment(plan.name, plan.price)}
                disabled={loadingPlan === plan.name}
                style={{ 
                  width: "100%", padding: "16px", borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: loadingPlan === plan.name ? "not-allowed" : "pointer", border: "none", 
                  background: plan.highlight ? "var(--accent)" : "var(--bg-secondary)", 
                  color: plan.highlight ? "var(--bg-primary)" : "var(--text-primary)", 
                  boxShadow: plan.highlight ? "0 4px 16px var(--accent-glow)" : "none", 
                  transition: "all 0.2s",
                  marginTop: 24,
                  marginBottom: 32,
                  display: "flex", justifyContent: "center", alignItems: "center"
                }}
              >
                {loadingPlan === plan.name ? (
                  <span style={{ display: "inline-block", width: 20, height: 20, border: "2px solid", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </button>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)" }}>FEATURES INCLUDED:</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 15, fontWeight: 500 }}>
                      <CheckCircle size={18} color={plan.highlight ? "var(--accent)" : "var(--success)"} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security Banner */}
      <section style={{ textAlign: "center", padding: "0 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-muted)", fontSize: 14, fontWeight: 600 }}>
          <ShieldCheck size={20} /> 100% Secure Payments powered by Razorpay. 14-day money back guarantee.
        </div>
      </section>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
