import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { findUser, saveUser } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    if (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === "dummy_secret") {
      throw new Error("SERVER MISCONFIGURATION: Razorpay Key Secret is missing. Cannot verify payments.");
    }
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is successful, update user DB profile
      const cookieStore = await cookies();
      const userEmail = cookieStore.get("retailstacker_user")?.value;

      if (userEmail) {
        const user = findUser(userEmail);
        if (user) {
          user.hasTranslatorSubscription = true;
          saveUser(user);
        }
      }

      // Also set a cookie
      cookieStore.set("retailstacker_translator", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
