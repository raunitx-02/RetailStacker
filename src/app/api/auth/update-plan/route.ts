import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { plan } = await req.json();
  const validPlans = ["Starter", "Growth", "Diamond"];
  if (!validPlans.includes(plan)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const cookieStore = await cookies();
  const currentUser = cookieStore.get("retailstacker_user")?.value;
  if (!currentUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Admin cannot downgrade
  if (currentUser === "admin@admin.com") return NextResponse.json({ error: "Admin plan cannot be changed" }, { status: 403 });

  cookieStore.set("retailstacker_plan", plan, { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" });
  return NextResponse.json({ success: true, plan });
}
