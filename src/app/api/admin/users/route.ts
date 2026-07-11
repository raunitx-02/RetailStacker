import { NextResponse } from "next/server";
import { getAllUsers, saveUser, deleteUser, getPlans, getTranslatorAttempts } from "@/lib/db";
import { cookies } from "next/headers";

// Verify admin helper
async function isAdmin() {
  const cookieStore = await cookies();
  const role = cookieStore.get("retailstacker_role")?.value;
  const user = cookieStore.get("retailstacker_user")?.value;
  return role === "admin" || user === "admin@retailstacker.com" || user === "admin@admin.com";
}

export async function GET() {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const users = getAllUsers();
    const plans = getPlans();
    const translatorAttempts = getTranslatorAttempts();

    // Calculate dynamic stats
    const planPrices: Record<string, number> = {};
    plans.forEach((p: any) => {
      planPrices[p.name] = p.price;
    });

    let totalEarnings = 0;
    let starterCount = 0;
    let growthCount = 0;
    let diamondCount = 0;
    let freeCount = 0;

    users.forEach((u: any) => {
      const planName = u.plan || "Free";
      if (planName === "Starter") {
        starterCount++;
        totalEarnings += planPrices["Starter"] || 2999;
      } else if (planName === "Growth") {
        growthCount++;
        totalEarnings += planPrices["Growth"] || 5999;
      } else if (planName === "Diamond") {
        diamondCount++;
        totalEarnings += planPrices["Diamond"] || 12999;
      } else {
        freeCount++;
      }
    });
    const grandTotalEarnings = totalEarnings;

    return NextResponse.json({
      success: true,
      users,
      translatorAttempts,
      stats: {
        totalUsers: users.length,
        totalEarnings: grandTotalEarnings,
        activeSubscriptions: starterCount + growthCount + diamondCount,
        planDistribution: {
          Starter: starterCount,
          Growth: growthCount,
          Diamond: diamondCount,
          Free: freeCount
        }
      }
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

    const { action, email, firstName, lastName, mobile, plan } = await req.json();

    if (action === "update") {
      const users = getAllUsers();
      const existingUser = users.find((u: any) => u.email === email);
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const updatedUser = {
        ...existingUser,
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        mobile: mobile || existingUser.mobile,
        plan: plan || existingUser.plan || "Free"
      };

      saveUser(updatedUser);
      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (action === "delete") {
      deleteUser(email);
      return NextResponse.json({ success: true, message: "User banned/deleted successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
