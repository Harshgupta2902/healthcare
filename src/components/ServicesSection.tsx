"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, IdCard, Grid3x3, CardSim, CalendarRange, CircleX } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  bookable: boolean;
}

interface ServiceCardProps {
  service: Service;
  onBook?: () => void;
}

interface BookingFormData {
  name: string;
  email: string;
  service: string;
  date: string;
  time: string;
  message: string;
}

interface BookingFormErrors {
  name?: string;
  email?: string;
  service?: string;
  date?: string;
  general?: string;
}

const services: Service[] = [
  {
    id: "consultations",
    title: "Video Consultations",
    description: "Connect with healthcare professionals from the comfort of your home",
    icon: <Calendar className="h-6 w-6" />,
    benefits: [
      "24/7 availability with on-demand scheduling",
      "Secure, HIPAA-compliant video calls",
      "Instant access to prescriptions and care plans",
      "Follow-up reminders and care continuity"
    ],
    bookable: true
  },
  {
    id: "specialists",
    title: "Specialist Network",
    description: "Access to board-certified specialists across multiple medical fields",
    icon: <IdCard className="h-6 w-6" />,
    benefits: [
      "Cardiology, dermatology, mental health, and more",
      "Reduced wait times compared to traditional appointments",
      "Seamless referrals and care coordination",
      "Expert second opinions when you need them"
    ],
    bookable: true
  },
  {
    id: "records",
    title: "Secure Health Records",
    description: "Your complete medical history, accessible anywhere, anytime",
    icon: <CardSim className="h-6 w-6" />,
    benefits: [
      "Centralized storage of all medical documents",
      "Easy sharing with healthcare providers",
      "Automatic integration with lab results",
      "Privacy-first approach with bank-level security"
    ],
    bookable: false
  },
  {
    id: "plans",
    title: "Personalized Care Plans",
    description: "Tailored treatment plans designed specifically for your health goals",
    icon: <Grid3x3 className="h-6 w-6" />,
    benefits: [
      "AI-powered health recommendations",
      "Custom medication reminders and tracking",
      "Lifestyle and wellness goal setting",
      "Progress monitoring with regular check-ins"
    ],
    bookable: true
  }
];

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
];

function ServiceCard({ service, onBook }: ServiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="h-full bg-secondary/50 border-border/50 hover:bg-secondary/70 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-accent/50 text-accent-foreground">
            {service.icon}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {service.title}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="text-muted-foreground leading-relaxed">
          {service.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  {isExpanded ? "Show Less" : "Learn More"}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-foreground">Key Benefits:</h4>
                  <ul className="space-y-1">
                    {service.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {service.bookable && (
              <Button onClick={onBook} size="sm" className="flex-1">
                Book Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingModal({ isOpen, onClose, selectedService }: {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: Service;
}) {
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    service: selectedService?.id || "",
    date: "",
    time: "",
    message: ""
  });
  
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: BookingFormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.service) {
      newErrors.service = "Please select a service";
    }
    
    if (!formData.date) {
      newErrors.date = "Please select a date";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = "Please select a future date";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate random failure for demo
      if (Math.random() < 0.1) {
        throw new Error("Something went wrong. Please try again.");
      }
      
      setIsSuccess(true);
      toast.success("Appointment booked successfully! You'll receive a confirmation email shortly.");
      
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          name: "",
          email: "",
          service: selectedService?.id || "",
          date: "",
          time: "",
          message: ""
        });
      }, 2000);
      
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Something went wrong. Please try again."
      });
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof BookingFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <DialogContent className="sm:max-w-md">
        <div className="text-center py-6">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-xl mb-2">Booking Confirmed!</DialogTitle>
          <DialogDescription>
            Your appointment has been scheduled successfully. You'll receive a confirmation email with all the details.
          </DialogDescription>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Book an Appointment</DialogTitle>
        <DialogDescription>
          Fill out the form below to schedule your appointment with our healthcare professionals.
        </DialogDescription>
      </DialogHeader>
      
      {errors.general && (
        <Alert variant="destructive">
          <CircleX className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="service">Service *</Label>
          <Select value={formData.service} onValueChange={(value) => handleInputChange("service", value)}>
            <SelectTrigger className={errors.service ? "border-destructive" : ""}>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.filter(s => s.bookable).map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.service && (
            <p className="text-sm text-destructive">{errors.service}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Preferred Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={errors.date ? "border-destructive" : ""}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Preferred Time</Label>
            <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message">Additional Notes</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            placeholder="Any specific concerns or requests..."
            rows={3}
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Booking..." : "Book Appointment"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

function ServicesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="h-full bg-secondary/50 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
              <div className="w-32 h-5 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-muted animate-pulse rounded" />
              <div className="w-3/4 h-4 bg-muted animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ServicesSection() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="text-center mb-12">
          <div className="w-64 h-8 bg-muted animate-pulse rounded mx-auto mb-4" />
          <div className="w-96 h-5 bg-muted animate-pulse rounded mx-auto" />
        </div>
        <ServicesSkeleton />
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 text-foreground">
          Comprehensive Healthcare Services
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          From video consultations to personalized care plans, we provide everything you need for better health outcomes.
        </p>
      </div>

      {services.length === 0 ? (
        <Card className="text-center py-12 bg-secondary/30">
          <CardContent>
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <CalendarRange className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Services Available</h3>
            <p className="text-muted-foreground">
              Our services are currently being updated. Please check back soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={() => handleBookService(service)}
            />
          ))}
        </div>
      )}

      <div className="text-center">
        <Button variant="outline" size="lg" className="mb-6">
          See All Specialists
        </Button>
        
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Quick FAQ</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="text-left">
              <h4 className="font-medium text-foreground mb-1">How quickly can I get an appointment?</h4>
              <p className="text-muted-foreground">Most appointments can be scheduled within 24-48 hours, with urgent consultations available same-day.</p>
            </div>
            <div className="text-left">
              <h4 className="font-medium text-foreground mb-1">Are consultations covered by insurance?</h4>
              <p className="text-muted-foreground">Yes, we accept most major insurance plans. Check with your provider for specific coverage details.</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          selectedService={selectedService}
        />
      </Dialog>
    </section>
  );
}