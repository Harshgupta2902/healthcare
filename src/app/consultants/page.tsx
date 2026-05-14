import type { Metadata } from "next";
import { searchProfessionals } from "@/features/professional/actions";
import ConsultantsContent from "./ConsultantsContent";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

interface PageProps {
    searchParams: Promise<{ q?: string; specialty?: string }>;
}

export const metadata: Metadata = buildPageMetadata({
    title: "Consultants directory",
    description:
        "Search and filter verified medical consultants by specialty, location, experience, and consultation fee—then book through HealthHere.",
    pathname: "/consultants",
    keywords: ["verified medical consultants", "find a consultant", "book doctor", "HealthHere directory"],
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
