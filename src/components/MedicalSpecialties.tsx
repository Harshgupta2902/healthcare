"use client";

import { ChevronRight } from "lucide-react";

interface MedicalSpecialty {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const specialties: MedicalSpecialty[] = [
{
  id: "general-physician",
  name: "General Physician",
  description: "Comprehensive primary care for all your health needs. From routine check-ups to managing chronic conditions.",
  imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/general-physician-doctor-icon%2c-profess-87c3f74e-20250904181234.jpg"
},
{
  id: "psychologist",
  name: "Psychologist",
  description: "Mental health support and counseling services. Professional therapy for emotional wellbeing and life challenges.",
  imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/psychology-and-mental-health-icon%2c-bra-5860e310-20250904181243.jpg"
},
{
  id: "gynecologist",
  name: "Gynecologist",
  description: "Specialized women's health care services. Expert care for reproductive health and wellness throughout life.",
  imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/gynecology-women%27s-health-icon%2c-fema-dc316332-20250904181252.jpg"
},
{
  id: "pediatrician",
  name: "Pediatrician",
  description: "Dedicated healthcare for infants, children, and adolescents. Comprehensive care for your child's growth and development.",
  imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/pediatric-healthcare-icon%2c-child-medic-284bb268-20250904181301.jpg"
},
{
  id: "ophthalmologist",
  name: "Ophthalmologist",
  description: "Complete eye care and vision health services. From routine eye exams to advanced surgical treatments.",
  imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/ophthalmology-eye-care-icon%2c-stylized--0fb2aef4-20250904181315.jpg"
},
{
  id: "psychiatrist",
  name: "Psychiatrist",
  description: "Medical treatment for mental health conditions. Comprehensive psychiatric care with medication management.",
  imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/psychiatry-mental-health-icon%2c-brain-w-0820a790-20250904181324.jpg"
}];


export const MedicalSpecialties = () => {
  return (
    <section className="px-6 !text-center !opacity-100 !block !items-start !m-0 md:!px-[35px] !py-16 !border-0 !w-[1169px] !h-[564px]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Medical Specialties
          </h2>
          <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium group">
            View more
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {specialties.map((specialty) =>
          <div
            key={specialty.id}
            className="group cursor-pointer bg-card rounded-xl shadow-sm border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-4 flex flex-col items-center text-center w-full">

              {/* Specialty Image */}
              <div className="w-16 h-16 rounded-full overflow-hidden group-hover:scale-105 transition-transform duration-300 flex-shrink-0 mb-4">
                <img
                src={specialty.imageUrl}
                alt={`${specialty.name} specialist icon`}
                className="w-full h-full object-cover" />

              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Specialty name */}
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors leading-tight">
                  {specialty.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {specialty.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

};