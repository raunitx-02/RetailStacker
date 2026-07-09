"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Download, Globe, CheckCircle, ShieldCheck, CreditCard, Sparkles, Star } from "lucide-react";

declare global {
  interface Window { Razorpay: any; }
}

export default function TranslatorToolPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const router = useRouter();

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/extension/auth/me");
      const data = await res.json();
      if (data.loggedIn && data.user) {
        setUser(data.user);
      } else {
        router.push("/login?callbackUrl=/tools/translator");
      }
    } catch (e) {
      console.error("Failed fetching auth session:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleSubscribe = async () => {
    setPaying(true);
    try {
      // Amount is 599 INR
      const amount = 599;
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "Translator Addon", amount }),
      });

      if (orderRes.status === 401) {
        router.push("/login?callbackUrl=/tools/translator");
        return;
      }

      const orderData = await orderRes.json();
      if (!orderData.order) throw new Error("Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "RetailStacker",
        description: "English Language Converter Addon",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/razorpay/verify-translator", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment successful! Your Translator Subscription is now active.");
            fetchSession(); // reload profile state
          } else {
            alert("Payment verification failed.");
            setPaying(false);
          }
        },
        prefill: {
          name: `${user?.firstName || "Seller"}`,
          email: user?.email || "seller@example.com",
          contact: user?.mobile || "9999999999"
        },
        theme: { color: "#9b30ff" },
        modal: {
          ondismiss: function () {
            setPaying(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay workflow failed:", err);
      alert("Something went wrong processing payment. Please try again.");
      setPaying(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/english-language-converter.zip";
    link.download = "english-language-converter.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ padding: 40, color: "var(--text-secondary)", background: "var(--bg-primary)", minHeight: "100vh" }}>
        Loading Sourcing Addons...
      </div>
    );
  }

  const isSubscribed = !!user?.hasTranslatorSubscription;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 40 }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(155, 48, 255, 0.15)", color: "var(--purple)", borderRadius: 50, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          <Sparkles size={14} /> Sourcing Add-ons
        </div>
        <h1 className="page-title">English Language Converter</h1>
        <p className="page-subtitle">Instantly convert foreign supply chain websites and supplier portals to clean English dialects.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
        
        {/* Main Details and Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>Why Sourcing Agents Love This Addon</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { title: "Dynamic Auto-Translation", desc: "Browse any website natively in English. Translates headings, menus, and details dynamically." },
                { title: "Real-time Mutation Observer", desc: "Keeps translating continuous infinite scrolling lists (like product catalogs) as you scroll down." },
                { title: "US, UK, and India Dialects", desc: "Select spelling preferences. India English converts RMB/USD values to INR format automatically." },
                { title: "Zero Reloads Needed", desc: "Revert back to the native language or toggle translator with one click in the extension popup." }
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  <CheckCircle size={18} color="var(--purple)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{item.title}</h4>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 24, background: "rgba(255,255,255,0.01)", border: "1px dashed var(--border)" }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "var(--text-secondary)" }}>How to install after purchase:</h4>
            <ol style={{ paddingLeft: 18, fontSize: 12, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 6, lineHeight: 1.5 }}>
              <li>Download the `english-language-converter.zip` package file.</li>
              <li>Extract it to a dedicated folder on your disk.</li>
              <li>Open your Chrome browser and head to `chrome://extensions/`.</li>
              <li>Enable **Developer Mode** in the top right corner.</li>
              <li>Click **Load unpacked** and select the extracted folder.</li>
              <li>Log in inside the extension popup and click the toggle switch!</li>
            </ol>
          </div>
        </div>

        {/* Subscription Status Card / Pricing card */}
        <div>
          {isSubscribed ? (
            <div className="glass-card" style={{ padding: 32, border: "1px solid rgba(16, 185, 129, 0.35)", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-card) 100%)", textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)", margin: "0 auto 20px" }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>Subscription Active</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.5 }}>
                Your Premium English Language Converter addon subscription is active. You can download the extension below and start using it instantly.
              </p>

              <button
                onClick={handleDownload}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  background: "var(--success)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 8px 20px rgba(16, 185, 129, 0.2)",
                  transition: "all 0.2s"
                }}
              >
                <Download size={18} /> Download Extension (ZIP)
              </button>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 32, border: "1px solid rgba(155, 48, 255, 0.35)", background: "linear-gradient(135deg, rgba(155, 48, 255, 0.05) 0%, var(--bg-card) 100%)", textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(155, 48, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--purple)", margin: "0 auto 20px" }}>
                <Globe size={32} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: "var(--text-primary)" }}>Premium Add-on</h3>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 4, margin: "16px 0 24px" }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)" }}>₹599</span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>/ month</span>
              </div>

              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 28, lineHeight: 1.5 }}>
                Unlock high-fidelity language translation on all platforms in the world. Note: The translator subscription is independent of standard platform plans.
              </p>

              <button
                onClick={handleSubscribe}
                disabled={paying}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  background: "var(--purple)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 8px 20px rgba(155, 48, 255, 0.2)",
                  transition: "all 0.2s"
                }}
              >
                <CreditCard size={18} /> {paying ? "Processing Order..." : "Subscribe Now via Razorpay"}
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--text-muted)", fontSize: 11, marginTop: 18 }}>
                <ShieldCheck size={14} /> 100% secure payment gateway. cancel anytime.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
