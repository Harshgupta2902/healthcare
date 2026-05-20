"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CalendarDays,
  FileText,
  Loader2,
  MessageCircle,
  Navigation,
  ShieldAlert,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAssistantContext } from "@/features/assistant/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type AssistantAppointment = {
  id: string;
  kind: "client_request" | "professional_guest" | "professional_consultation";
  title: string;
  status?: string | null;
  category?: string | null;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
  createdAt?: string | null;
  location?: string | null;
  personName?: string | null;
  professionalName?: string | null;
  hasPrescription: boolean;
  prescriptionUpdatedAt?: string | null;
  prescriptionHighlights: string[];
};

type AssistantContext = {
  success: true;
  isAuthenticated: boolean;
  role: "guest" | "client" | "professional" | "admin";
  userId: string | null;
  displayName: string | null;
  appointments: AssistantAppointment[];
};

type Question = {
  id: string;
  label: string;
  group: "Public" | "Account" | "Appointments" | "Prescription" | "Professional";
  guest?: boolean;
  roles?: Array<"client" | "professional" | "admin">;
  answer: (ctx: AssistantContext | null) => string;
};

const PUBLIC_QUESTIONS: Question[] = [
  {
    id: "services",
    label: "What services does HealthHere offer?",
    group: "Public",
    guest: true,
    answer: () =>
      "HealthHere helps you discover consultants, book consultation requests, manage appointments and profile details from your dashboard, and view prescriptions or documents when available. This platform is not for emergency care.",
  },
  {
    id: "find-consultants",
    label: "How do I find consultants?",
    group: "Public",
    guest: true,
    answer: () =>
      "Open the Consultants page from the top navigation. You can use specialty, city, experience, and price filters to choose a suitable professional.",
  },
  {
    id: "book-flow",
    label: "How do I book a consultation?",
    group: "Public",
    guest: true,
    answer: () =>
      "Select a professional from the Consultants page, click Book Appointment, fill in your details, and submit the request. Logged-in users can track request status and prescription updates from the dashboard.",
  },
  {
    id: "dashboard",
    label: "What can I do in the dashboard?",
    group: "Public",
    guest: true,
    answer: () =>
      "In the dashboard, patients can manage profile details, medical history, medications, documents, insurance, and consultation requests. Professional users can manage credentials, requests, calendar, clients, and payments.",
  },
  {
    id: "profile-edit",
    label: "How do I edit my profile?",
    group: "Account",
    guest: true,
    answer: (ctx) =>
      ctx?.isAuthenticated
        ? "Open the dashboard, select the Profile section, click Edit Profile, update your details, and save changes."
        : "After logging in, open the Dashboard and use the Profile section to edit your details.",
  },
  {
    id: "medical-advice",
    label: "Can this assistant provide medical advice?",
    group: "Public",
    guest: true,
    answer: () =>
      "No. This assistant only provides platform navigation and account or appointment guidance. For diagnosis, treatment, dosage changes, or emergency advice, contact a qualified doctor or emergency service.",
  },
  {
    id: "data-security",
    label: "Is my data secure?",
    group: "Public",
    guest: true,
    answer: () =>
      "Account and healthcare data are protected through Supabase authentication and database rules. Sensitive information is only shown when the logged-in user is allowed to access that dashboard context.",
  },
];

