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
  try {
    if (role === 'professional') {
      dashboardData = await getProfessionalDashboardData();
    } else {
      dashboardData = await getClientDashboardData();
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }

  return (
    <div className="min-h-screen bg-[#eff4fb] relative">
      {/* Premium Theme Gradient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#eaf1ff] via-[#f3f6fb] to-[#d8e6ff] opacity-80" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-100/30 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 py-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        {role === 'professional' ? (
          <ProfessionalDashboard initialData={dashboardData} />
        ) : (
          <ClientDashboard initialData={dashboardData} />
        )}
      </div>
    </div>
  );
}