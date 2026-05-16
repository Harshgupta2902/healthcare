import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookConsultationPageClient } from "./BookConsultationPageClient";

type PageProps = {
  searchParams: Promise<{ cref?: string }>;
};

export default async function BookConsultationPage({ searchParams }: PageProps) {
  const { cref } = await searchParams;
  const crefToken = cref?.trim();

  if (crefToken) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const returnTo = `/book-consultation?cref=${encodeURIComponent(crefToken)}`;
      redirect(`/login?redirect=${encodeURIComponent(returnTo)}`);
    }
  }

  return <BookConsultationPageClient />;
}
