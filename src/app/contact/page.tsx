"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Mail, Phone, MapPin, Clock, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { submitContactForm } from "@/features/contact/actions";
import { contactSchema, type ContactFormValues } from "@/features/contact/schema";

export default function ContactPage() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: "",
      subject: "",
      message: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: ContactFormValues) {
    try {
      const result = await submitContactForm(data);

      if (result.error) {
        if (typeof result.error === "string") {
          toast.error(result.error);
        } else {
          // Zod validation errors from server
          toast.error("Validation failed. Please check your inputs.");
        }
        return;
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      form.reset();
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Designer Background: Subtle texture across the whole page */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />

      <main className="relative z-10 flex flex-col">
        {/* Modern Hero Section */}
        <section className="relative w-full py-24 md:py-32 overflow-hidden">
          {/* Atmospheric Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contact our team</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]"
            >
              Get in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
                Touch with Us
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium"
            >
              Have questions or concerns? We're here to help. Reach out to our team and we'll respond as soon as possible.
            </motion.p>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Contact Information - 5 cols */}
              <div className="lg:col-span-5 space-y-12">
                <div className="space-y-6">
                  <h2 className="text-3xl font-black tracking-tighter">Connection Points</h2>
                  <p className="text-muted-foreground font-medium">Choose the most convenient way to reach us. Our support team is standing by.</p>
                </div>

                <div className="grid gap-6">
                  {[
                    { icon: Mail, title: "Email Address", content: "care@healthhere.com", href: "mailto:care@healthhere.com" },
                    { icon: Phone, title: "Direct Line", content: "+91 9981322736", href: "tel:+919981322736" },
                    { icon: MapPin, title: "Headquarters", content: "Medical District, Mumbai, MH 400001" },
                    { icon: Clock, title: "Business Hours", content: "Mon - Fri: 9:00 AM - 6:00 PM" }
                  ].map((item, i) => (
                    <div key={i} className="group flex items-start gap-4 p-6 rounded-3xl bg-secondary/20 border border-primary/05 hover:border-primary/20 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-primary mb-1">{item.title}</div>
                        {item.href ? (
                          <a href={item.href} className="text-lg font-bold hover:text-primary transition-colors">{item.content}</a>
                        ) : (
                          <div className="text-lg font-bold">{item.content}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Emergency Note - High Visibility */}
                <div className="p-8 rounded-[32px] bg-red-500/5 border border-red-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-xs">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Medical Emergency?
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    For urgent medical concerns, please call emergency services at <span className="text-foreground font-black">108</span> or visit your nearest hospital immediately.
                  </p>
                </div>
              </div>

              {/* Contact Form - 7 cols */}
              <div className="lg:col-span-7">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-[40px] blur-2xl opacity-50 pointer-events-none" />
                  <div className="relative bg-background border border-border/50 rounded-[32px] p-8 md:p-12">
                    <div className="space-y-2 mb-10">
                      <h3 className="text-3xl font-black tracking-tight">Direct Message</h3>
                      <p className="text-muted-foreground font-medium">Expected response time: Under 24 hours.</p>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="your@email.com"
                                  className="h-14 rounded-2xl border-border/50 bg-secondary/10 px-6 focus:bg-background transition-all font-bold"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs font-bold text-red-500 ml-1" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Subject Matter</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="How can we help?"
                                  className="h-14 rounded-2xl border-border/50 bg-secondary/10 px-6 focus:bg-background transition-all font-bold"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs font-bold text-red-500 ml-1" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Your Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Provide as much detail as possible..."
                                  className="min-h-[200px] rounded-3xl border-border/50 bg-secondary/10 p-6 focus:bg-background transition-all resize-none font-bold"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs font-bold text-red-500 ml-1" />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all group"
                        >
                          {isSubmitting ? "Processing..." : (
                            <>
                              Send Message
                              <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
