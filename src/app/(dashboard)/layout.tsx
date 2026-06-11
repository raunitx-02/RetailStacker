import { cookies } from "next/headers";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { findUser } from "@/lib/db";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const user = cookieStore.get("retailstacker_user")?.value || "User";
  const role = cookieStore.get("retailstacker_role")?.value || "user";
  
  let plan = cookieStore.get("retailstacker_plan")?.value || "Starter";
  if (user && user !== "User") {
    const dbUser = findUser(user);
    if (dbUser) {
      plan = dbUser.plan || "Free";
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <Sidebar plan={plan} user={user} role={role} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        <Topbar user={user} plan={plan} />
        <main style={{ flex: 1, padding: "28px", overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
