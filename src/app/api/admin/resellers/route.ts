import { NextResponse } from "next/server";
import { getAllResellers, saveUser, deleteUser, findUser } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

async function isAdmin() {
  const cookieStore = await cookies();
  const role = cookieStore.get("retailstacker_role")?.value;
  const user = cookieStore.get("retailstacker_user")?.value;
  return role === "admin" || user === "admin@retailstacker.com" || user === "admin@admin.com";
}

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function GET() {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const resellers = getAllResellers();
    return NextResponse.json({
      success: true,
      resellers
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { action, email, firstName, lastName, mobile, password } = await req.json();

    if (action === "create") {
      if (!email || !password || !firstName || !lastName || !mobile) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
      }

      if (findUser(email)) {
        return NextResponse.json({ error: "User or reseller with this email already exists" }, { status: 400 });
      }

      const newReseller = {
        id: "reseller-" + Math.random().toString(36).substring(2, 9),
        email,
        password: hashPassword(password),
        firstName,
        lastName,
        mobile,
        plan: "Diamond", // default reseller plan
        role: "reseller",
        createdAt: Date.now()
      };

      saveUser(newReseller);
      return NextResponse.json({ success: true, reseller: newReseller });
    }

    if (action === "delete") {
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }
      deleteUser(email);
      return NextResponse.json({ success: true, message: "Reseller deleted successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
