import { NextResponse, NextRequest } from "next/server";
import Razorpay from "razorpay";
import { cookies } from "next/headers";
import { logTranslatorAttempt } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === "dummy_key") {
      throw new Error("SERVER MISCONFIGURATION: Razorpay Key ID is missing. Cannot process payments.");
    }
    if (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === "dummy_secret") {
      throw new Error("SERVER MISCONFIGURATION: Razorpay Key Secret is missing. Cannot process payments.");
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const cookieStore = await cookies();
    const user = cookieStore.get("retailstacker_user")?.value;
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { plan, amount } = await req.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${plan}_${Date.now()}`,
      notes: { plan },
    });

    if (plan === "Translator Addon") {
      logTranslatorAttempt({
        id: order.id,
        email: user,
        amount: amount,
        status: "pending"
      });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