const AUTH_QUESTIONS: Question[] = [
  {
    id: "last-appointment",
    label: "When was my last appointment?",
    group: "Appointments",
    roles: ["client", "professional"],
    answer: (ctx) => {
      const appointment = ctx?.appointments?.[0];
      if (!appointment) return "I could not find any appointment or request in your account yet.";

      return [
        `Last appointment/request: ${appointment.title}`,
        `Date: ${formatAppointmentDate(appointment.appointmentDate, appointment.appointmentTime)}`,
        appointment.category ? `Category: ${appointment.category}` : null,
        appointment.location ? `Location: ${appointment.location}` : null,
        appointment.personName ? `Person: ${appointment.personName}` : null,
        appointment.professionalName ? `Professional: ${appointment.professionalName}` : null,
        appointment.status ? `Status: ${appointment.status}` : null,
        appointment.hasPrescription ? "Prescription: Available" : "Prescription: Not added yet",
      ]
        .filter(Boolean)
        .join("\n");
    },
  },
  {
    id: "appointment-details",
    label: "Show my last appointment details",
    group: "Appointments",
    roles: ["client", "professional"],
    answer: (ctx) => {
      const appointment = ctx?.appointments?.[0];
      if (!appointment) return "Appointment details are not available yet.";

      return [
        `Details for ${appointment.title}:`,
        `When: ${formatAppointmentDate(appointment.appointmentDate, appointment.appointmentTime)}`,
        appointment.category ? `Concern/category: ${appointment.category}` : null,
        appointment.location ? `City/state: ${appointment.location}` : null,
        appointment.status ? `Status: ${appointment.status}` : null,
        appointment.hasPrescription
          ? `Prescription updated: ${formatAppointmentDate(appointment.prescriptionUpdatedAt || null, null)}`
          : "Prescription is not available yet.",
      ]
        .filter(Boolean)
        .join("\n");
    },
  },
  {
    id: "prescription-summary",
    label: "Show points from my latest prescription",
    group: "Prescription",
    roles: ["client", "professional"],
    answer: (ctx) => {
      const appointment = ctx?.appointments?.find((item) => item.hasPrescription);
      if (!appointment) return "I could not find a prescription in your recent appointments.";

      if (appointment.prescriptionHighlights.length === 0) {
        return "A prescription is available, but readable text could not be extracted. Use the View PDF or Edit Prescription option from the appointment card in your dashboard.";
      }

      return [
        `Prescription points from ${appointment.title}:`,
        ...appointment.prescriptionHighlights.map((point) => `- ${point}`),
        "",
        "Note: This is only a text summary from the prescription, not medical interpretation. Please confirm any questions with the doctor.",
      ].join("\n");
    },
  },
  {
    id: "all-appointments",
    label: "Show my recent appointments",
    group: "Appointments",
    roles: ["client", "professional"],
    answer: (ctx) => {
      const appointments = ctx?.appointments || [];
      if (appointments.length === 0) return "Your recent appointments or requests list is currently empty.";

      return appointments
        .slice(0, 5)
        .map((appointment, index) => {
          const prescription = appointment.hasPrescription ? "prescription available" : "no prescription";
          return `${index + 1}. ${appointment.title} - ${formatAppointmentDate(appointment.appointmentDate, appointment.appointmentTime)} (${prescription})`;
        })
        .join("\n");
    },
  },
  {
    id: "client-profile-help",
    label: "Where can I update my health profile?",
    group: "Account",
    roles: ["client"],
    answer: () =>
      "Open the Profile section in your dashboard. Use Edit Profile to update blood type, gender, height, weight, address, phone, and emergency contact details.",
  },
  {
    id: "professional-credentials-help",
    label: "How do I add credentials?",
    group: "Professional",
    roles: ["professional"],
    answer: () =>
      "Open the Credentials section in the Professional Dashboard, click Add Credential, enter the degree, institution, and year, upload the verification file, then submit with Verify & Add Credential.",
  },
  {
    id: "professional-prescription-help",
    label: "How do I create a patient prescription?",
    group: "Professional",
    roles: ["professional"],
    answer: () =>
      "In the Professional Dashboard, open the Requests or Consultations section. On a guest booking card, click Prescribe to open the editor where you can save diagnosis, medicines, and instructions.",
  },
];

const ALL_QUESTIONS = [...PUBLIC_QUESTIONS, ...AUTH_QUESTIONS];

const ASSISTANT_LINK_CLASS =
  "font-semibold text-lp-brand underline decoration-lp-brand/40 underline-offset-2 hover:text-lp-brand-bright";

const GUEST_CONTEXT: AssistantContext = {
  success: true,
  isAuthenticated: false,
  role: "guest",
  userId: null,
  displayName: null,
  appointments: [],
};

function buildInitialMessages(ctx: AssistantContext | null, loading = false): AssistantMessage[] {
  return [
    {
      id: `hello-${ctx?.role || "guest"}-${ctx?.isAuthenticated ? "auth" : "public"}`,
      role: "assistant",
      text: getInitialAssistantText(ctx, loading),
    },
  ];
}

