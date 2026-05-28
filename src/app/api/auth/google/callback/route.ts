import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUser, saveUser } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function appendSignupCsv(data: { firstName: string; lastName: string; email: string; mobile: string; role: string; plan: string }) {
  const CSV_PATH = path.join(process.cwd(), "signups.csv");
  const header = "Date,First Name,Last Name,Email,Mobile,Role,Plan\n";
  const row = `${new Date().toISOString()},${data.firstName},${data.lastName},${data.email},${data.mobile},${data.role},${data.plan}\n`;
  try {
    if (!fs.existsSync(CSV_PATH)) fs.writeFileSync(CSV_PATH, header, "utf8");
    fs.appendFileSync(CSV_PATH, row, "utf8");
  } catch (e) { console.error("Failed to write signups.csv:", e); }
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://retailstacker.com";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_not_configured`);
  }

  const code = req.nextUrl.searchParams.get("code");
  const role = req.nextUrl.searchParams.get("state") || "user";
  const errorParam = req.nextUrl.searchParams.get("error");

  if (errorParam || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_cancelled`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_token_failed`);
    }

    // Get user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_no_email`);
    }

    // Find or create user
    let user = findUser(googleUser.email);
    const isNewUser = !user;

    if (!user) {
      const nameParts = (googleUser.name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      user = {
        email: googleUser.email,
        firstName,
        lastName,
        mobile: "",
        password: "", // No password for Google users
        googleId: googleUser.id,
        plan: "Free",
        role,
        createdAt: Date.now(),
      };
      saveUser(user);
      appendSignupCsv({ firstName, lastName, email: googleUser.email, mobile: "", role, plan: "Free" });
    }

    // Set auth cookies
    const cookieStore = await cookies();
    cookieStore.set("retailstacker_user", user.email, { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" });
    cookieStore.set("retailstacker_plan", user.plan || "Free", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" });
    cookieStore.set("retailstacker_role", user.role || "user", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" });

    // New users go to pricing to pick a plan, existing go to dashboard
    if (isNewUser) {
      return NextResponse.redirect(`${baseUrl}/pricing`);
    } else if (user.role === "reseller") {
      return NextResponse.redirect(`${baseUrl}/reseller`);
    } else {
      return NextResponse.redirect(`${baseUrl}/dashboard`);
    }
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=google_error`);
  }
}
