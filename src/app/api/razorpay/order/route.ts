import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "dummy_key",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
    });

    const cookieStore = await cookies();
    const user = cookieStore.get("neon10_user")?.value;
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

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