function getHistoryStorageKey(ctx: AssistantContext | null) {
  if (ctx?.isAuthenticated && ctx.userId) return `healthhere-assistant-history:${ctx.userId}`;
  return "healthhere-assistant-history:guest";
}

function readStoredMessages(ctx: AssistantContext | null) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getHistoryStorageKey(ctx));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const messages = parsed.filter((item): item is AssistantMessage => {
      return (
        item &&
        typeof item.id === "string" &&
        (item.role === "assistant" || item.role === "user") &&
        typeof item.text === "string"
      );
    });

    return messages.length > 0 ? messages.slice(-40) : null;
  } catch {
    return null;
  }
}

function writeStoredMessages(ctx: AssistantContext | null, messages: AssistantMessage[]) {
  if (typeof window === "undefined") return;
  if (!ctx) return;

  try {
    window.localStorage.setItem(getHistoryStorageKey(ctx), JSON.stringify(messages.slice(-40)));
  } catch {
    // Local storage can be unavailable in private browsing or strict settings.
  }
}

function clearStoredMessages(ctx: AssistantContext | null) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(getHistoryStorageKey(ctx));
  } catch {
    // Local storage can be unavailable in private browsing or strict settings.
  }
}

function restoreMessagesForContext(ctx: AssistantContext) {
  return readStoredMessages(ctx) ?? buildInitialMessages(ctx);
}

function formatAppointmentDate(dateValue?: string | null, timeValue?: string | null) {
  if (!dateValue) return "Not available";
  const dateText = timeValue ? `${dateValue}T${String(timeValue).slice(0, 5)}:00` : dateValue;
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return [dateValue, timeValue].filter(Boolean).join(" ");

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: timeValue || dateValue.includes("T") ? "numeric" : undefined,
    minute: timeValue || dateValue.includes("T") ? "2-digit" : undefined,
  });
}

function getVisibleQuestions(ctx: AssistantContext | null) {
  return ALL_QUESTIONS.filter((question) => {
    if (ctx?.isAuthenticated && question.group === "Public") return false;
    if (question.guest) return true;
    if (!ctx?.isAuthenticated) return false;
    if (!question.roles) return true;
    return question.roles.includes(ctx.role as "client" | "professional" | "admin");
  });
}

