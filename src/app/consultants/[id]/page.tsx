import { getProfessionalById } from "@/features/professional/actions";
import { notFound } from "next/navigation";
import ConsultantDetailClient from "./ConsultantDetailClient";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const prof = await getProfessionalById(id);

    if (!prof) return { title: "Consultant Not Found" };

    return {
        title: `Dr. ${prof.name} | ${prof.specialization} | HealthHere`,
        description: `Book an appointment with Dr. ${prof.name}, a leading ${prof.specialization} in ${prof.city || 'your area'}. View qualifications, availability, and more.`,
    };
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
