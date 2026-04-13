import { Metadata } from "next";
import { searchProfessionals } from "@/features/professional/actions";
import ConsultantsContent from "./ConsultantsContent";

interface PageProps {
    searchParams: Promise<{ q?: string; specialty?: string }>;
}

export const metadata: Metadata = {
    title: "Browse Consultants | HealthHere",
    description: "Find and book verified medical consultants across various specializations.",
};

export default async function ConsultantsPage({ searchParams }: PageProps) {
    const { q, specialty } = await searchParams;

    const searchResult = await searchProfessionals(specialty === "all" ? "" : specialty);
    const professionals = searchResult.success ? searchResult.data : [];

    // Filter by name server-side if query exists
    let filtered = professionals;
    if (q) {
        filtered = professionals.filter(p =>
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.specialization.toLowerCase().includes(q.toLowerCase())
        );
    }

    return (
        <ConsultantsContent initialProfessionals={filtered} />
    );
}
