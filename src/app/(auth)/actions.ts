"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginWithPlan(plan: string, callbackUrl: string = "/dashboard") {
  const cookieStore = await cookies();
  cookieStore.set("retailstacker_plan", plan, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  cookieStore.set("retailstacker_user", "Raunit Jha", {
    path: "/",
  });
  redirect(callbackUrl);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("retailstacker_plan");
  cookieStore.delete("retailstacker_user");
  redirect("/");
}
