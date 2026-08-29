import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  CreditCard,
  FileText,
  Globe,
  Headset,
  MessageSquare,
  ShieldCheck,
  User,
} from "lucide-react";

export type SupportCategory = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
};

export type SupportFaq = {
  q: string;
  a: string;
};

export type SupportFaqTopic = {
  id: string;
  label: string;
  title: string;
  questions: SupportFaq[];
};

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    icon: User,
    title: "Account & Privacy",
    description: "Manage your login details, profile security, and data preferences.",
    href: "#account",
  },
  {
    icon: Calendar,
    title: "Booking Flow",
    description: "Help with scheduling, rescheduling, and preparing for your visits.",
    href: "#appointments",
  },
  {
    icon: CreditCard,
    title: "Payments & Refunds",
    description: "Understand your statements, insurance coverage, and billing.",
    href: "#payments",
  },
  {
    icon: FileText,
    title: "Medical Records",
    description: "Access lab results, clinical summaries, and sharing options.",
    href: "#medical-services",
  },
];

export const SUPPORT_FAQ_TOPICS: SupportFaqTopic[] = [
  {
    id: "appointments",
    label: "Appointments",
    title: "Appointments",
    questions: [
      {
        q: "How do I book a free consultation?",
        a: "Click Book a free consultation on the homepage or go to Book Consultation. Choose your concern, location, and preferred time—we will match you with a suitable specialist.",
      },
      {
        q: "How do I cancel my appointment?",
        a: "You can cancel up to 24 hours before your scheduled time through the dashboard or by contacting support. We recommend rescheduling early so another patient can use the slot.",
      },
      {
        q: "How can I cancel or reschedule my appointment?",
        a: "Manage bookings from your Dashboard under consultation requests or upcoming appointments. We request at least 2 hours notice for cancellations when possible.",
      },
      {
        q: "Can I book for a family member?",
        a: "Yes. Add dependents in Profile Settings under your dashboard, or book as a guest using their details on the consultation form.",
      },
      {
        q: "Are consultations video-based?",
        a: "Yes. Consultations use our secure video platform. You will receive a meeting link in your dashboard and by email once your appointment is confirmed.",
      },
    ],
  },
  {
    id: "account",
    label: "Account Management",
    title: "Account Management",
    questions: [
      {
        q: "I forgot my password. How can I reset it?",
        a: 'Use "Forgot password" on the login page to receive a secure reset link by email. For your security, the link expires after a limited time.',
      },
      {
        q: "Is my medical data secure?",
        a: "We use industry-standard encryption for records and consultations. Your data is handled in line with applicable healthcare data protection requirements.",
      },
      {
        q: "How do I update my profile information?",
        a: "Open your Dashboard and go to Profile Settings to update contact details, insurance, and medical history.",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments & Billing",
    title: "Payments & Refunds",
    questions: [
      {
        q: "How does billing work for consultations?",
        a: "Fees are shown when you book with a consultant. Any payment or insurance steps will be explained during booking or in your confirmation email.",
      },
      {
        q: "Can I get a refund?",
        a: "Refund eligibility depends on cancellation timing and the consultant policy. Contact support with your booking reference for help.",
      },
    ],
  },
  {
    id: "medical-services",
    label: "Medical Services",
    title: "Medical Services",
    questions: [
      {
        q: "How do I access my lab results?",
        a: "Results are typically available within a few business days under Medical Documents or My Records in your dashboard. You will be notified when they are uploaded.",
      },
      {
        q: "What specialties are available?",
        a: "We cover General Medicine, Mental Health, Pediatrics, Women's Health, Dermatology, Cardiology, and more—browse Consultants to see who is available.",
      },
      {
        q: "Do you provide emergency services?",
        a: "No. Protealth is for outpatient consultations only. In an emergency, call 112 or 108 immediately or go to the nearest emergency department.",
      },
    ],
  },
];

export const SUPPORT_CTA_FEATURES = [
  {
    icon: Headset,
    title: "24/7 Support",
    description: "Always here when you need us.",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Use the assistant or contact form.",
  },
  {
    icon: ShieldCheck,
    title: "Clinical Grade",
    description: "Secure, privacy-focused care.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Support wherever you are.",
  },
] as const;
