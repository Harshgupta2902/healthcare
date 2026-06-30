import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardApp } from "./_components/DashboardApp";
import { getClientDashboardData } from "@/features/client/actions";
import { getProfessionalDashboardData } from "@/features/professional/actions";
import type { DashboardRole } from "./_components/dashboard-nav";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?auth=login&redirect=/dashboard");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (userData?.role || "client") as DashboardRole | "admin";

  if (role === "admin") {
    redirect("/application/enter");
  }

  const dashboardRole: DashboardRole = role === "professional" ? "professional" : "client";

  let dashboardData: Record<string, unknown> = { user };
  if (dashboardRole === "professional") {
    const r = await getProfessionalDashboardData();
    if (r.success) {
      const { success: _s, ...rest } = r;
      dashboardData = rest;
    } else {
      dashboardData = { user, dashboardError: r.error };
    }
  } else {
    const r = await getClientDashboardData();
    if (r.success) {
      const { success: _s, ...rest } = r;
      dashboardData = rest;
    } else {
      dashboardData = { user, dashboardError: r.error };
    }
  }

  return <DashboardApp role={dashboardRole} initialData={dashboardData} />;
}
