"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { loginAction, sendMobileOtpAction, verifyMobileOtpAction, registerWithMobileOtpAction } from "../../actions/auth";
import { ArrowRight, Mail, KeyRound, User, Briefcase, Lock, Phone } from "lucide-react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

type AuthMode = "login-user" | "login-reseller" | "signup-user" | "signup-reseller";

function GoogleButton({ role, label }: { role: string; label: string }) {
  return (
    <a
      href={`/api/auth/google?role=${role}`}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        width: "100%", padding: "13px 16px", borderRadius: 12,
        border: "1px solid var(--border)", background: "var(--bg-secondary)",
        color: "var(--text-primary)", fontSize: 15, fontWeight: 600,
        textDecoration: "none", transition: "all 0.2s", cursor: "pointer",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card-hover)", e.currentTarget.style.borderColor = "var(--border-hover)")}
      onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-secondary)", e.currentTarget.style.borderColor = "var(--border)")}
    >
      {/* Google G logo */}
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58(9 3.58z" fill="#EA4335"/>
      </svg>
      {label}
    </a>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>OR</span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const initialMode = searchParams.get("mode") === "signup" ? "signup-user" : "login-user";

  const [mode, setMode] = useState<AuthMode>(initialMode as AuthMode);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginInput, setLoginInput] = useState(""); // Email or Mobile number
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login-user" || mode === "login-reseller";
  const isReseller = mode === "login-reseller" || mode === "signup-reseller";
  const role = isReseller ? "reseller" : "user";
  const isEmailLogin = loginInput.includes("@");

  const switchTo = (m: AuthMode) => { 
    setMode(m); 
    setError(""); 
    setOtpSent(false); 
    setOtp("");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        if (isEmailLogin) {
          // Email + Password login
          const res = await loginAction(loginInput, password);
          if (res.error) {
            setError(res.error);
          } else {
            if (res.role === "reseller") router.push("/reseller");
            else router.push(callbackUrl);
          }
        } else {
          // Mobile OTP login
          const formattedMobile = loginInput.replace(/[^\d+]/g, "");
          if (!otpSent) {
            const res = await sendMobileOtpAction(formattedMobile, false);
            if (res.error) {
              setError(res.error);
            } else {
              setOtpSent(true);
            }
          } else {
            const res = await verifyMobileOtpAction(formattedMobile, otp);
            if (res.error) {
              setError(res.error);
            } else {
              if (res.role === "reseller") router.push("/reseller");
              else router.push(callbackUrl);
            }
          }
        }
      } else {
        // Signup Mode
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        if (!firstName || !lastName || !mobile || !email || !password) {
          setError("Please fill all required fields");
          setLoading(false);
          return;
        }
        const formattedMobile = mobile.replace(/[^\d+]/g, "");
        if (!otpSent) {
          const res = await sendMobileOtpAction(formattedMobile, true, email);
          if (res.error) {
            setError(res.error);
          } else {
            setOtpSent(true);
          }
        } else {
          const res = await registerWithMobileOtpAction(
            formattedMobile,
            otp,
            firstName,
            lastName,
            email,
            password,
            role
          );
          if (res.error) {
            setError(res.error);
          } else {
            router.push(isReseller ? "/reseller" : "/pricing");
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, var(--accent-muted) 0%, transparent 70%)", opacity: 0.5, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, var(--purple-muted) 0%, transparent 70%)", opacity: 0.5, pointerEvents: "none" }} />

      <div className="glass-card" style={{ width: "100%", maxWidth: 520, padding: "clamp(28px, 5vw, 48px)", zIndex: 10 }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <img src="/logo.png" alt="RetailStacker Logo" style={{ width: 48, height: 48 }} />
        </Link>

        {/* Tab Group: Login / Signup */}
        <div style={{ display: "flex", background: "var(--bg-primary)", borderRadius: 12, padding: 4, marginBottom: 20, border: "1px solid var(--border)" }}>
          {[
            { label: "Login", modes: ["login-user", "login-reseller"] as AuthMode[], target: (isReseller ? "login-reseller" : "login-user") as AuthMode },
            { label: "Sign Up", modes: ["signup-user", "signup-reseller"] as AuthMode[], target: (isReseller ? "signup-reseller" : "signup-user") as AuthMode },
          ].map(tab => {
            const active = tab.modes.includes(mode);
            return (
              <button key={tab.label} onClick={() => switchTo(tab.target)}
                style={{ flex: 1, padding: "10px", borderRadius: 8, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.2s", background: active ? "var(--accent)" : "transparent", color: active ? "white" : "var(--text-muted)" }}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Group: User / Reseller */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[
            { label: "User", icon: <User size={14} />, loginMode: "login-user" as AuthMode, signupMode: "signup-user" as AuthMode },
            { label: "Reseller", icon: <Briefcase size={14} />, loginMode: "login-reseller" as AuthMode, signupMode: "signup-reseller" as AuthMode },
          ].map(tab => {
            const active = isReseller ? tab.label === "Reseller" : tab.label === "User";
            const target = isLogin ? tab.loginMode : tab.signupMode;
            return (
              <button key={tab.label} onClick={() => switchTo(target)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: active ? "2px solid var(--accent)" : "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s", background: active ? "var(--accent-muted)" : "var(--bg-secondary)", color: active ? "var(--accent)" : "var(--text-muted)" }}>
                {tab.icon}{tab.label}
              </button>
            );
          })}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900, marginBottom: 6, textAlign: "center" }}>
          {isLogin ? (isReseller ? "Reseller Login" : "Welcome Back") : otpSent ? "Verify Your Phone" : (isReseller ? "Become a Reseller" : "Create Account")}
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 24 }}>
          {isLogin ? `Log in to your ${isReseller ? "reseller" : "RetailStacker"} workspace` : otpSent ? `Enter the 6-digit OTP sent to ${isLogin ? loginInput : mobile}` : `Sign up as a ${isReseller ? "reseller partner" : "seller"}`}
        </p>

        {/* Error */}
        {error && <div style={{ padding: "12px 16px", background: "var(--danger-muted)", border: "1px solid var(--danger)", borderRadius: 8, color: "var(--danger)", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>{error}</div>}

        {/* Google Sign In */}
        {!otpSent && (
          <>
            <GoogleButton role={role} label={isLogin ? `Continue with Google` : `Sign up with Google`} />
            <Divider />
          </>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {isLogin ? (
            /* LOGIN FLOW */
            otpSent ? (
              /* OTP verification for phone login */
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, color: "var(--text-secondary)" }}>
                  <Phone size={14} />
                  <span>OTP sent to mobile: <strong>{loginInput}</strong></span>
                </div>
                <div style={{ position: "relative" }}>
                  <KeyRound size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} required
                    style={{ width: "100%", padding: "13px 16px 13px 42px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15, outline: "none", letterSpacing: 4 }} />
                </div>
              </div>
            ) : (
              /* Initial login step */
              <>
                <div style={{ position: "relative" }}>
                  <Phone size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="text" placeholder="Mobile Number" value={loginInput} onChange={e => setLoginInput(e.target.value)} required
                    style={{ width: "100%", padding: "13px 16px 13px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                </div>
                {isEmailLogin && (
                  <div style={{ position: "relative" }}>
                    <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                      style={{ width: "100%", padding: "13px 16px 13px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                  </div>
                )}
              </>
            )
          ) : (
            /* SIGNUP FLOW */
            otpSent ? (
              /* OTP verification for signup */
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, color: "var(--text-secondary)" }}>
                  <Phone size={14} />
                  <span>OTP sent to mobile: <strong>{mobile}</strong></span>
                </div>
                <div style={{ position: "relative" }}>
                  <KeyRound size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} required
                    style={{ width: "100%", padding: "13px 16px 13px 42px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 15, outline: "none", letterSpacing: 4 }} />
                </div>
              </div>
            ) : (
              /* Signup fields */
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input type="text" placeholder="First Name *" value={firstName} onChange={e => setFirstName(e.target.value)} required
                    style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                  <input type="text" placeholder="Last Name *" value={lastName} onChange={e => setLastName(e.target.value)} required
                    style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                    style={{ padding: "13px 10px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, cursor: "pointer", outline: "none" }}>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+65">🇸🇬 +65</option>
                  </select>
                  <input type="tel" placeholder="Mobile Number *" value={mobile} onChange={e => setMobile(e.target.value)} required
                    style={{ flex: 1, padding: "13px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                </div>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="email" placeholder="Email Address *" value={email} onChange={e => setEmail(e.target.value)} required
                    style={{ width: "100%", padding: "13px 16px 13px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} required
                    style={{ width: "100%", padding: "13px 16px 13px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="password" placeholder="Confirm Password *" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    style={{ width: "100%", padding: "13px 16px 13px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                </div>
              </>
            )
          )}

          <button type="submit" disabled={loading} className="btn-accent"
            style={{ width: "100%", padding: 15, borderRadius: 12, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
            {loading ? "Processing..." : isLogin ? (isEmailLogin ? "Log In" : !otpSent ? "Send OTP to Mobile" : "Verify & Log In") : (!otpSent ? "Send OTP to Mobile" : "Verify & Create Account")}
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        {/* OTP resend */}
        {otpSent && (
          <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            Didn't receive the OTP?{" "}
            <span onClick={async () => { const targetNum = isLogin ? loginInput.replace(/[^\d+]/g, "") : mobile.replace(/[^\d+]/g, ""); const r = await sendMobileOtpAction(targetNum, !isLogin, email); if (r.error) setError(r.error); }} style={{ color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}>
              Resend OTP
            </span>
          </div>
        )}

        {/* Footer note */}
        <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => switchTo(isLogin ? (isReseller ? "signup-reseller" : "signup-user") : (isReseller ? "login-reseller" : "login-user"))}
            style={{ color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}>
            {isLogin ? "Sign Up" : "Log In"}
          </span>
        </div>
        <div style={{ marginTop: 12, textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
          By continuing, you agree to our{" "}
          <Link href="/privacy" style={{ color: "var(--accent)" }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} />}>
      <PublicNavbar />
      <AuthForm />
    </Suspense>
  );
}
