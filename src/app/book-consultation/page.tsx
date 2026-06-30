import { BookConsultationPageClient } from "./BookConsultationPageClient";

type PageProps = {
  searchParams: Promise<{ cref?: string }>;
};

export default async function BookConsultationPage({ searchParams }: PageProps) {
  void searchParams;
  return <BookConsultationPageClient />;
}
