import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientDashboard } from "./_components/ClientDashboard";
import { ProfessionalDashboard } from "./_components/ProfessionalDashboard";
import { getClientDashboardData } from "@/features/client/actions";
import { getProfessionalDashboardData } from "@/features/professional/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  // Fetch user role from database
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = userData?.role || 'client';

  // Redirect admin to admin panel if they somehow land here
  if (role === 'admin') {
    redirect('/application/enter');
  }

  let dashboardData: any = { user };
  if (role === "professional") {
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

  return (
    <div className="relative min-h-screen overflow-x-clip bg-lp-surface">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lp-surface-container-low via-lp-surface to-lp-secondary-fixed/40 opacity-90" />
        <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] animate-pulse rounded-full bg-lp-brand/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-lp-surface-variant/50 blur-[140px]" />
      </div>

      <div className="relative z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        {role === 'professional' ? (
          <ProfessionalDashboard initialData={dashboardData} />
        ) : (
          <ClientDashboard initialData={dashboardData} />
        )}
      </div>
    </div>
  );
}