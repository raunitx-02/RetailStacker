"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { loginAction, sendOtpAction, registerAction } from "../../actions/auth";
import { ArrowRight, Mail, Lock, KeyRound } from "lucide-react";
import Link from "next/link";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const initialMode = searchParams.get("mode");

  const [isLogin, setIsLogin] = useState(initialMode !== "signup");
  
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const res = await loginAction(email, password);
        if (res.error) setError(res.error);
        else {
          if (res.role === "reseller") {
            router.push("/reseller");
          } else {
            router.push(callbackUrl);
          }
        }
      } else {
        if (!otpSent) {
          if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
          }
          if (!firstName || !lastName || !mobile) {
            setError("Please fill all required fields");
            setLoading(false);
            return;
          }
          const res = await sendOtpAction(email);
          if (res.error) setError(res.error);
          else {
            setOtpSent(true);
            alert(res.message);
          }
        } else {
          // Send all registration info if the backend accepts it in the future, 
          // for now registerAction just takes email, password, otp.
          const res = await registerAction(email, password, otp);
          if (res.error) setError(res.error);
          else router.push(callbackUrl);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, var(--accent-muted) 0%, transparent 70%)", opacity: 0.5, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, var(--purple-muted) 0%, transparent 70%)", opacity: 0.5, pointerEvents: "none" }} />

      <div className="glass-card" style={{ width: "100%", maxWidth: isLogin ? 440 : 500, padding: 48, zIndex: 10 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: "var(--accent)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px var(--accent-glow)" }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 24 }}>N</span>
          </div>
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>
          {isLogin ? "Welcome Back" : (otpSent ? "Verify Email" : "Create Account")}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", marginBottom: 32 }}>
          {isLogin ? "Log in to your Neon 10 workspace" : (otpSent ? "Enter the OTP sent to your email" : "Sign up for the ultimate seller platform")}
        </p>

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--warning-muted)", border: "1px solid var(--warning)", borderRadius: 8, color: "var(--warning)", fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {(!isLogin && otpSent) ? (
            <div style={{ position: "relative" }}>
              <KeyRound size={18} color="var(--text-muted)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15 }}
              />
            </div>
          ) : (
            <>
              {!isLogin && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15 }}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15 }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <select
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      style={{ padding: "14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15, cursor: "pointer", outline: "none" }}
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+65">🇸🇬 +65</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      required
                      style={{ flex: 1, padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15 }}
                    />
                  </div>
                </>
              )}
              
              <div style={{ position: "relative" }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15 }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15 }}
                />
              </div>
              
              {!isLogin && (
                <div style={{ position: "relative" }}>
                  <Lock size={18} color="var(--text-muted)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15 }}
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-accent"
            style={{ width: "100%", padding: 16, borderRadius: 12, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}
          >
            {loading ? "Processing..." : (isLogin ? "Log In" : (otpSent ? "Verify & Register" : "Send OTP"))}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: 32, textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => { setIsLogin(!isLogin); setOtpSent(false); setError(""); }}
            style={{ color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}
          >
            {isLogin ? "Sign Up" : "Log In"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} />}>
      <AuthForm />
    </Suspense>
  );
}
