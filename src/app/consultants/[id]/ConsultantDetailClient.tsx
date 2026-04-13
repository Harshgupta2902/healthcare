"use client";

import {
    Award,
    MapPin,
    ShieldCheck,
    Star,
    IndianRupee,
    Clock,
    Calendar,
    BookOpen,
    AtSign,
    Phone,
    ArrowLeft,
    CheckCircle2,
    Users,
    Stethoscope,
    Briefcase,
    Zap,
    Scale,
    TrendingUp,
    Shield,
    Info,
    GraduationCap,
    ArrowRight,
    FileText
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

/** Hide last 70% — show ~first 30% from the start (email). */
function maskEmailLeading(email: string): string {
    const s = email.trim();
    if (!s) return "";
    const n = s.length;
    if (n <= 2) return "••";
    const visible = Math.max(1, Math.round(n * 0.3));
    const hidden = n - visible;
    return s.slice(0, visible) + "•".repeat(Math.min(hidden, 20));
}

/** Hide first 70% — show ~last 30% from the end (phone). */
function maskPhoneTrailing(phone: string): string {
    const s = phone.trim();
    if (!s) return "";
    const n = s.length;
    if (n <= 2) return "••";
    const visible = Math.max(1, Math.round(n * 0.3));
    const hidden = n - visible;
    return "•".repeat(Math.min(hidden, 20)) + s.slice(-visible);
}

export default function ConsultantDetailClient({ prof }: { prof: any }) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return (
        <div className="min-h-screen bg-[#fcfdff] pb-20 pt-24">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl shrink-0 group">
                            {prof.profilePhotoUrl ? (
                                <img
                                    src={prof.profilePhotoUrl}
                                    alt={prof.displayName ?? prof.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center">
                                    <span className="text-white text-4xl font-bold">{prof.name.slice(0, 2).toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">{prof.displayName ?? prof.name}</h1>
                                {prof.isVerified && (
                                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-100">
                                        <ShieldCheck className="h-3 w-3" />
                                        Verified
                                    </div>
                                )}
                            </div>
                            <p className="text-xl font-bold text-slate-400">{prof.specialization}</p>
                            <div className="flex items-center gap-4 text-2xl font-black text-slate-900">
                                ₹{(prof.consultationFee / 100).toLocaleString() || 0}
                                <span className="text-emerald-500 text-sm font-bold ml-1 flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4" />
                                    Premium Service
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg transition-all active:scale-95 shadow-xl shadow-slate-200 group/btn">
                            Book Appointment
                            <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Sidebar: Scorecard style */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="rounded-[2.5rem] border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                            <div className="p-8 pb-4">
                                <div className="space-y-6">
                                    {/* Experience */}
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover/item:text-indigo-600 group-hover/item:bg-indigo-50 transition-all duration-300">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                                            <p className="text-sm font-black text-slate-900">{prof.yearsOfExperience}+ Years</p>
                                        </div>
                                    </div>

                                    {/* Medical Standing */}
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover/item:text-indigo-600 group-hover/item:bg-indigo-50 transition-all duration-300">
                                            <Award className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">License No</p>
                                            <p className="text-sm font-black text-indigo-600 tabular-nums">{prof.licenseNumber || 'Verified'}</p>
                                        </div>
                                    </div>

                                    {/* Specialty */}
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover/item:text-indigo-600 group-hover/item:bg-indigo-50 transition-all duration-300">
                                            <Stethoscope className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Specialization</p>
                                            <p className="text-sm font-black text-slate-900">{prof.specialization}</p>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover/item:text-indigo-600 group-hover/item:bg-indigo-50 transition-all duration-300">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                            <p className="text-sm font-black text-slate-900">{prof.city || 'Online Consultation'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Main Column: Tab System */}
                    <div className="lg:col-span-8">
                        <Tabs defaultValue="qualifications" className="w-full">
                            <TabsList className="flex w-full overflow-x-auto bg-slate-100/50 backdrop-blur p-1.5 rounded-2xl border border-slate-200/50 h-auto no-scrollbar whitespace-nowrap justify-start gap-2 mb-8">
                                <TabsTrigger value="qualifications" className="gap-2 rounded-xl flex-shrink-0 px-6 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-black text-sm uppercase tracking-widest text-slate-400 transition-all">
                                    <GraduationCap className="h-4 w-4" />
                                    Education
                                </TabsTrigger>
                                <TabsTrigger value="schedule" className="gap-2 rounded-xl flex-shrink-0 px-6 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-black text-sm uppercase tracking-widest text-slate-400 transition-all">
                                    <Clock className="h-4 w-4" />
                                    Availability
                                </TabsTrigger>
                                <TabsTrigger value="contact" className="gap-2 rounded-xl flex-shrink-0 px-6 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-black text-sm uppercase tracking-widest text-slate-400 transition-all">
                                    <Phone className="h-4 w-4" />
                                    Contact
                                </TabsTrigger>
                            </TabsList>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <TabsContent value="qualifications" className="mt-0">
                                    {prof.qualifications && prof.qualifications.length > 0 ? (
                                        <div className="grid gap-6">
                                            {prof.qualifications.map((qual: any, idx: number) => (
                                                <div key={idx} className="flex gap-6 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all">
                                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                                        <Award className="h-8 w-8 text-indigo-500" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="text-xl font-black text-slate-900">{qual.degree}</h4>
                                                        <p className="text-lg font-bold text-slate-400">{qual.institution}</p>
                                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                                            {qual.year && <Badge className="bg-slate-900 text-white border-none text-[10px] uppercase font-black px-3 py-1 rounded-full">{qual.year}</Badge>}
                                                            {qual.document_url && qual.document_approved === true && (
                                                                <Button
                                                                    type="button"
                                                                    variant="link"
                                                                    className="p-0 h-auto text-indigo-600 font-black text-sm cursor-pointer"
                                                                    onClick={() => window.open(qual.document_url, "_blank")}
                                                                >
                                                                    <FileText className="h-3.5 w-3.5 mr-1" />
                                                                    Verification document
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-20 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <BookOpen className="h-10 w-10 text-slate-200" />
                                            </div>
                                            <p className="text-xl font-black text-slate-300">No educational details provided.</p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="schedule" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {prof.availability && prof.availability.length > 0 ? (
                                            prof.availability.map((avail: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm group hover:bg-emerald-50 hover:border-emerald-100 transition-all duration-300">
                                                    <span className="text-xl font-black text-slate-900 group-hover:text-emerald-700">{dayNames[avail.day_of_week]}</span>
                                                    <Badge className="bg-slate-900 text-white border-none font-bold text-sm px-4 py-2 rounded-xl">
                                                        {avail.start_time} - {avail.end_time}
                                                    </Badge>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full p-20 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                                                <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-xl font-black text-slate-300 uppercase tracking-widest">Schedule Privacy Enabled</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="contact" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {prof.email && (
                                            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
                                                <div className="p-3 w-fit bg-indigo-50 rounded-2xl text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                                                    <AtSign className="h-6 w-6" />
                                                </div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                                <p className="text-xl font-black text-slate-900 tracking-tight break-all">
                                                    {maskEmailLeading(prof.email)}
                                                </p>
                                            </div>
                                        )}
                                        {prof.phone && (
                                            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm group hover:border-emerald-200 transition-all">
                                                <div className="p-3 w-fit bg-emerald-50 rounded-2xl text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                                                    <Phone className="h-6 w-6" />
                                                </div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                                                <p className="text-xl font-black text-slate-900 tracking-tight break-all">
                                                    {maskPhoneTrailing(prof.phone)}
                                                </p>
                                            </div>
                                        )}
                                        <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm group hover:border-amber-200 transition-all">
                                            <div className="p-3 w-fit bg-amber-50 rounded-2xl text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                                                <MapPin className="h-6 w-6" />
                                            </div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                            <p className="text-xl font-black text-slate-900">{prof.city || 'Online Consultation'}</p>
                                        </div>
                                    </div>
                                </TabsContent>
                            </motion.div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
