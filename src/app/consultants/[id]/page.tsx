import { getProfessionalById } from "@/features/professional/actions";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ConsultantDetailClient from "./ConsultantDetailClient";
import { buildPageMetadata, ROBOTS_NOINDEX } from "@/lib/seo/page-metadata";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const prof = await getProfessionalById(id);

    if (!prof) {
        return buildPageMetadata({
            title: "Consultant not found",
            description: "This consultant profile could not be found on HealthHere.",
            pathname: `/consultants/${id}`,
            robots: ROBOTS_NOINDEX,
        });
    }

    const display = prof.displayName ?? prof.name;
    const city = prof.city ? ` in ${prof.city}` : "";
    const description = `Book a consultation with ${display}, a verified ${prof.specialization} professional${city}. View qualifications, fees, and availability on HealthHere.`;

    return buildPageMetadata({
        title: display,
        description,
        pathname: `/consultants/${id}`,
        keywords: [
            display,
            prof.specialization,
            "verified consultant",
            "book appointment",
            prof.city,
        ].filter(Boolean) as string[],
        ogImage:
            prof.profilePhotoUrl?.startsWith("http://") || prof.profilePhotoUrl?.startsWith("https://")
                ? prof.profilePhotoUrl
                : null,
    });
}

export default async function ConsultantDetailPage({ params }: PageProps) {
    const { id } = await params;
    const prof = await getProfessionalById(id);

    if (!prof) {
        notFound();
    }

    return (
        <ConsultantDetailClient prof={prof} />
    );
}
