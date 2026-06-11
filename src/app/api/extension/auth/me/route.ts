import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUser } from "@/lib/db";
import { corsResponse, getCorsHeaders } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(req),
  });
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get("retailstacker_user")?.value;

    if (!userEmail) {
      return corsResponse(req, NextResponse.json({ loggedIn: false }));
    }

    // Special hardcoded admin accounts
    if (userEmail === "admin@admin.com" || userEmail === "admin@retailstacker.com") {
      return corsResponse(req, NextResponse.json({
        loggedIn: true,
        user: {
          email: userEmail,
          firstName: "Admin",
          lastName: "User",
          plan: "Diamond",
          role: "admin",
        },
      }));
    }

    const user = findUser(userEmail);
    if (!user) {
      return corsResponse(req, NextResponse.json({ loggedIn: false }));
    }

    const userPlan = user.plan || "Free";

    return corsResponse(req, NextResponse.json({
      loggedIn: true,
      user: {
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        mobile: user.mobile || "",
        plan: userPlan,
        role: user.role || "user",
      },
    }));
  } catch (err: any) {
    console.error("Extension session check error:", err);
    return corsResponse(req, NextResponse.json({ error: "Internal Server Error" }, { status: 500 }));
  }
}

