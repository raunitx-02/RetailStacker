import { cookies } from "next/headers";
import ProfileClient from "./ProfileClient";
import { findUser } from "@/lib/db";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const email = cookieStore.get("retailstacker_user")?.value || "";
  let plan = cookieStore.get("retailstacker_plan")?.value || "Free";
  if (email) {
    const dbUser = findUser(email);
    if (dbUser) {
      plan = dbUser.plan || "Free";
    }
  }
  return <ProfileClient initialPlan={plan} initialEmail={email} />;
}
