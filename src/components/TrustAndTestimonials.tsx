"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  quote: string;
  fullQuote?: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
}

interface TrustPartner {
  id: string;
  name: string;
  logo: string;
}

interface TrustAndTestimonialsProps {
  testimonials?: Testimonial[];
  partners?: TrustPartner[];
  autoRotateInterval?: number;
  className?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    quote: "Protealth transformed how we deliver patient care. The platform is intuitive and our patients love it.",
    fullQuote: "Protealth transformed how we deliver patient care. The platform is intuitive and our patients love it. We've seen a 40% increase in patient satisfaction scores since implementing their solution. The seamless integration with our existing systems made the transition effortless.",
    author: "Dr. Sarah Chen",
    role: "Chief Medical Officer",
    company: "Metro Health Network",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    rating: 5
  },
  {
    id: "2",
    quote: "The specialist network is incredible. I found the right expert for my condition within minutes.",
    fullQuote: "The specialist network is incredible. I found the right expert for my condition within minutes. The quality of care I received through Protealth exceeded my expectations. The convenience of virtual consultations saved me hours of travel time.",
    author: "Michael Rodriguez",
    role: "Patient",
    company: "Verified User",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5
  },
  {
    id: "3",
    quote: "Secure, reliable, and user-friendly. Protealth has everything we need for modern healthcare delivery.",
    fullQuote: "Secure, reliable, and user-friendly. Protealth has everything we need for modern healthcare delivery. The platform's security features give us confidence in handling sensitive patient data, while the user experience keeps both staff and patients engaged.",
    author: "Jennifer Park",
    role: "IT Director",
    company: "Regional Medical Center",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    rating: 5
  }
];

const defaultPartners: TrustPartner[] = [
  {
    id: "1",
    name: "HIPAA Certified",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=60&fit=crop"
  },
  {
    id: "2",
    name: "SOC 2 Compliant",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&h=60&fit=crop"
  },
  {
    id: "3",
    name: "ISO 27001",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&h=60&fit=crop"
  },
  {
    id: "4",
    name: "HL7 FHIR",
    logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=120&h=60&fit=crop"
  }
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className={`w-4 h-4 rounded-full ${
            star <= rating ? 'bg-yellow-400' : 'bg-muted'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

const TestimonialCard = ({ testimonial, isActive }: { testimonial: Testimonial; isActive: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasFullQuote = testimonial.fullQuote && testimonial.fullQuote !== testimonial.quote;

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <Card className={`transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <Quote className="w-8 h-8 text-primary/30" aria-hidden="true" />
          
          <div className="space-y-3">
            <blockquote className="text-foreground leading-relaxed">
              "{isExpanded ? testimonial.fullQuote || testimonial.quote : testimonial.quote}"
            </blockquote>
            
            {hasFullQuote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="h-auto p-0 text-primary hover:text-primary/80 font-medium"
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <img
              src={testimonial.avatar}
              alt={`${testimonial.author} avatar`}
              className="w-12 h-12 rounded-full object-cover border-2 border-border"
            />
            <div className="flex-1">
              <div className="font-medium text-foreground">{testimonial.author}</div>
              <div className="text-sm text-muted-foreground">
                {testimonial.role} • {testimonial.company}
              </div>
            </div>
            <StarRating rating={testimonial.rating} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex flex-col gap-4">
        <div className="w-8 h-8 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
        <div className="flex items-center gap-4 pt-2">
          <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            <div className="h-3 bg-muted rounded w-32 animate-pulse" />
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-4 h-4 bg-muted rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function TrustAndTestimonials({
  testimonials = defaultTestimonials,
  partners = defaultPartners,
  autoRotateInterval = 5000,
  className = ""
}: TrustAndTestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Auto-rotation
  useEffect(() => {
    if (isPaused || isLoading || testimonials.length <= 1) return;

    const interval = setInterval(nextTestimonial, autoRotateInterval);
    return () => clearInterval(interval);
  }, [nextTestimonial, autoRotateInterval, isPaused, isLoading, testimonials.length]);

  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);
  const handleFocus = useCallback(() => setIsPaused(true), []);
  const handleBlur = useCallback(() => setIsPaused(false), []);

  if (testimonials.length === 0) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="bg-muted/30 rounded-2xl py-8">
          <div className="max-w-4xl mx-auto px-6">
            {/* Trust partners */}
            <div className="text-center mb-8">
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                {partners.map((partner) => (
                  <div key={partner.id} className="flex items-center">
                    <img
                      src={partner.logo}
                      alt={`${partner.name} certification`}
                      className="h-8 object-contain grayscale hover:grayscale-0 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Fallback trust message */}
            <Card>
              <CardContent className="p-8 text-center">
                <Quote className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Trusted by healthcare professionals and patients worldwide for secure, 
                  reliable, and compassionate care delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="bg-muted/30 rounded-2xl py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Trust partners */}
          <div className="text-center mb-12">
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {partners.map((partner) => (
                <div key={partner.id} className="flex items-center">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} certification`}
                    className="h-8 object-contain grayscale hover:grayscale-0 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials carousel */}
          <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={prevTestimonial}
                disabled={isLoading}
                aria-label="Previous testimonial"
                className="h-10 w-10 p-0"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextTestimonial}
                disabled={isLoading}
                aria-label="Next testimonial"
                className="h-10 w-10 p-0"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>

            <div 
              className="relative min-h-[280px]"
              aria-live="polite"
              aria-label="Customer testimonials"
            >
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className={`absolute inset-0 transition-all duration-500 ${
                        index === currentIndex ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <TestimonialCard
                        testimonial={testimonial}
                        isActive={index === currentIndex}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}