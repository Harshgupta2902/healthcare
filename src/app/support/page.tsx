"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_CTA_FEATURES,
  SUPPORT_FAQ_TOPICS,
} from "@/app/support/constants";

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState(SUPPORT_FAQ_TOPICS[0]?.id ?? "appointments");

  const query = normalizeSearch(search);

  const filteredTopics = useMemo(() => {
    if (!query) return SUPPORT_FAQ_TOPICS;

    return SUPPORT_FAQ_TOPICS.map((topic) => ({
      ...topic,
      questions: topic.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query),
      ),
    })).filter((topic) => topic.questions.length > 0);
  }, [query]);

  return (
    <div className="min-h-screen bg-background text-lp-on-surface">
      <main className="pb-0 pt-24 md:pt-28">
        {/* Hero */}
        <section className="mx-auto mb-16 max-w-4xl px-5 text-center md:mb-24 md:px-8 lg:px-12">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
          >
            How can we help you today?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-lp-on-surface-variant md:text-xl"
          >
            Search our knowledge base for answers regarding appointments, clinical records, and
            billing services.
          </motion.p>
        </section>

        {/* Category grid */}
        <section className="mx-auto mb-16 max-w-6xl px-5 md:mb-24 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORT_CATEGORIES.map((cat, index) => (
              <motion.a
                key={cat.title}
                href={cat.href}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="group border border-lp-outline-variant/50 bg-white p-8 transition-all duration-300 hover:border-lp-brand"
              >
                <div className="mb-6 flex size-12 items-center justify-center bg-lp-surface-container-low text-lp-on-surface transition-colors group-hover:bg-lp-brand group-hover:text-white">
                  <cat.icon className="size-6" aria-hidden />
                </div>
                <h3 className="font-heading mb-2 text-xl font-bold">{cat.title}</h3>
                <p className="text-sm leading-relaxed text-lp-on-surface-variant">
                  {cat.description}
                </p>
              </motion.a>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto mb-16 max-w-6xl px-5 md:mb-24 md:px-8 lg:px-12">
          <h2 className="font-heading mb-12 text-center text-3xl font-bold text-lp-on-surface md:mb-16 md:text-4xl">
            Frequently Asked Questions
          </h2>

          {filteredTopics.length === 0 ? (
            <p className="text-center text-lp-on-surface-variant">
              No articles match your search. Try different keywords or{" "}
              <Link href="/contact" className="font-semibold text-lp-brand hover:underline">
                contact support
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Sidebar */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-24">
                  <p className="mb-6 text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant">
                    Topics
                  </p>
                  <nav className="flex flex-col gap-1 sm:flex-row sm:flex-wrap lg:flex-col">
                    {SUPPORT_FAQ_TOPICS.map((topic) => {
                      const isActive = activeTopic === topic.id;
                      const visible = filteredTopics.some((t) => t.id === topic.id);
                      if (!visible && query) return null;

                      return (
                        <a
                          key={topic.id}
                          href={`#${topic.id}`}
                          onClick={() => setActiveTopic(topic.id)}
                          className={cn(
                            "py-2 text-base font-medium transition-colors",
                            isActive
                              ? "border-b-2 border-lp-on-surface font-semibold text-lp-on-surface"
                              : "text-lp-on-surface-variant hover:text-lp-brand",
                          )}
                        >
                          {topic.label}
                        </a>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* FAQ list */}
              <div className="space-y-12 lg:col-span-8">
                {filteredTopics.map((topic) => (
                  <div key={topic.id} id={topic.id} className="scroll-mt-28">
                    <h3 className="font-heading mb-6 border-b border-lp-outline-variant/30 pb-4 text-2xl font-semibold text-lp-on-surface">
                      {topic.title}
                    </h3>
                    <div className="space-y-4">
                      {topic.questions.map((faq) => (
                        <details
                          key={faq.q}
                          className="group rounded-lg bg-lp-surface-container-low/50"
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 [&::-webkit-details-marker]:hidden">
                            <span className="font-heading text-left text-lg font-semibold text-lp-on-surface">
                              {faq.q}
                            </span>
                            <Plus
                              className="size-5 shrink-0 text-lp-brand transition-transform duration-300 group-open:rotate-45"
                              aria-hidden
                            />
                          </summary>
                          <div className="px-6 pb-6 text-base leading-relaxed text-lp-on-surface-variant">
                            {faq.a}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-lp-primary-container py-16 text-white md:py-24">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-5 md:px-8 lg:flex-row lg:gap-16 lg:px-12">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="font-heading mb-6 text-3xl font-bold md:text-4xl">
                Still have questions?
              </h2>
              <p className="mx-auto mb-10 max-w-lg text-lg text-white/70 lg:mx-0">
                Our dedicated support team is available to help you with clinical or technical
                inquiries.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Button
                  asChild
                  className="h-12 rounded-lg bg-white px-8 font-bold text-lp-primary-container hover:bg-lp-surface-container-low"
                >
                  <Link href="/contact">Contact Support</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-lg border-white/30 bg-transparent px-8 font-bold text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/services">Browse Services</Link>
                </Button>
              </div>
            </div>

            <div className="grid w-full max-w-lg flex-1 grid-cols-2 gap-8">
              {SUPPORT_CTA_FEATURES.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col items-center text-center lg:items-start lg:text-left"
                >
                  <item.icon className="mb-4 size-10 text-white/50" aria-hidden />
                  <h4 className="mb-1 font-bold">{item.title}</h4>
                  <p className="text-xs text-white/50">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
