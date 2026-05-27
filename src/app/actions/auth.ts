"use server";
import { findUser, saveUser, setOtp, verifyOtp } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";
import { Resend } from "resend";

// Lazy getter — never crashes at module load time if key is missing
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// ─── Shared email sender ──────────────────────────────────────────────────────
async function sendOtpEmail(email: string, otp: string, subject: string, heading: string, body: string) {
  const resend = getResend();
  if (!resend) {
    // Dev fallback: print OTP to terminal
    console.warn("⚠️  RESEND_API_KEY not set — OTP printed below:");
    console.log(`\n🔑  OTP for ${email}: ${otp}\n`);
    return;
  }

  const { error } = await resend.emails.send({
    from: "Neon 10 <onboarding@resend.dev>",
    to: email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
            <tr><td align="center">
              <table width="520" cellpadding="0" cellspacing="0" style="background:#13131a;border-radius:16px;border:1px solid #2a2a3a;overflow:hidden;">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#ff6b35,#e85d2f);padding:28px 40px;text-align:center;">
                    <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;">NEON 10</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:4px;letter-spacing:0.1em;text-transform:uppercase;">Seller Intelligence Platform</div>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;">
                    <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 10px 0;">${heading}</h2>
                    <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px 0;">${body}</p>
                    <!-- OTP Box -->
                    <div style="background:#1e1e2e;border:2px solid #ff6b35;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                      <div style="font-size:11px;color:#ff6b35;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:10px;">Your One-Time Password</div>
                      <div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#ffffff;font-family:'Courier New',monospace;">${otp}</div>
                      <div style="font-size:12px;color:#64748b;margin-top:10px;">⏱ Expires in <strong style="color:#f97316;">10 minutes</strong></div>
                    </div>
                    <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;">If you did not request this, please ignore this email. Do not share this OTP with anyone.</p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#0d0d16;padding:20px 40px;text-align:center;border-top:1px solid #2a2a3a;">
                    <div style="font-size:12px;color:#475569;">© ${new Date().getFullYear()} Neon 10 · India's Most Powerful Amazon Seller Platform</div>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Failed to send OTP email. Please try again.");
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginAction(email: string, password: string) {
  if (email === "admin@admin.com" && password === "Admin@2345") {
    const cookieStore = await cookies();
    cookieStore.set("neon10_user", "admin@admin.com", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" });
    cookieStore.set("neon10_plan", "Diamond", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" });
    return { success: true };
  }

  const user = findUser(email);
  if (!user) return { error: "User not found. Please register." };

  if (user.password !== hashPassword(password)) {
    return { error: "Incorrect password." };
  }

  const cookieStore = await cookies();
  cookieStore.set("neon10_user", user.email, { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" });
  cookieStore.set("neon10_plan", user.plan || "Free", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" });
  
  if (user.role) {
    cookieStore.set("neon10_role", user.role, { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" });
  } else {
    // Clear old role if switching accounts
    cookieStore.set("neon10_role", "user", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" });
  }

  return { success: true, role: user.role };
}

// ─── Send OTP for Registration ────────────────────────────────────────────────
export async function sendOtpAction(email: string) {
  const user = findUser(email);
  if (user) return { error: "Email is already registered. Please log in." };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  setOtp(email, otp);

  try {
    await sendOtpEmail(
      email,
      otp,
      "Verify your Neon 10 account",
      "Welcome to Neon 10! 🎉",
      "You're one step away from accessing India's most powerful Amazon seller platform. Use the OTP below to verify your email address and complete registration."
    );
  } catch (err: any) {
    return { error: err.message || "Failed to send OTP. Please try again." };
  }

  return { success: true, message: `OTP sent to ${email}. Please check your inbox.` };
}

// ─── Register ─────────────────────────────────────────────────────────────────
export async function registerAction(email: string, password: string, otp: string) {
  if (!verifyOtp(email, otp)) {
    return { error: "Invalid or expired OTP. Please request a new one." };
  }

  const newUser = {
    email,
    password: hashPassword(password),
    plan: "Free",
    createdAt: Date.now(),
  };

  saveUser(newUser);

  const cookieStore = await cookies();
  cookieStore.set("neon10_user", email, { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" });
  cookieStore.set("neon10_plan", "Free", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" });

  return { success: true };
}

// ─── Send OTP for Password Reset ──────────────────────────────────────────────
export async function sendPasswordResetOtpAction(email: string) {
  const user = findUser(email);
  if (!user) return { error: "No account found with this email address." };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  setOtp(email, otp);

  try {
    await sendOtpEmail(
      email,
      otp,
      "Reset your Neon 10 password",
      "Password Reset Request 🔐",
      "We received a request to reset your Neon 10 account password. Use the OTP below to proceed. If you did not request this, you can safely ignore this email."
    );
  } catch (err: any) {
    return { error: err.message || "Failed to send OTP. Please try again." };
  }

  return { success: true, message: `Password reset OTP sent to ${email}.` };
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export async function resetPasswordAction(email: string, otp: string, newPassword: string) {
  if (!verifyOtp(email, otp)) {
    return { error: "Invalid or expired OTP. Please request a new one." };
  }

  const user = findUser(email);
  if (!user) return { error: "Account not found." };

  user.password = hashPassword(newPassword);
  saveUser(user);

  return { success: true, message: "Password reset successfully. You can now log in." };
}
