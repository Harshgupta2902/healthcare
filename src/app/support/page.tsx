"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
} from "lucide-react";
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
    <div className="min-h-screen bg-white text-lp-on-surface">
      <main className="pb-0 pt-16 md:pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-b from-white to-[#f9fbff]">
          <div className="mx-auto max-w-[1120px] px-5 py-4 text-center md:py-8 md:px-8">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading text-4xl font-bold tracking-tight text-[#102b51] md:text-5xl"
            >
              How can we help you today?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#6f7f94] md:text-lg"
            >
              Search our knowledge base for answers regarding appointments, clinical records, and
              billing services.
            </motion.p>
          </div>
        </section>

        {/* Category grid */}
        <section className="mx-auto max-w-[1120px] px-5 py-12 md:py-16 md:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORT_CATEGORIES.map((cat, index) => (
              <motion.a
                key={cat.title}
                href={cat.href}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="group rounded-2xl border border-[#e1e8f2] bg-white p-6 transition-all duration-[250ms] hover:-translate-y-1 hover:border-[#b9d2f2] hover:shadow-[0_12px_30px_rgba(31,102,190,0.08)]"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl text-[#2871d4] transition-colors">
                  <cat.icon className="size-5" aria-hidden />
                </div>
                <h3 className="font-heading mb-1.5 text-base font-bold text-[#1f385a]">{cat.title}</h3>
                <p className="text-sm leading-relaxed text-[#718198]">
                  {cat.description}
                </p>
              </motion.a>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-[1120px] px-5 pb-12 md:pb-16 md:px-8">
          <h2 className="font-heading mb-10 text-center text-2xl font-bold text-lp-on-surface md:mb-12 md:text-3xl">
            Frequently Asked Questions
          </h2>

          {filteredTopics.length === 0 ? (
            <p className="text-center text-[#718198]">
              No articles match your search. Try different keywords or{" "}
              <Link href="/contact" className="font-semibold text-[#2871d4] hover:underline">
                contact support
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Sidebar */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-24">
                  <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-wide text-[#8390a0]">
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
                            "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-[#eef5ff] font-semibold text-[#2871d4]"
                              : "text-[#6f7f94] hover:bg-[#f5f8fd] hover:text-[#2871d4]",
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
                    <h3 className="font-heading mb-5 text-xl font-bold text-[#122e52]">
                      {topic.title}
                    </h3>
                    <div className="space-y-3">
                      {topic.questions.map((faq) => (
                        <details
                          key={faq.q}
                          className="group rounded-2xl border border-[#e1e8f2] bg-white transition-colors hover:border-[#b9d2f2]"
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
                            <span className="font-heading text-left text-base font-semibold text-[#1f385a]">
                              {faq.q}
                            </span>
                            <Plus
                              className="size-5 shrink-0 text-[#2871d4] transition-transform duration-300 group-open:rotate-45"
                              aria-hidden
                            />
                          </summary>
                          <div className="px-5 pb-5 text-sm leading-relaxed text-[#718198]">
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
        <section className="mx-auto max-w-[1120px] px-5 py-16 md:px-8">
          <div className="cta-box relative overflow-hidden rounded-2xl px-8 py-12 text-white md:px-12 md:py-14">
            <style jsx>{`
              .cta-box {
                background: linear-gradient(105deg, #123b7d, #2873dc);
              }
              .cta-box::after {
                content: "";
                position: absolute;
                width: 280px;
                height: 280px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 50%;
                right: -130px;
                top: -140px;
              }
            `}</style>

            <div className="relative z-10 flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="font-heading mb-4 text-2xl font-bold text-white md:text-3xl">
                  Still have questions?
                </h2>
                <p className="mx-auto mb-8 max-w-lg text-sm text-white/90 md:text-base lg:mx-0">
                  Our dedicated support team is available to help you with clinical or technical
                  inquiries.
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <Link
                    href="/contact"
                    className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#2265b8] transition-colors hover:bg-gray-50"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/services"
                    className="rounded-lg border border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                  >
                    Browse Services
                  </Link>
                </div>
              </div>

              <div className="grid w-full max-w-lg flex-1 grid-cols-2 gap-6">
                {SUPPORT_CTA_FEATURES.map((item) => (
                  <div
                    key={item.title}
                    className="flex flex-col items-center text-center lg:items-start lg:text-left"
                  >
                    <item.icon className="mb-3 size-8 text-white/70" aria-hidden />
                    <h4 className="mb-1 text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-white/70">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
