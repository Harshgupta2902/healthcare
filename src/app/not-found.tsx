"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Home,
    ArrowLeft,
    Stethoscope,
    MessageCircle,
    Search,
    Sparkles,
    HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const helpfulLinks = [
    {
        icon: Stethoscope,
        label: "Book Consultation",
        desc: "Talk to a doctor in minutes",
        href: "/book-consultation",
    },
    {
        icon: Search,
        label: "Browse Specialists",
        desc: "Find your perfect expert",
        href: "/specialists",
    },
    {
        icon: MessageCircle,
        label: "Contact Support",
        desc: "We're here to help",
        href: "/contact",
    },
];

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-background overflow-hidden flex items-center justify-center px-4 py-20 selection:bg-primary selection:text-primary-foreground">
            {/* Subtle texture overlay (matches the rest of the site) */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />

            {/* Atmospheric glows */}
            <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lost in the network</span>
                </motion.div>

                {/* Massive gradient 404 with floating heart pulse */}
                <div className="relative inline-block">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                        className="text-[8rem] sm:text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary via-blue-600 to-indigo-600 drop-shadow-sm"
                    >
                        404
                    </motion.h1>

                    {/* Floating heart-pulse icon decoration */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                        className="absolute -top-2 -right-4 sm:-top-4 sm:-right-8 md:-top-6 md:-right-12"
                    >
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center shadow-2xl shadow-primary/30"
                        >
                            <HeartPulse className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                    className="text-3xl md:text-5xl font-black tracking-tight mt-6 mb-4"
                >
                    This page took a sick day
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto mb-10"
                >
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Don&apos;t worry — our doctors are still in. Let&apos;s get you back on track.
                </motion.p>

                {/* Primary actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
                >
                    <Button
                        asChild
                        size="lg"
                        className="rounded-2xl h-14 px-8 font-bold w-full sm:w-auto shadow-lg shadow-primary/20"
                    >
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => router.back()}
                        className="rounded-2xl h-14 px-8 font-bold w-full sm:w-auto backdrop-blur-md bg-white/40 dark:bg-white/5"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </motion.div>

                {/* Helpful links — glassmorphism cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                    {helpfulLinks.map((item, i) => (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                        >
                            <Link
                                href={item.href}
                                className="group block h-full p-6 text-left rounded-2xl backdrop-blur-md bg-white/40 dark:bg-white/5 border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">
                                    {item.label}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {item.desc}
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
