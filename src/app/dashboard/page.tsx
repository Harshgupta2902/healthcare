"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Phone } from "lucide-react";
import { ClientDashboard } from "./_components/ClientDashboard";
import { ProfessionalDashboard } from "./_components/ProfessionalDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || 'client');
      } else {
        router.push("/login?redirect=/dashboard");
      }
      setIsPending(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || 'client');
      } else {
        setUser(null);
        setRole(null);
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--color-primary)] mx-auto" />
          <p className="text-lg font-medium text-slate-600 animate-pulse">Initializing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Determine which background to show based on role
  const bgImage = role === 'professional'
    ? 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1920'
    : 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/professional-photograph-of-a-person-fill-f0c94809-20251120130450.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] relative overflow-x-hidden">
      {/* Dynamic Aesthetic Background */}
      <div
        className="absolute inset-0 z-0 opacity-10 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      <div className="relative z-10 py-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        {role === 'professional' ? (
          <ProfessionalDashboard user={user} />
        ) : (
          <ClientDashboard user={user} />
        )}
      </div>

      {/* Optional: Dashboard Support Footer (keeping it minimal or removing if layout footer is enough) */}
      <div className="relative z-10 bg-white/30 backdrop-blur-sm border-t border-slate-200 mt-20">
        <div className="container py-8 text-center text-sm text-slate-500">
          Need help with your dashboard? <span className="font-bold text-indigo-600 cursor-pointer">Contact Tech Support</span>
        </div>
      </div>
    </div>
  );
}