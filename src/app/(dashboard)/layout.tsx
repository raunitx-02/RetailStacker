import { cookies } from "next/headers";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const plan = cookieStore.get("neon10_plan")?.value || "Starter";
  const user = cookieStore.get("neon10_user")?.value || "User";
  const role = cookieStore.get("neon10_role")?.value || "user";

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
