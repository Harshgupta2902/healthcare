"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  Stethoscope,
  AlertCircle,
  ChevronDown,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { submitContactForm } from "@/features/contact/actions";
import { cn } from "@/lib/utils";
import { contactSchema, type ContactFormValues } from "@/features/contact/schema";
import { getDeviceFingerprintHash } from "@/lib/device-fingerprint";
import { CONTACT_SUBJECT_OPTIONS } from "@/features/contact/constants";

const contactChannels = [
  {
    icon: Phone,
    label: "Phone Support",
    value: "+91 99813 22736",
    href: "tel:+919981322736",
    note: "Mon–Fri, 10:00 AM – 8:00 PM IST",
  },
  {
    icon: Mail,
    label: "General Enquiries",
    value: "care@protealth.com",
    href: "mailto:care@protealth.com",
  },
  {
    icon: Stethoscope,
    label: "Clinical Enquiries",
    value: "care@protealth.com",
    href: "mailto:care@protealth.com",
  },
] as const;

export default function ContactPage() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "General Inquiry",
      message: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: ContactFormValues) {
    try {
      const deviceHash = await getDeviceFingerprintHash();
      const result = await submitContactForm({ ...data, deviceHash });

      if (result.error) {
        if (typeof result.error === "string") {
          toast.error(result.error);
        } else {
          toast.error("Validation failed. Please check your inputs.");
        }
        return;
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      form.reset({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: "",
      });
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-white text-lp-on-surface">
      <main className="pb-16 pt-16 md:pb-20 md:pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-b from-white to-[#f9fbff]">
          <div className="mx-auto max-w-[1120px] px-4 py-12 text-center md:py-16">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight text-[#102b51] md:text-5xl"
            >
              Get in{" "}
              <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Touch with Us
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mx-auto mt-4 max-w-[640px] text-base leading-relaxed text-[#6f7f94] md:text-lg"
            >
              Whether you&apos;re a patient seeking care or a provider interested in collaboration,
              our team is here to provide clinical excellence and human-centric support.
            </motion.p>
          </div>
        </section>

        {/* Form + sidebar */}
        <section className="mx-auto mt-10 grid max-w-[1120px] grid-cols-1 gap-6 px-4 md:grid-cols-12 md:gap-6">
          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl border border-[#e1e8f2] bg-white p-6 shadow-[0_4px_20px_rgba(10,25,47,0.04)] md:col-span-7 md:p-8"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#eef5ff] text-[#2871d4]">
                <Mail className="size-5" aria-hidden />
              </div>
              <h2 className="font-heading text-xl font-semibold text-[#122e52] md:text-2xl">
                Send us a message
              </h2>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-lp-on-surface-variant">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            className="h-12 rounded-xl border-lp-outline-variant/50 bg-lp-surface-container-low px-4 focus-visible:border-lp-brand focus-visible:ring-lp-brand/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-lp-on-surface-variant">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            className="h-12 rounded-xl border-lp-outline-variant/50 bg-lp-surface-container-low px-4 focus-visible:border-lp-brand focus-visible:ring-lp-brand/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-lp-on-surface-variant">
                        Subject
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <select
                            id="contact-subject"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            className={cn(
                              "flex h-12 w-full cursor-pointer appearance-none rounded-xl border border-lp-outline-variant/50 bg-lp-surface-container-low px-4 pr-10 text-base text-lp-on-surface outline-none",
                              "focus-visible:border-lp-brand focus-visible:ring-[3px] focus-visible:ring-lp-brand/30",
                              "disabled:cursor-not-allowed disabled:opacity-50",
                            )}
                          >
                            {CONTACT_SUBJECT_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-lp-on-surface-variant"
                            aria-hidden
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-lp-on-surface-variant">
                        Message
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How can we help you today?"
                          rows={6}
                          className="min-h-[140px] resize-none rounded-xl border-lp-outline-variant/50 bg-lp-surface-container-low p-4 focus-visible:border-lp-brand focus-visible:ring-lp-brand/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl bg-lp-brand px-10 font-semibold text-white hover:bg-lp-brand-bright md:w-auto"
                  >
                    {isSubmitting ? "Sending…" : (
                      <span className="inline-flex items-center gap-2">
                        Send Secure Message
                        <Send className="size-4" aria-hidden />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>

          {/* Direct channels */}
          <div className="space-y-6 md:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="rounded-2xl border border-[#e1e8f2] bg-white p-6 shadow-[0_4px_20px_rgba(10,25,47,0.04)] md:p-8"
            >
              <h3 className="font-heading mb-6 text-xl font-semibold text-[#122e52] md:text-2xl">
                Direct Channels
              </h3>
              <div className="space-y-5">
                {contactChannels.map((channel) => (
                  <a
                    key={channel.label}
                    href={channel.href}
                    className="group flex items-start gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-[#e1e8f2] hover:bg-[#f9fbff]"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[#2871d4] transition-colors group-hover:bg-[#2871d4]">
                      <channel.icon className="size-5" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8390a0]">
                        {channel.label}
                      </p>
                      <span className="mt-0.5 block text-base font-bold text-[#1f385a]">
                        {channel.value}
                      </span>
                      {"note" in channel && channel.note ? (
                        <p className="mt-1 text-sm text-[#718198]">{channel.note}</p>
                      ) : null}
                    </div>
                  </a>
                ))}
              </div>

              {/* Emergency note */}
              <div className="mt-6 flex items-start gap-4 rounded-xl border border-red-100 bg-red-50 p-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <AlertCircle className="size-5" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                    Medical Emergency
                  </p>
                  <p className="mt-0.5 text-base font-bold text-[#1f385a]">Call 112 or 108 immediately</p>
                  <p className="mt-1 text-sm text-[#718198]">
                    Protealth is not an emergency service.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
