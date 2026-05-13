import type { Metadata } from "next";
import { searchProfessionals } from "@/features/professional/actions";
import ConsultantsContent from "./ConsultantsContent";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

interface PageProps {
    searchParams: Promise<{ q?: string; specialty?: string }>;
}

export const metadata: Metadata = buildPageMetadata({
    title: "Browse medical consultants",
    description: "Find and book verified medical consultants across various specializations.",
    pathname: "/consultants",
    keywords: ["find a consultant", "medical specialists", "book doctor", "HealthHere consultants"],
});

export default async function ConsultantsPage({ searchParams }: PageProps) {
    const { q, specialty } = await searchParams;

    const searchResult = await searchProfessionals(specialty === "all" ? "" : specialty);
    const professionals = searchResult.success ? searchResult.data : [];

    // Filter by name server-side if query exists
    let filtered = professionals;
    if (q) {
        const qLower = q.toLowerCase();
        filtered = professionals.filter((p) => {
            const display = (p.displayName ?? p.name ?? "").toLowerCase();
            return (
                p.name.toLowerCase().includes(qLower) ||
                display.includes(qLower) ||
                p.specialization.toLowerCase().includes(qLower)
            );
        });
    }

    return (
        <ConsultantsContent initialProfessionals={filtered} />
    );
}
