import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookConsultationPageClient } from "./BookConsultationPageClient";

type PageProps = {
  searchParams: Promise<{ cref?: string }>;
};

export default async function BookConsultationPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const params = await searchParams;
    const query = new URLSearchParams();
    const cref = params.cref?.trim();
    if (cref) query.set("cref", cref);
    const returnTo = query.toString() ? `/book-consultation?${query.toString()}` : "/book-consultation";
    redirect(`/login?redirect=${encodeURIComponent(returnTo)}`);
  }

  return <BookConsultationPageClient />;
}