function getInitialAssistantText(ctx: AssistantContext | null, loading: boolean) {
  if (loading) return "Hi, I am HealthHere Assistant. I am checking your login status...";
  if (ctx?.isAuthenticated) {
    return `Hi ${ctx.displayName || "there"}, I am HealthHere Assistant. I can help with dashboard navigation, booking, profile updates, and appointment or prescription details.`;
  }
  return "Hi, I am HealthHere Assistant. I can help with services, consultants, the booking flow, the dashboard, and public FAQs. After login, account-specific questions will also appear.";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderAssistantTextWithLinks(text: string, ctx: AssistantContext | null) {
  const dashboardHref = ctx?.isAuthenticated ? "/dashboard" : "/login?redirect=/dashboard";
  const links = [
    { phrase: "manage appointments and profile details", href: dashboardHref },
    { phrase: "appointment or prescription details", href: dashboardHref },
    { phrase: "profile updates", href: dashboardHref },
    { phrase: "the Professional Dashboard", href: dashboardHref },
    { phrase: "Professional Dashboard", href: dashboardHref },
    { phrase: "the Dashboard", href: dashboardHref },
    { phrase: "your dashboard", href: dashboardHref },
    { phrase: "the dashboard", href: dashboardHref },
    { phrase: "dashboard", href: dashboardHref },
    { phrase: "book consultation requests", href: "/book-consultation" },
    { phrase: "Book Appointment", href: "/book-consultation" },
    { phrase: "the booking flow", href: "/book-consultation" },
    { phrase: "booking", href: "/book-consultation" },
    { phrase: "Consultants page", href: "/consultants" },
    { phrase: "consultants", href: "/consultants" },
  ].sort((a, b) => b.phrase.length - a.phrase.length);

  const pattern = new RegExp(`(${links.map((item) => escapeRegExp(item.phrase)).join("|")})`, "gi");

  return text.split("\n").map((line, lineIndex) => {
    const parts = line.split(pattern).filter((part) => part.length > 0);

    return (
      <span key={`line-${lineIndex}`}>
        {parts.map((part, partIndex) => {
          const link = links.find((item) => item.phrase.toLowerCase() === part.toLowerCase());
          if (!link) return <span key={`${lineIndex}-${partIndex}`}>{part}</span>;

          return (
            <Link key={`${lineIndex}-${partIndex}`} href={link.href} className={ASSISTANT_LINK_CLASS}>
              {part}
            </Link>
          );
        })}
        {lineIndex < text.split("\n").length - 1 ? <br /> : null}
      </span>
    );
  });
}

export function HealthHereAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);
  const [ctx, setCtx] = useState<AssistantContext | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [contextRefreshKey, setContextRefreshKey] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const typingTimersRef = useRef<number[]>([]);
  const previousPathnameRef = useRef<string | null>(null);

  const clearTypingTimers = () => {
    typingTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    typingTimersRef.current = [];
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingContext(true);
      const result = await getAssistantContext({});
      if (cancelled) return;
      if (result.success) {
        setCtx(result);
        setMessages(restoreMessagesForContext(result));
      } else {
        setCtx(GUEST_CONTEXT);
        setMessages(
          readStoredMessages(GUEST_CONTEXT) ?? [
            {
              id: "hello-context-error",
              role: "assistant",
              text: "HealthHere Assistant is ready, but account context could not be loaded. You can still use the public help questions.",
            },
          ]
        );
      }
      setLoadingContext(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, contextRefreshKey]);

  useEffect(() => {
    if (previousPathnameRef.current && previousPathnameRef.current !== pathname) {
      setOpen(false);
    }

    previousPathnameRef.current = pathname ?? null;
  }, [pathname]);

  useEffect(() => {
    if (messages.length === 0) return;
    writeStoredMessages(ctx, messages);
  }, [ctx, messages]);

  useEffect(() => {
    if (!open) return;
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping, open]);

  useEffect(() => {
    return () => {
      clearTypingTimers();
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        clearTypingTimers();
        setIsTyping(false);
        setCtx(GUEST_CONTEXT);
        setMessages(restoreMessagesForContext(GUEST_CONTEXT));
        window.setTimeout(() => setContextRefreshKey((key) => key + 1), 300);
        return;
      }

      setContextRefreshKey((key) => key + 1);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const visibleQuestions = useMemo(() => getVisibleQuestions(ctx), [ctx]);
  const primaryQuestions = useMemo(() => {
    if (!ctx?.isAuthenticated) return visibleQuestions.slice(0, 5);
    return visibleQuestions
      .filter((question) => question.group === "Appointments" || question.group === "Prescription" || question.group === "Professional")
      .concat(visibleQuestions.filter((question) => question.group === "Account" || question.group === "Public"))
      .slice(0, 8);
  }, [ctx, visibleQuestions]);

  if (pathname?.startsWith("/application/enter")) return null;

  const addAssistantResponseWithTyping = (answer: string) => {
    clearTypingTimers();
    setIsTyping(true);

    const answerId = `a-${Date.now()}`;
    const tokens = answer.match(/\S+|\s+/g) || [answer];

    typingTimersRef.current.push(
      window.setTimeout(() => {
        setMessages((current) => [...current, { id: answerId, role: "assistant", text: "" }]);

        tokens.forEach((token, index) => {
          const timer = window.setTimeout(() => {
            setMessages((current) =>
              current.map((message) =>
                message.id === answerId ? { ...message, text: `${message.text}${token}` } : message
              )
            );

            if (index === tokens.length - 1) {
              setIsTyping(false);
              typingTimersRef.current = [];
            }
          }, index * 42);

          typingTimersRef.current.push(timer);
        });
      }, 450)
    );
  };

  const askQuestion = (question: Question) => {
    if (isTyping) return;
    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: "user", text: question.label },
    ]);
    addAssistantResponseWithTyping(question.answer(ctx));
  };

  const clearChat = () => {
    if (isTyping) return;
    clearTypingTimers();
    setIsTyping(false);
    clearStoredMessages(ctx);
    setMessages(buildInitialMessages(ctx ?? GUEST_CONTEXT));
  };

  return (
    <>
      {open && (
        <section className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+9.25rem)] z-[60] mx-auto flex max-h-[65vh] max-w-md flex-col overflow-hidden rounded-2xl border border-lp-outline-variant/25 bg-lp-surface-container-lowest/95 shadow-2xl shadow-lp-brand/10 backdrop-blur-md sm:bottom-24 sm:left-auto sm:right-6 sm:max-h-[min(720px,calc(100vh-7rem))] sm:w-[400px]">
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-lp-brand to-lp-brand-bright px-4 py-3 text-lp-on-brand">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-white text-sm font-bold">HealthHere Assistant</p>
                <p className="text-[11px] text-lp-on-brand/80">
                  {ctx?.isAuthenticated ? `${ctx.role} help enabled` : "Public help"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-lp-on-brand hover:bg-white/15 hover:text-lp-on-brand"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-lp-surface-container-low/60 p-3">
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 p-3 text-[11px] font-medium leading-relaxed text-amber-900">
              <ShieldAlert className="mr-1 inline h-3.5 w-3.5 text-amber-700" />
              This assistant does not provide diagnosis, emergency help, dosage changes, or treatment advice.
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[88%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  message.role === "assistant"
                    ? "border border-lp-outline-variant/20 bg-lp-surface-container-lowest text-lp-on-surface shadow-sm"
                    : "ml-auto bg-gradient-to-r from-lp-brand to-lp-brand-bright font-medium text-lp-on-brand shadow-md",
                )}
              >
                {message.role === "assistant" ? renderAssistantTextWithLinks(message.text, ctx) : message.text}
              </div>
            ))}

            {isTyping && (
              <div className="flex max-w-[88%] items-center gap-1.5 px-3 py-3 text-lp-on-surface-variant">
                <span className="h-2 w-2 animate-bounce rounded-full bg-lp-brand/50 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-lp-brand/50 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-lp-brand/50" />
              </div>
            )}

            <div ref={scrollAnchorRef} />
          </div>

          <div className="border-t border-lp-outline-variant/20 bg-lp-surface-container-lowest/95 p-2.5 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-lp-on-surface-variant">
                <Sparkles className="h-3 w-3 text-lp-brand" />
                Quick questions
                {loadingContext && <Loader2 className="h-3 w-3 animate-spin text-lp-brand" />}
              </div>
              <button
                type="button"
                onClick={clearChat}
                disabled={isTyping}
                className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-lp-on-surface-variant transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear chat
              </button>
            </div>
            <div className="space-y-1.5">
              {primaryQuestions.map((question) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => askQuestion(question)}
                  disabled={isTyping}
                  className="flex w-full items-center gap-2 rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-low px-2.5 py-2 text-left text-[11px] font-semibold text-lp-on-surface transition hover:border-lp-brand/40 hover:bg-lp-surface-container hover:text-lp-brand disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="shrink-0 text-lp-brand">
                    {question.group === "Appointments" ? <CalendarDays className="h-3 w-3" /> : null}
                    {question.group === "Prescription" ? <FileText className="h-3 w-3" /> : null}
                    {question.group === "Public" ? <Navigation className="h-3 w-3" /> : null}
                    {question.group === "Account" || question.group === "Professional" ? <UserRound className="h-3 w-3" /> : null}
                  </span>
                  <span>{question.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <Button
        type="button"
        className={cn(
          "fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-4 z-[60] h-12 w-12 rounded-2xl border border-white/20 p-0 shadow-2xl shadow-lp-brand/25 transition-all hover:scale-[1.03] sm:bottom-6 sm:right-6 sm:h-14 sm:w-14",
          open
            ? "bg-lp-surface-container-high text-lp-on-surface hover:bg-lp-surface-container"
            : "bg-gradient-to-r from-lp-brand to-lp-brand-bright text-lp-on-brand hover:shadow-lp-brand/35",
        )}
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close HealthHere Assistant" : "Open HealthHere Assistant"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>
    </>
  );
}
