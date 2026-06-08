"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import {
    updateProfessionalProfile,
    addQualification,
    deleteQualification,
    getMyQualificationsSanitized,
    updateAvailability,
    deleteAvailability,
    updateAppointmentStatus,
    updateConsultationRequestStatus,
    saveGuestPrescription,
    type ProfessionalGuestBooking,
} from "@/features/professional/actions";
import { uploadProfileImage } from "@/features/profile/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    User,
    GraduationCap,
    Users,
    Calendar as CalendarIcon,
    IndianRupee,
    MessageSquare,
    Video,
    Loader2,
    Edit,
    Plus,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    Save,
    FileText,
    Mail,
    Info,
    Upload,
    Camera,
    Check,
    ChevronsUpDown
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { formatProfessionalDisplayName, PROFESSIONAL_NAME_TITLES } from "@/lib/professional-name-title";
import { QualificationInstitutionInput } from "./QualificationInstitutionInput";
import {
    DEFAULT_PHONE_COUNTRY_CODE,
    getPhoneCountryOptionByIso2,
    normalizePhoneCountryCode,
    resolveCountryIsoFromDialCode,
} from "@/lib/phone-country-options";
import { cn } from "@/lib/utils";
import { PhoneCountryFields } from "@/components/PhoneCountryFields";
import {
    dashboardGlassCard,
    dashboardMobileNav,
    dashboardMobileNavActive,
    dashboardMobileNavInactive,
    dashboardPageSubtitle,
    dashboardPageTitle,
    dashboardPrimaryButton,
    dashboardStatCard,
    dashboardStatIconWrap,
    dashboardStatLabel,
    dashboardStatValue,
    dashboardTabsList,
    dashboardTabsTrigger,
} from "./dashboard-theme";

const LexicalPrescriptionEditor = dynamic(
    () => import("./LexicalPrescriptionEditor").then((mod) => mod.LexicalPrescriptionEditor),
    {
        ssr: false,
        loading: () => (
            <div className="flex min-h-[520px] items-center justify-center rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-low text-sm text-lp-on-surface-variant">
                Loading editor…
            </div>
        ),
    }
);

interface ProfessionalProfile {
    id: string;
    userId: string;
    specialization: string;
    licenseNumber: string;
    city: string | null;
    bio: string | null;
    /** Salutation stored in professional_profiles.name_title */
    nameTitle: string | null;
    yearsOfExperience: number | null;
    consultationFee: number | null;
    isVerified: boolean;
    phone: string | null;
    /** E.164 dial prefix, e.g. +91 */
    phoneCountryCode: string;
    /** Client-only; disambiguates shared dials (e.g. +1) until ISO is stored in DB. */
    phoneCountryIso?: string;
    profilePhotoUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

interface Qualification {
    id: string;
    professionalId: string;
    degree: string;
    institution: string;
    year: number | null;
    /** Present when a verification file exists (URL itself is only set after approval). */
    hasVerificationDocument: boolean;
    documentUrl: string | null;
    /** null/undefined = in review, true = approved (link enabled), false = verification failed */
    documentApproved?: boolean | null;
    createdAt: string;
}

interface Availability {
    id: string;
    professionalId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

interface Appointment {
    id: string;
    clientId: string;
    professionalId: string;
    appointmentType: string;
    status: string;
    startTime: string;
    endTime: string;
    notes: string | null;
    meetingUrl: string | null;
    clientName?: string;
    clientEmail?: string;
    createdAt: string;
}

interface ConsultationRequest {
    id: string;
    clientId: string;
    professionalId: string;
    requestType: string;
    status: string;
    message: string | null;
    preferredDate: string | null;
    preferredTime: string | null;
    clientName?: string;
    clientEmail?: string;
    createdAt: string;
}

interface Payment {
    id: string;
    clientId: string;
    professionalId: string;
    amount: number;
    status: string;
    paymentMethod: string;
    transactionId: string | null;
    createdAt: string;
    clientName?: string;
}

const DAYS_OF_WEEK = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const SPECIALIZATIONS: string[] = [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Pediatrician",
    "Psychiatrist",
    "Orthopedic",
    "Gynecologist",
    "ENT Specialist",
    "Ophthalmologist",
    "Psychologist",
    "Clinical psychologist",
    "Clinical psychologist (Associate)",
    "Rehabilitation psychologist",
    "Rehabilitation counsellor",
    "Radiologist",
    "Ayurveda",
    "Homeopathy",
    "Naturopathy",
    "Oncologist",
    "General surgeon",
];

export function ProfessionalDashboard({ initialData }: { initialData: any }) {
    const user = initialData?.user;
    const router = useRouter();
    const supabase = createClient();

    const [profile, setProfile] = useState<ProfessionalProfile | null>(initialData?.profile || null);
    const [qualifications, setQualifications] = useState<Qualification[]>(() => {
        const raw = initialData?.qualifications || [];
        return raw.map((q: any) => ({
            ...q,
            hasVerificationDocument:
                q.hasVerificationDocument ?? !!(q.documentUrl || q.document_url),
        }));
    });
    const [availability, setAvailability] = useState<Availability[]>(initialData?.availability || []);
    const [appointments, setAppointments] = useState<Appointment[]>(initialData?.appointments || []);
    const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>(initialData?.consultationRequests || []);
    const [guestAppointments, setGuestAppointments] = useState<ProfessionalGuestBooking[]>(initialData?.guestAppointments ?? []);
    const [payments, setPayments] = useState<Payment[]>(initialData?.payments || []);

    const [isLoadingProfile, setIsLoadingProfile] = useState(!initialData?.profile);
    const [isLoadingQuals, setIsLoadingQuals] = useState(!initialData?.qualifications);
    const [isLoadingAvail, setIsLoadingAvail] = useState(!initialData?.availability);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(!initialData?.appointments);
    const [isLoadingRequests, setIsLoadingRequests] = useState(!initialData?.consultationRequests);
    const [isLoadingGuestBookings, setIsLoadingGuestBookings] = useState(!initialData?.guestAppointments);
    const [isLoadingPayments, setIsLoadingPayments] = useState(!initialData?.payments);
    const [isSaving, setIsSaving] = useState(false);
    const profileImageInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<Partial<ProfessionalProfile>>(initialData?.profile || {});
    const [activeTab, setActiveTab] = useState("profile");
    const [mounted, setMounted] = useState(false);
    const [isSpecializationOpen, setIsSpecializationOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (initialData?.dashboardError) {
            toast.error(initialData.dashboardError);
            setIsLoadingProfile(false);
            setIsLoadingQuals(false);
            setIsLoadingAvail(false);
            setIsLoadingAppointments(false);
            setIsLoadingRequests(false);
            setIsLoadingGuestBookings(false);
            setIsLoadingPayments(false);
        }
    }, [initialData?.dashboardError]);

    const [showAddQualification, setShowAddQualification] = useState(false);
    const [showAddAvailability, setShowAddAvailability] = useState(false);
    const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
    const [prescriptionModalRev, setPrescriptionModalRev] = useState(0);
    const [selectedGuestForPrescription, setSelectedGuestForPrescription] = useState<ProfessionalGuestBooking | null>(null);
    const [prescriptionHtml, setPrescriptionHtml] = useState("");
    const [isSavingPrescription, setIsSavingPrescription] = useState(false);

    const [qualificationForm, setQualificationForm] = useState({
        degree: "",
        institution: "",
        year: null as number | null,
    });
    const [selectedQualFile, setSelectedQualFile] = useState<File | null>(null);
    const [isDraggingQual, setIsDraggingQual] = useState(false);
    const qualInputRef = useRef<HTMLInputElement>(null);

    const [availabilityForm, setAvailabilityForm] = useState({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true
    });
    const [deletingAvailabilityId, setDeletingAvailabilityId] = useState<string | null>(null);

    const scheduledDaySet = useMemo(
        () => new Set(availability.map((slot) => slot.dayOfWeek)),
        [availability],
    );

    const availableDayIndices = useMemo(
        () => DAYS_OF_WEEK.map((_, index) => index).filter((index) => !scheduledDaySet.has(index)),
        [scheduledDaySet],
    );

    const allWeekdaysScheduled = availableDayIndices.length === 0;

    useEffect(() => {
        if (!initialData && user) {
            fetchProfile();
            fetchQualifications();
            fetchAvailability();
            fetchAppointments();
            fetchConsultationRequests();
            fetchGuestBookings();
            fetchPayments();
        }
    }, [initialData, user]);

    const fetchProfile = async () => {
        try {
            const { data: coreProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            const { data: profProfile } = await supabase
                .from('professional_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (coreProfile || profProfile) {
                const dial =
                    normalizePhoneCountryCode(
                        (coreProfile as { phone_country_code?: string | null })?.phone_country_code
                    ) ?? DEFAULT_PHONE_COUNTRY_CODE;
                const merged: ProfessionalProfile = {
                    id: profProfile?.id || "",
                    userId: user.id,
                    specialization: profProfile?.specialization || "",
                    licenseNumber: profProfile?.license_number || "",
                    bio: profProfile?.bio || null,
                    nameTitle:
                        profProfile?.name_title ??
                        (authUser?.user_metadata?.name_title as string | undefined) ??
                        null,
                    yearsOfExperience: profProfile?.years_of_experience || null,
                    consultationFee: profProfile?.consultation_fee || null,
                    city: profProfile?.city || null,
                    isVerified: profProfile?.is_verified || false,
                    phone: coreProfile?.phone || null,
                    phoneCountryCode: dial,
                    profilePhotoUrl: coreProfile?.image || null,
                    createdAt: profProfile?.created_at || "",
                    updatedAt: profProfile?.updated_at || ""
                };
                setProfile(merged);
                setProfileForm(merged);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const fetchQualifications = async () => {
        try {
            const result = await getMyQualificationsSanitized();
            if (result.success) {
                setQualifications(
                    result.qualifications.map((q) => ({
                        id: q.id,
                        professionalId: q.professionalId,
                        degree: q.degree,
                        institution: q.institution,
                        year: q.year,
                        hasVerificationDocument: q.hasVerificationDocument,
                        documentUrl: q.documentUrl,
                        documentApproved: q.documentApproved,
                        createdAt: q.createdAt,
                    }))
                );
            }
        } catch (error) {
            console.error("Qualifications fetch error:", error);
        } finally {
            setIsLoadingQuals(false);
        }
    };

    const fetchAvailability = async () => {
        try {
            const { data, error } = await supabase
                .from('professional_availability')
                .select('*')
                .eq('professional_id', user.id)
                .order('day_of_week', { ascending: true });

            if (data) {
                setAvailability(data.map(a => ({
                    id: a.id,
                    professionalId: a.professional_id,
                    dayOfWeek: a.day_of_week,
                    startTime: a.start_time,
                    endTime: a.end_time,
                    isAvailable: a.is_available
                })));
            }
        } catch (error) {
            console.error("Availability fetch error:", error);
        } finally {
            setIsLoadingAvail(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          client:users!appointments_client_id_fkey(name, email)
        `)
                .eq('professional_id', user.id)
                .order('start_time', { ascending: true });

            if (data) {
                setAppointments(data.map((apt: any) => ({
                    id: apt.id,
                    clientId: apt.client_id,
                    professionalId: apt.professional_id,
                    appointmentType: apt.appointment_type,
                    status: apt.status,
                    startTime: apt.start_time,
                    endTime: apt.end_time,
                    notes: apt.notes,
                    meetingUrl: apt.meeting_url,
                    clientName: apt.client?.name,
                    clientEmail: apt.client?.email,
                    createdAt: apt.created_at
                })));
            }
        } catch (error) {
            console.error("Appointments fetch error:", error);
        } finally {
            setIsLoadingAppointments(false);
        }
    };

    const fetchConsultationRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('consultation_requests')
                .select(`
          *,
          client:users!consultation_requests_client_id_fkey(name, email)
        `)
                .eq('professional_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setConsultationRequests(data.map((req: any) => ({
                    id: req.id,
                    clientId: req.client_id,
                    professionalId: req.professional_id,
                    requestType: req.request_type,
                    status: req.status,
                    message: req.message,
                    preferredDate: req.preferred_date,
                    preferredTime: req.preferred_time,
                    clientName: req.client?.name,
                    clientEmail: req.client?.email,
                    createdAt: req.created_at
                })));
            }
        } catch (error) {
            console.error("Requests fetch error:", error);
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const fetchGuestBookings = async () => {
        try {
            const { data } = await supabase
                .from("guest_appointments")
                .select("*")
                .eq("professional_id", user.id)
                .order("created_at", { ascending: false });

            if (data) {
                setGuestAppointments(
                    data.map((g: any) => ({
                        id: g.id,
                        firstName: g.first_name,
                        lastName: g.last_name,
                        email: g.email,
                        phone: g.phone,
                        category: g.category,
                        state: g.state,
                        city: g.city,
                        appointmentDate: g.appointment_date,
                        appointmentTime: g.appointment_time,
                        message: g.message,
                        createdAt: g.created_at,
                        age: g.age,
                        prescriptionHtml: g.prescription_html || null,
                        prescriptionUpdatedAt: g.prescription_updated_at || null,
                    }))
                );
            }
        } catch (error) {
            console.error("Guest bookings fetch error:", error);
        } finally {
            setIsLoadingGuestBookings(false);
        }
    };

    const fetchPayments = async () => {
        try {
            const { data, error } = await supabase
                .from('payments')
                .select(`
          *,
          client:users!payments_client_id_fkey(name)
        `)
                .eq('professional_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setPayments(data.map((pay: any) => ({
                    id: pay.id,
                    clientId: pay.client_id,
                    professionalId: pay.professional_id,
                    amount: pay.amount,
                    status: pay.status,
                    paymentMethod: pay.payment_method,
                    transactionId: pay.transaction_id,
                    createdAt: pay.created_at,
                    clientName: pay.client?.name
                })));
            }
        } catch (error) {
            console.error("Payments fetch error:", error);
        } finally {
            setIsLoadingPayments(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const result = await updateProfessionalProfile(profileForm);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            await fetchProfile();
            setIsEditingProfile(false);
            toast.success("Profile updated successfully");
            await supabase.auth.refreshSession();
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddQual = async () => {
        if (!selectedQualFile || !qualificationForm.degree || !qualificationForm.institution) {
            toast.error("Please fill all fields and select a verification document");
            return;
        }
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedQualFile);
            formData.append('degree', qualificationForm.degree);
            formData.append('institution', qualificationForm.institution);
            formData.append('year', qualificationForm.year?.toString() || "");

            const result = await addQualification(formData);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Credential added to profile");
            setShowAddQualification(false);
            setQualificationForm({ degree: "", institution: "", year: null });
            setSelectedQualFile(null);
            fetchQualifications();
        } catch (error: any) {
            toast.error(error.message || "Failed to add qualification");
        } finally {
            setIsSaving(false);
        }
    };

    const openAddAvailabilityDialog = (open: boolean) => {
        setShowAddAvailability(open);
        if (open) {
            const firstDay = availableDayIndices[0] ?? 1;
            setAvailabilityForm({
                dayOfWeek: firstDay,
                startTime: "09:00",
                endTime: "17:00",
                isAvailable: true,
            });
        }
    };

    const handleUpdateAvail = async () => {
        if (scheduledDaySet.has(availabilityForm.dayOfWeek)) {
            toast.error(`${DAYS_OF_WEEK[availabilityForm.dayOfWeek]} is already on your schedule.`);
            return;
        }
        if (availabilityForm.startTime >= availabilityForm.endTime) {
            toast.error("End time must be after start time.");
            return;
        }
        setIsSaving(true);
        try {
            const result = await updateAvailability(availabilityForm);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Availability updated");
            setShowAddAvailability(false);
            fetchAvailability();
        } catch (error: any) {
            toast.error(error.message || "Failed to update availability");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteQualification = async (id: string) => {
        try {
            const result = await deleteQualification(id);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Qualification deleted");
            fetchQualifications();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete");
        }
    };

    const handleDeleteAvailability = async (id: string) => {
        setDeletingAvailabilityId(id);
        try {
            const result = await deleteAvailability(id);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Availability deleted");
            fetchAvailability();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete");
        } finally {
            setDeletingAvailabilityId(null);
        }
    };

    const handleUpdateAppointmentStatus = async (id: string, status: string) => {
        try {
            const result = await updateAppointmentStatus(id, status);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success(`Appointment ${status}`);
            fetchAppointments();
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleUpdateRequestStatus = async (id: string, status: string) => {
        try {
            const result = await updateConsultationRequestStatus(id, status);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success(`Request ${status}`);
            fetchConsultationRequests();
        } catch (error: any) {
            toast.error(error.message || "Failed to update request");
        }
    };

    const openPrescriptionModal = (guest: ProfessionalGuestBooking) => {
        const baseTemplate = `<h2>Medical Prescription</h2><p><strong>Patient:</strong> ${guest.firstName} ${guest.lastName}</p><p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p><p><br></p><p><strong>Diagnosis</strong></p><ul><li></li></ul><p><strong>Medicines</strong></p><ol><li></li></ol><p><strong>Instructions</strong></p><ul><li></li></ul>`;
        setSelectedGuestForPrescription(guest);
        setPrescriptionHtml(guest.prescriptionHtml || baseTemplate);
        setPrescriptionModalRev((r) => r + 1);
        setPrescriptionModalOpen(true);
    };

    const handleSavePrescription = async () => {
        if (!selectedGuestForPrescription) return;
        if (!prescriptionHtml.trim()) {
            toast.error("Prescription content is required.");
            return;
        }
        setIsSavingPrescription(true);
        try {
            const result = await saveGuestPrescription({
                guestAppointmentId: selectedGuestForPrescription.id,
                prescriptionHtml,
            });
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            setGuestAppointments((prev) =>
                prev.map((g) =>
                    g.id === selectedGuestForPrescription.id
                        ? { ...g, prescriptionHtml, prescriptionUpdatedAt: new Date().toISOString() }
                        : g
                )
            );
            toast.success("Prescription saved.");
            setPrescriptionModalOpen(false);
            setSelectedGuestForPrescription(null);
        } catch (error: any) {
            toast.error(error?.message || "Failed to save prescription.");
        } finally {
            setIsSavingPrescription(false);
        }
    };
    const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadProfileImage(formData);
            if (result.success) {
                toast.success("Profile photo updated");
                setProfileForm(prev => ({ ...prev, profilePhotoUrl: result.url }));
                await supabase.auth.refreshSession();
                router.refresh();
            } else {
                toast.error(result.error || "Failed to upload image");
            }
        } catch (error: any) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const totalEarnings = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="container overflow-x-hidden px-4 sm:px-6 py-6 pb-28 sm:pb-10 md:py-10">
            <div className="mb-6 sm:mb-8">
                <h2 className={dashboardPageTitle}>Professional Dashboard</h2>
                <p className={dashboardPageSubtitle}>
                    Manage your practice, appointments, and client consultations
                </p>
                <Link
                    href="/dashboard/blog"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-lp-brand hover:underline"
                >
                    <FileText className="h-4 w-4" />
                    Write a blog article
                </Link>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <Card className={dashboardStatCard}>
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className={dashboardStatIconWrap}>
                                <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className={dashboardStatLabel}>Total Earnings</p>
                                <p className={dashboardStatValue}>₹{(totalEarnings / 100).toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className={dashboardStatCard}>
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className={dashboardStatIconWrap}>
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className={dashboardStatLabel}>Pending</p>
                                <p className={dashboardStatValue}>₹{(pendingPayments / 100).toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className={dashboardStatCard}>
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className={dashboardStatIconWrap}>
                                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className={dashboardStatLabel}>Appointments</p>
                                <p className={dashboardStatValue}>{appointments.length + guestAppointments.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className={dashboardStatCard}>
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className={dashboardStatIconWrap}>
                                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className={dashboardStatLabel}>Requests</p>
                                <p className={dashboardStatValue}>
                                    {consultationRequests.filter((r) => r.status === "pending").length + guestAppointments.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className={dashboardTabsList}>
                    <TabsTrigger value="profile" className={dashboardTabsTrigger}>
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="credentials" className={dashboardTabsTrigger}>
                        <GraduationCap className="h-4 w-4" />
                        Credentials
                    </TabsTrigger>
                    <TabsTrigger value="consultations" className={dashboardTabsTrigger}>
                        <MessageSquare className="h-4 w-4" />
                        Consultations
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className={dashboardTabsTrigger}>
                        <CalendarIcon className="h-4 w-4" />
                        Calendar
                    </TabsTrigger>
                    <TabsTrigger value="payments" className={dashboardTabsTrigger}>
                        <IndianRupee className="h-4 w-4" />
                        Payments
                    </TabsTrigger>
                    <TabsTrigger value="clients" className={dashboardTabsTrigger}>
                        <Users className="h-4 w-4" />
                        Clients
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className={dashboardGlassCard}>
                        <CardHeader className="border-b border-lp-outline-variant/20 bg-gradient-to-r from-lp-surface-container-low/80 to-lp-surface-container/50 pt-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <CardTitle className="text-xl font-black text-lp-cta-bg">Professional Information</CardTitle>
                                    <CardDescription>Your professional profile and contact details</CardDescription>
                                </div>
                                {!isEditingProfile ? (
                                    <Button onClick={() => setIsEditingProfile(true)} size="sm" variant="outline" className="w-full rounded-lg px-5 sm:w-auto sm:rounded-full">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex w-full gap-2 sm:w-auto">
                                        <Button onClick={() => { setIsEditingProfile(false); setProfileForm(profile || {}); }} size="sm" variant="outline" className="flex-1 rounded-lg px-5 sm:flex-none sm:rounded-full">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveProfile} size="sm" disabled={isSaving} className={`flex-1 rounded-lg px-5 sm:flex-none sm:rounded-full ${dashboardPrimaryButton}`}>
                                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            {isLoadingProfile ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                ref={profileImageInputRef}
                                                onChange={handleProfileImageUpload}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-white shadow-2xl relative overflow-hidden">
                                                <AvatarImage src={profileForm.profilePhotoUrl || undefined} className="object-cover" />
                                                <AvatarFallback className="bg-gradient-to-br from-lp-brand to-lp-brand-bright text-lp-on-brand text-4xl font-bold">
                                                    {(user.user_metadata?.name || user.email)?.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                                {isUploadingImage ? (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer" onClick={() => profileImageInputRef.current?.click()}>
                                                        <Camera className="h-8 w-8 text-white" />
                                                    </div>
                                                )}
                                            </Avatar>
                                            {!isEditingProfile && profile?.isVerified && (
                                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg">
                                                    <CheckCircle className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full flex-1 space-y-4 text-center sm:text-left">
                                            {isEditingProfile ? (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold text-lp-on-surface-variant">Profile Photo URL</Label>
                                                    <Input
                                                        placeholder="Enter image URL"
                                                        value={profileForm.profilePhotoUrl || ""}
                                                        onChange={(e) => setProfileForm({ ...profileForm, profilePhotoUrl: e.target.value })}
                                                        className="rounded-xl border-lp-outline-variant/30 focus:ring-slate-400"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <h3 className="text-xl sm:text-2xl font-black text-lp-cta-bg">
                                                        {formatProfessionalDisplayName(
                                                            user.user_metadata?.name || "",
                                                            profile?.nameTitle
                                                        ) || "Professional"}
                                                    </h3>
                                                    <p className="text-sm font-semibold uppercase tracking-wide text-lp-brand">{profile?.specialization || "Not Specified"}</p>
                                                    {profile?.isVerified && (
                                                        <Badge className="bg-green-50 text-green-700 border-green-100 mt-2 font-bold px-3">Verified Medical Professional</Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Separator className="bg-lp-surface-container-low" />

                                    <div className="grid min-w-0 gap-6 md:grid-cols-2">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-bold text-lp-on-surface-variant">Title & full name</Label>
                                            {isEditingProfile ? (
                                                <div className="flex flex-col overflow-hidden rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-low/30 sm:flex-row">
                                                    <Select
                                                        value={profileForm.nameTitle ?? "_none_"}
                                                        onValueChange={(v) =>
                                                            setProfileForm({
                                                                ...profileForm,
                                                                nameTitle: v === "_none_" ? null : v,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            className={cn(
                                                                "shrink-0 rounded-none border-0",
                                                                "w-full sm:w-32",
                                                                "focus:ring-0 focus:ring-offset-0"
                                                            )}
                                                            aria-label="Title"
                                                        >
                                                            <SelectValue placeholder="Title" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="_none_">None</SelectItem>
                                                            {PROFESSIONAL_NAME_TITLES.map((t) => (
                                                                <SelectItem key={t} value={t}>
                                                                    {t}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        value={user.user_metadata?.name || ""}
                                                        disabled
                                                        className="min-w-0 flex-1 rounded-none border-0 border-t border-lp-outline-variant/30/80 bg-lp-surface-container-low/50 font-bold shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:border-l sm:border-t-0"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-low/30 sm:flex-row">
                                                    <div className="flex h-11 w-full shrink-0 items-center border-b border-lp-outline-variant/30/80 bg-lp-surface-container-low/50 px-3 text-sm font-bold text-lp-cta-bg sm:h-12 sm:w-32 sm:border-b-0 sm:border-r">
                                                        {profileForm.nameTitle ?? "—"}
                                                    </div>
                                                    <div className="flex min-h-12 flex-1 items-center px-4 py-2 text-sm font-bold text-lp-cta-bg">
                                                        {user.user_metadata?.name || ""}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-bold text-lp-on-surface-variant">Email Address</Label>
                                            <Input value={user.email || ""} disabled className="bg-lp-surface-container-low/50 rounded-xl border-none font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-lp-on-surface-variant">Specialization *</Label>
                                            <Popover open={isSpecializationOpen} onOpenChange={setIsSpecializationOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={isSpecializationOpen}
                                                        className="rounded-xl w-full justify-between"
                                                        disabled={!isEditingProfile}
                                                    >
                                                        {profileForm.specialization || "Select specialization"}
                                                        <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4 shrink-0" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0 rounded-xl w-[--radix-popover-trigger-width]">
                                                    <Command>
                                                        <CommandInput placeholder="Search specialization..." />
                                                        <CommandList>
                                                            <CommandEmpty>No specialization found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {SPECIALIZATIONS.map((spec) => (
                                                                    <CommandItem
                                                                        key={spec}
                                                                        value={spec}
                                                                        onSelect={() => {
                                                                            setProfileForm({ ...profileForm, specialization: spec });
                                                                            setIsSpecializationOpen(false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={`mr-2 h-4 w-4 ${profileForm.specialization === spec ? "opacity-100" : "opacity-0"}`}
                                                                        />
                                                                        {spec}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-lp-on-surface-variant">Medical License Number</Label>
                                            <Input
                                                placeholder="Enter license number"
                                                value={profileForm.licenseNumber || ""}
                                                onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                                                disabled={!isEditingProfile}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-lp-on-surface-variant">City / Primary Practice Location</Label>
                                            <Input
                                                placeholder="e.g., Mumbai, Bangalore"
                                                value={profileForm.city || ""}
                                                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                                                disabled={!isEditingProfile}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-lp-on-surface-variant">Contact Phone</Label>
                                            <PhoneCountryFields
                                                countryIso={
                                                    profileForm.phoneCountryIso ??
                                                    resolveCountryIsoFromDialCode(
                                                        normalizePhoneCountryCode(profileForm.phoneCountryCode) ??
                                                            DEFAULT_PHONE_COUNTRY_CODE
                                                    )
                                                }
                                                nationalNumber={(profileForm.phone || "").replace(/\D/g, "")}
                                                onCountryIsoChange={(iso) => {
                                                    const row = getPhoneCountryOptionByIso2(iso);
                                                    if (!row) return;
                                                    const digits = (profileForm.phone || "")
                                                        .replace(/\D/g, "")
                                                        .slice(0, row.maxLength);
                                                    setProfileForm({
                                                        ...profileForm,
                                                        phoneCountryIso: row.iso2,
                                                        phoneCountryCode: row.dialCode,
                                                        phone: digits,
                                                    });
                                                }}
                                                onNationalChange={(digits) =>
                                                    setProfileForm({ ...profileForm, phone: digits })
                                                }
                                                disabled={!isEditingProfile}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <Label className="text-sm font-bold text-lp-on-surface-variant">Experience</Label>
                                                <span className="text-[10px] font-bold text-lp-brand uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full ring-1 ring-indigo-100">
                                                    {profileForm.yearsOfExperience || 0} Years
                                                </span>
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                                                placeholder="Total years of medical practice"
                                                value={profileForm.yearsOfExperience || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? null : parseInt(e.target.value);
                                                    setProfileForm({ ...profileForm, yearsOfExperience: val });
                                                }}
                                                disabled={!isEditingProfile}
                                                className="rounded-xl border-lp-outline-variant/30 h-12 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <Label className="text-sm font-bold text-lp-on-surface-variant">Consultation Fee</Label>
                                                <span className="text-[10px] font-black text-lp-brand uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full ring-1 ring-indigo-100">
                                                    ₹{((profileForm.consultationFee || 0) / 100).toLocaleString('en-IN')} INR
                                                </span>
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                                                placeholder="Enter fee in rupees (e.g. 500)"
                                                value={profileForm.consultationFee !== null && profileForm.consultationFee !== undefined ? Math.floor((profileForm.consultationFee || 0) / 100) : ""}
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? null : parseInt(e.target.value);
                                                    setProfileForm({ ...profileForm, consultationFee: val === null ? null : val * 100 });
                                                }}
                                                disabled={!isEditingProfile}
                                                className="rounded-xl border-lp-outline-variant/30 h-12"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-lp-on-surface-variant">Professional Bio</Label>
                                        <Textarea
                                            placeholder="Write about yourself, your experience, and expertise..."
                                            value={profileForm.bio || ""}
                                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                            disabled={!isEditingProfile}
                                            rows={6}
                                            className="rounded-lg sm:rounded-2xl border-lp-outline-variant/30 resize-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="credentials" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border border-lp-outline-variant/20 shadow-xl bg-lp-surface-container-lowest/80 backdrop-blur-md rounded-lg sm:rounded-2xl overflow-hidden">
                        <CardHeader className="pt-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <CardTitle>Qualifications & Licenses</CardTitle>
                                    <CardDescription>Your educational background and certifications</CardDescription>
                                </div>
                                <Dialog open={showAddQualification} onOpenChange={setShowAddQualification}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg px-5 sm:w-auto sm:rounded-full sm:px-6">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Credential
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-lg sm:rounded-2xl max-w-lg w-[calc(100vw-2rem)] sm:w-full overflow-visible">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-black">Add New Qualification</DialogTitle>
                                            <DialogDescription>Enter your educational or professional certification details</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-6 pt-4">
                                            <div className="space-y-2">
                                                <Label className="font-bold text-lp-on-surface-variant">Degree/Certification *</Label>
                                                <Input
                                                    placeholder="e.g., MD Cardiology, Board Certified"
                                                    value={qualificationForm.degree}
                                                    onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s\.]/g, '')}
                                                    onChange={(e) =>
                                                        setQualificationForm((prev) => ({ ...prev, degree: e.target.value }))
                                                    }
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold text-lp-on-surface-variant">Issuing Institution *</Label>
                                                <QualificationInstitutionInput
                                                    active={showAddQualification}
                                                    value={qualificationForm.institution}
                                                    onChange={(institution) =>
                                                        setQualificationForm((prev) => ({ ...prev, institution }))
                                                    }
                                                    disabled={isSaving}
                                                />
                                            </div>
                                            <div className="space-y-4 w-full min-w-0">
                                                <div className="space-y-2">
                                                    <Label className="font-bold text-lp-on-surface-variant">Year Awarded</Label>
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        autoComplete="off"
                                                        maxLength={4}
                                                        placeholder="YYYY"
                                                        value={qualificationForm.year === null ? "" : String(qualificationForm.year)}
                                                        onChange={(e) => {
                                                            const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                                                            if (digits === "") {
                                                                setQualificationForm((prev) => ({ ...prev, year: null }));
                                                                return;
                                                            }
                                                            let n = parseInt(digits, 10);
                                                            const maxY = new Date().getFullYear();
                                                            const minY = 1950;
                                                            if (digits.length === 4) {
                                                                if (n > maxY) n = maxY;
                                                                if (n < minY) n = minY;
                                                            }
                                                            setQualificationForm((prev) => ({ ...prev, year: n }));
                                                        }}
                                                        className="rounded-xl h-12 w-full"
                                                    />
                                                </div>
                                                <div className="w-full min-w-0">
                                                    <div
                                                        className={`p-6 sm:p-10 border-2 border-dashed rounded-xl sm:rounded-[32px] text-center transition-all duration-300 relative group cursor-pointer w-full min-w-0 overflow-hidden
                                                        ${isDraggingQual
                                                                ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-2xl shadow-indigo-100'
                                                                : 'border-lp-outline-variant/30 bg-lp-surface-container-low/50 hover:border-indigo-300 hover:bg-lp-surface-container-low'
                                                            }`}
                                                        onClick={() => qualInputRef.current?.click()}
                                                        onDragOver={(e) => { e.preventDefault(); setIsDraggingQual(true); }}
                                                        onDragLeave={() => setIsDraggingQual(false)}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            setIsDraggingQual(false);
                                                            const file = e.dataTransfer.files?.[0];
                                                            if (file) setSelectedQualFile(file);
                                                        }}
                                                    >
                                                        <input
                                                            type="file"
                                                            ref={qualInputRef}
                                                            className="hidden"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e) => setSelectedQualFile(e.target.files?.[0] || null)}
                                                        />
                                                        <div className="space-y-3 min-w-0">
                                                            <div className={`h-20 w-20 rounded-xl sm:rounded-3xl shadow-sm flex items-center justify-center mx-auto transition-all duration-500 shrink-0
                                                            ${isDraggingQual ? 'bg-indigo-600 text-white rotate-12' : 'bg-white text-indigo-500 group-hover:scale-110'}
                                                        `}>
                                                                <Upload className="h-10 w-10" />
                                                            </div>
                                                            <div className="min-w-0 px-1">
                                                                <p className="font-black text-slate-800 text-base sm:text-lg break-all">
                                                                    {selectedQualFile ? selectedQualFile.name : "Drop Verification File"}
                                                                </p>
                                                                <p className="text-[10px] text-lp-on-surface-variant font-black uppercase tracking-[0.2em] mt-1">
                                                                    {selectedQualFile ? `${(selectedQualFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF, JPG, PNG (Max 10MB)"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button onClick={handleAddQual} className="w-full rounded-lg sm:rounded-full h-12 bg-indigo-600 text-lg font-bold" disabled={isSaving}>
                                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                                Verify & Add Credential
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-3 sm:p-6 md:p-8">
                            {isLoadingQuals ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : qualifications.length === 0 ? (
                                <div className="text-center py-16 sm:py-24 bg-lp-surface-container-low/50 rounded-lg sm:rounded-2xl border-2 border-dashed border-lp-outline-variant/30">
                                    <div className="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <GraduationCap className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <h4 className="text-lg font-black text-lp-cta-bg">No Credentials Listed</h4>
                                    <p className="text-lp-on-surface-variant max-w-xs mx-auto mt-2">Display your professional authority by adding your degrees and certifications.</p>
                                    <Button variant="link" onClick={() => setShowAddQualification(true)} className="mt-4 text-lp-brand font-bold">Add your first one now →</Button>
                                </div>
                            ) : (
                                <div className="grid min-w-0 gap-4 sm:gap-6 md:grid-cols-2">
                                    {qualifications.map((qual) => (
                                        <div
                                            key={qual.id}
                                            className="group relative w-full min-w-0 max-w-full overflow-hidden p-5 sm:p-6 bg-white border border-lp-outline-variant/30 rounded-lg sm:rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="p-2 bg-indigo-50 rounded-lg text-lp-brand">
                                                            <GraduationCap className="h-6 w-6" />
                                                        </div>
                                                        <h4 className="min-w-0 break-words font-black text-lp-cta-bg text-lg">
                                                            {qual.degree}
                                                        </h4>
                                                    </div>
                                                    <p className="break-words text-lp-on-surface-variant font-bold">{qual.institution}</p>
                                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 text-sm font-medium text-lp-on-surface-variant">
                                                        {qual.year && (
                                                            <span className="flex min-w-0 items-center gap-1">
                                                                <Clock className="h-3 w-3" /> {qual.year}
                                                            </span>
                                                        )}
                                                        {qual.hasVerificationDocument && qual.documentApproved === true && qual.documentUrl && (
                                                            <Button
                                                                size="sm"
                                                                variant="link"
                                                                className="p-0 h-auto text-indigo-500 font-bold cursor-pointer"
                                                                onClick={() => window.open(qual.documentUrl!, "_blank")}
                                                            >
                                                                <FileText className="h-3 w-3 mr-1" />
                                                                Verification Link
                                                            </Button>
                                                        )}
                                                        {qual.hasVerificationDocument && qual.documentApproved == null && (
                                                            <span className="flex min-w-0 flex-wrap items-center gap-2 text-lp-on-surface-variant">
                                                                <Button
                                                                    size="sm"
                                                                    variant="link"
                                                                    className="h-auto min-w-0 p-0 text-lp-on-surface-variant font-bold pointer-events-none cursor-not-allowed"
                                                                    disabled
                                                                    tabIndex={-1}
                                                                    aria-disabled
                                                                >
                                                                    <FileText className="h-3 w-3 mr-1" />
                                                                    Verification Link
                                                                </Button>
                                                                <span className="text-xs font-black uppercase tracking-wider text-amber-600">(In Review)</span>
                                                            </span>
                                                        )}
                                                        {qual.hasVerificationDocument && qual.documentApproved === false && (
                                                            <span className="flex min-w-0 flex-wrap items-center gap-2 text-lp-on-surface-variant">
                                                                <Button
                                                                    size="sm"
                                                                    variant="link"
                                                                    className="h-auto min-w-0 p-0 text-lp-on-surface-variant font-bold pointer-events-none cursor-not-allowed"
                                                                    disabled
                                                                    tabIndex={-1}
                                                                    aria-disabled
                                                                >
                                                                    <FileText className="h-3 w-3 mr-1" />
                                                                    Verification Link
                                                                </Button>
                                                                <span className="text-xs font-black uppercase tracking-wider text-rose-600">(Verification failed)</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="rounded-full hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity"
                                                    onClick={() => handleDeleteQualification(qual.id)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="consultations" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border border-lp-outline-variant/20 shadow-xl bg-lp-surface-container-lowest/80 backdrop-blur-md rounded-lg sm:rounded-2xl">
                        <CardHeader className="pt-4">
                            <CardTitle>Consultation Requests</CardTitle>
                            <CardDescription>Manage incoming video and text consultation requests from new clients</CardDescription>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            {isLoadingRequests || isLoadingGuestBookings ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : consultationRequests.length === 0 && guestAppointments.length === 0 ? (
                                <div className="text-center py-16 sm:py-24 bg-lp-surface-container-low/50 rounded-lg sm:rounded-2xl border-2 border-dashed border-lp-outline-variant/30">
                                    <div className="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <MessageSquare className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <h4 className="text-lg font-black text-lp-cta-bg">Quiet Inbox</h4>
                                    <p className="text-lp-on-surface-variant max-w-xs mx-auto mt-2">Guest bookings from your public link and in-app requests will show here.</p>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {guestAppointments.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="grid min-w-0 gap-4 lg:grid-cols-3">
                                                {guestAppointments.map((g) => (
                                                    <div
                                                        key={g.id}
                                                        className="group w-full min-w-0 max-w-full overflow-hidden p-4 bg-white border border-indigo-100 rounded-lg sm:rounded-2xl hover:shadow-xl transition-all duration-300"
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="bg-lp-surface-container-low h-8 w-8 rounded-full flex items-center justify-center font-bold text-lp-on-surface-variant text-xs">
                                                                {(g.firstName || "G").charAt(0)}
                                                            </div>
                                                            <p className="font-bold text-slate-800">
                                                                {`${g.firstName} ${g.lastName}`.trim() || "Guest"}
                                                            </p>
                                                            <span className="text-lp-on-surface-variant text-sm">·</span>
                                                            <span className="text-sm font-bold text-lp-on-surface-variant">Age {g.age}</span>
                                                        </div>
                                                        <p className="text-xs font-black uppercase tracking-wide text-lp-on-surface-variant mt-2">
                                                            {g.category} · {g.city}, {g.state}
                                                        </p>
                                                        <p className="text-sm font-bold text-lp-brand flex items-center gap-2 mt-2">
                                                            <CalendarIcon className="h-4 w-4" />
                                                            {mounted
                                                                ? new Date(`${g.appointmentDate}T${g.appointmentTime || "00:00"}:00`).toLocaleString("en-US", {
                                                                      weekday: "short",
                                                                      year: "numeric",
                                                                      month: "short",
                                                                      day: "numeric",
                                                                      hour: "numeric",
                                                                      minute: "2-digit",
                                                                  })
                                                                : ""}
                                                        </p>
                                                        {g.message && (
                                                            <div className="relative mt-3">
                                                                <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 rounded-full" />
                                                                <p className="text-lp-on-surface-variant italic text-sm pl-4 line-clamp-2">"{g.message}"</p>
                                                            </div>
                                                        )}
                                                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                                                            <Button
                                                                size="sm"
                                                                variant={g.prescriptionHtml ? "outline" : "default"}
                                                                className={cn(
                                                                    "rounded-lg sm:rounded-full font-black",
                                                                    g.prescriptionHtml
                                                                        ? "border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                                                )}
                                                                onClick={() => openPrescriptionModal(g)}
                                                            >
                                                                {g.prescriptionHtml ? "Edit Prescription" : "Prescribe"}
                                                            </Button>
                                                            {g.prescriptionHtml && (
                                                                <Badge className="w-fit bg-green-50 text-green-700 border-green-100 text-[10px] uppercase font-black">
                                                                    Saved
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {consultationRequests.length > 0 && (
                                        <div className="space-y-4">
                                            {guestAppointments.length > 0 && (
                                                <h3 className="text-xs font-black uppercase tracking-widest text-lp-on-surface-variant">In-app consultation requests</h3>
                                            )}
                                            <div className="grid min-w-0 gap-4 lg:grid-cols-3">
                                                {consultationRequests.map((request) => (
                                                    <div
                                                        key={request.id}
                                                        className="group w-full min-w-0 max-w-full overflow-hidden p-4 bg-white border border-lp-outline-variant/30 rounded-lg sm:rounded-2xl hover:shadow-xl transition-all duration-300"
                                                    >
                                                        <div className="flex flex-col justify-between gap-4 h-full">
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    <div className={`p-2 rounded-xl ${request.requestType === "video" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                                                                        {request.requestType === "video" ? <Video className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
                                                                    </div>
                                                                    <h4 className="font-black text-lp-cta-bg text-lg uppercase tracking-tight">
                                                                        {request.requestType} Consulting
                                                                    </h4>
                                                                    <Badge className={`rounded-full px-3 py-1 font-black uppercase text-[10px] ${request.status === "pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                                        request.status === "accepted" ? "bg-green-100 text-green-700 border-green-200" :
                                                                            "bg-red-100 text-red-700 border-red-200"
                                                                        }`}>
                                                                        {request.status}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="bg-lp-surface-container-low h-8 w-8 rounded-full flex items-center justify-center font-bold text-lp-on-surface-variant text-xs">
                                                                        {(request.clientName || "C").charAt(0)}
                                                                    </div>
                                                                    <p className="font-bold text-slate-800">
                                                                        {request.clientName || "Healthcare Client"}
                                                                    </p>
                                                                </div>
                                                                {request.preferredDate && (
                                                                    <p className="text-sm font-bold text-lp-brand flex items-center gap-2">
                                                                        <CalendarIcon className="h-4 w-4" />
                                                                        {mounted ? new Date(request.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                                                                        {request.preferredTime && <span className="text-lp-on-surface-variant">• {request.preferredTime}</span>}
                                                                    </p>
                                                                )}
                                                                {request.message && (
                                                                    <div className="relative mt-4">
                                                                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 rounded-full" />
                                                                        <p className="text-lp-on-surface-variant italic text-sm pl-4 line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">"{request.message}"</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {request.status === "pending" && (
                                                                <div className="grid grid-cols-2 gap-2 pt-1 sm:flex">
                                                                    <Button
                                                                        size="sm"
                                                                        className="rounded-lg sm:rounded-full bg-green-600 hover:bg-green-700 shadow-lg text-white font-black px-4 sm:px-5"
                                                                        onClick={() => handleUpdateRequestStatus(request.id, "accepted")}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-1.5" />
                                                                        Accept
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="rounded-lg sm:rounded-full text-red-600 border-red-200 hover:bg-red-50 font-black px-4 sm:px-5"
                                                                        onClick={() => handleUpdateRequestStatus(request.id, "rejected")}
                                                                    >
                                                                        <XCircle className="h-4 w-4 mr-1.5" />
                                                                        Decline
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Dialog
                        open={prescriptionModalOpen}
                        onOpenChange={(open) => {
                            setPrescriptionModalOpen(open);
                            if (!open) {
                                setSelectedGuestForPrescription(null);
                            }
                        }}
                    >
                        <DialogContent className="w-[min(1400px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] sm:max-w-[min(1400px,calc(100vw-2rem))] rounded-lg sm:rounded-2xl max-h-[min(92vh,960px)] overflow-y-auto sm:p-8">
                            <DialogHeader>
                                <DialogTitle>
                                    {selectedGuestForPrescription
                                        ? `Prescription - ${selectedGuestForPrescription.firstName} ${selectedGuestForPrescription.lastName}`
                                        : "Write Prescription"}
                                </DialogTitle>
                                <DialogDescription>
                                    Use rich text format for diagnosis, medicines and instructions.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                {selectedGuestForPrescription ? (
                                    <LexicalPrescriptionEditor
                                        key={`presc-${selectedGuestForPrescription.id}-${prescriptionModalRev}`}
                                        initialHtml={prescriptionHtml}
                                        onHtmlChange={setPrescriptionHtml}
                                    />
                                ) : null}
                                <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                                    <Button
                                        variant="outline"
                                        className="rounded-lg sm:rounded-full"
                                        onClick={() => setPrescriptionModalOpen(false)}
                                        disabled={isSavingPrescription}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="rounded-lg sm:rounded-full bg-indigo-600 hover:bg-indigo-700"
                                        onClick={handleSavePrescription}
                                        disabled={isSavingPrescription}
                                    >
                                        {isSavingPrescription ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                        Save Prescription
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                <TabsContent value="calendar" className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
                    <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                        <Card className="border border-lp-outline-variant/20 shadow-xl bg-lp-surface-container-lowest/80 backdrop-blur-md rounded-lg sm:rounded-2xl overflow-hidden">
                            <CardHeader className="pt-4 bg-indigo-50/50">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <CardTitle className="text-lp-cta-bg font-black">Weekly Availability</CardTitle>
                                        <CardDescription>Setup your core recurring working hours</CardDescription>
                                    </div>
                                    <Dialog open={showAddAvailability} onOpenChange={openAddAvailabilityDialog}>
                                        <DialogTrigger asChild>
                                            <Button
                                                size="sm"
                                                disabled={allWeekdaysScheduled}
                                                className={`w-full px-5 sm:w-auto sm:rounded-full ${dashboardPrimaryButton}`}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Slot
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-lg sm:rounded-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="font-heading text-xl font-bold text-lp-cta-bg">
                                                    Add availability time slot
                                                </DialogTitle>
                                                <DialogDescription>These slots will repeat every week</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-6 pt-4">
                                                <div className="space-y-2">
                                                    <Label className="font-semibold text-lp-on-surface-variant">Select Day</Label>
                                                    <Select
                                                        value={availabilityForm.dayOfWeek.toString()}
                                                        onValueChange={(value) =>
                                                            setAvailabilityForm({
                                                                ...availabilityForm,
                                                                dayOfWeek: parseInt(value, 10),
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="h-12 rounded-xl">
                                                            <SelectValue placeholder="Choose a day" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            {availableDayIndices.map((index) => (
                                                                <SelectItem key={index} value={index.toString()}>
                                                                    {DAYS_OF_WEEK[index]}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {availableDayIndices.length === 0 ? (
                                                        <p className="text-xs font-medium text-lp-on-surface-variant">
                                                            All days are already scheduled. Remove a day to add another.
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="font-bold text-lp-on-surface-variant flex items-center gap-2">
                                                            <Clock className="h-4 w-4" /> Start Time
                                                        </Label>
                                                        <Input
                                                            type="time"
                                                            value={availabilityForm.startTime}
                                                            onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
                                                            className="rounded-xl h-12"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="font-bold text-lp-on-surface-variant flex items-center gap-2">
                                                            <Clock className="h-4 w-4" /> End Time
                                                        </Label>
                                                        <Input
                                                            type="time"
                                                            value={availabilityForm.endTime}
                                                            onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
                                                            className="rounded-xl h-12"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={handleUpdateAvail}
                                                    className={`h-12 w-full rounded-xl text-base font-semibold sm:rounded-full ${dashboardPrimaryButton}`}
                                                    disabled={isSaving || availableDayIndices.length === 0}
                                                >
                                                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                                    Save Schedule
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                                {isLoadingAvail ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                    </div>
                                ) : availability.length === 0 ? (
                                    <div className="text-center py-20 bg-lp-surface-container-low/50 rounded-lg sm:rounded-2xl">
                                        <p className="text-lp-on-surface-variant font-bold">Your schedule is empty.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {availability.map((slot) => (
                                            <div
                                                key={slot.id}
                                                className="group flex w-full min-w-0 max-w-full flex-col gap-3 overflow-hidden p-4 border border-lp-outline-variant/30 rounded-lg sm:rounded-2xl hover:bg-lp-surface-container-low transition-all sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-6">
                                                    <div className="font-black text-lp-cta-bg sm:w-24 sm:border-r-2 sm:border-lp-outline-variant/30">
                                                        {DAYS_OF_WEEK[slot.dayOfWeek]}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 font-black text-lp-brand">
                                                        <Clock className="h-4 w-4" />
                                                        {slot.startTime} <span className="text-slate-300 font-normal mx-1">→</span> {slot.endTime}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="self-end rounded-full text-lp-on-surface-variant hover:bg-red-50 hover:text-red-600 sm:self-auto"
                                                    disabled={deletingAvailabilityId === slot.id}
                                                    onClick={() => handleDeleteAvailability(slot.id)}
                                                    aria-label={`Remove ${DAYS_OF_WEEK[slot.dayOfWeek]} slot`}
                                                >
                                                    {deletingAvailabilityId === slot.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-lp-brand" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-lp-outline-variant/20 shadow-xl bg-lp-surface-container-lowest/80 backdrop-blur-md rounded-lg sm:rounded-2xl overflow-hidden">
                            <CardHeader className="pt-4 bg-emerald-50/50">
                                <CardTitle className="text-lp-cta-bg font-black">Upcoming Appointments</CardTitle>
                                <CardDescription>Confirmed consultations for the next 7 days</CardDescription>
                            </CardHeader>
                            <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                                {isLoadingAppointments ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                    </div>
                                ) : appointments.length === 0 ? (
                                    <div className="text-center py-20 bg-lp-surface-container-low/50 rounded-lg sm:rounded-2xl">
                                        <p className="text-lp-on-surface-variant font-bold">No upcoming appointments scheduled.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {appointments.map((apt) => (
                                            <div
                                                key={apt.id}
                                                className="w-full min-w-0 max-w-full overflow-hidden p-5 border border-lp-outline-variant/30 rounded-lg sm:rounded-2xl bg-white shadow-sm"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-lp-surface-container-low flex items-center justify-center font-black text-lp-on-surface-variant">
                                                                {(apt.clientName || "P").charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-extrabold text-lp-cta-bg">{apt.clientName || "Patient"}</h4>
                                                                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none font-black text-[10px] uppercase">{apt.appointmentType}</Badge>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1 pl-12 text-sm">
                                                            <p className="text-lp-cta-bg font-black">{mounted ? new Date(apt.startTime).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : ''}</p>
                                                            <p className="text-lp-on-surface-variant font-bold uppercase text-[10px] tracking-widest">{apt.status}</p>
                                                        </div>
                                                    </div>
                                                    {apt.status === "scheduled" && (
                                                        <Button
                                                            size="sm"
                                                            className="rounded-lg sm:rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 shadow-md font-bold"
                                                            onClick={() => handleUpdateAppointmentStatus(apt.id, "completed")}
                                                        >
                                                            Mark Done
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="payments" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border border-lp-outline-variant/20 shadow-xl bg-lp-surface-container-lowest/80 backdrop-blur-md rounded-lg sm:rounded-2xl overflow-hidden">
                        <CardHeader className="pt-4">
                            <CardTitle>Financial Overview</CardTitle>
                            <CardDescription>Track your transaction history and upcoming payouts</CardDescription>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            {isLoadingPayments ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-16 sm:py-24 bg-lp-surface-container-low/50 rounded-lg sm:rounded-2xl">
                                    <IndianRupee className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-lp-on-surface-variant font-bold">No payments processed yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="group flex w-full min-w-0 max-w-full flex-col overflow-hidden md:flex-row md:items-center justify-between p-4 sm:p-6 bg-white border border-lp-outline-variant/30 rounded-xl sm:rounded-3xl hover:shadow-2xl transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`p-4 rounded-lg sm:rounded-2xl ${payment.status === "completed" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
                                                    <IndianRupee className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <p className="text-3xl font-black text-lp-cta-bg tracking-tight">₹{(payment.amount / 100).toFixed(2)}</p>
                                                    <p className="text-sm font-bold text-lp-on-surface-variant uppercase tracking-widest">
                                                        {mounted ? new Date(payment.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex flex-wrap items-center gap-3 md:mt-0 md:gap-6">
                                                <div className="text-left md:text-right">
                                                    <p className="text-sm font-black text-lp-cta-bg">{payment.clientName || "Direct Payment"}</p>
                                                    <p className="text-xs font-bold text-lp-on-surface-variant capitalize">{payment.paymentMethod}</p>
                                                </div>
                                                <Badge className={`rounded-xl px-4 py-1 font-black ${payment.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                    }`}>
                                                    {payment.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="clients" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border border-lp-outline-variant/20 shadow-xl bg-lp-surface-container-lowest/80 backdrop-blur-md rounded-lg sm:rounded-2xl">
                        <CardHeader className="pt-4">
                            <CardTitle>Client Records</CardTitle>
                            <CardDescription>Comprehensive database of clients you have consulted with</CardDescription>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            {isLoadingAppointments || isLoadingGuestBookings ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : guestAppointments.length === 0 && [...new Set(appointments.map((a) => a.clientId))].length === 0 ? (
                                <div className="text-center py-16 sm:py-24 bg-lp-surface-container-low/50 rounded-lg sm:rounded-2xl">
                                    <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-lp-on-surface-variant font-bold">Your client list is currently empty.</p>
                                </div>
                            ) : (
                                <div className="grid min-w-0 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {guestAppointments.map((g) => (
                                        <div
                                            key={`guest-${g.id}`}
                                            className="group w-full min-w-0 max-w-full overflow-hidden p-4 bg-white border border-indigo-100 rounded-xl sm:rounded-3xl hover:shadow-2xl hover:bg-indigo-50/30 transition-all duration-500"
                                        >
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-14 rounded-lg sm:rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center font-black text-indigo-700 text-xl shadow-inner">
                                                        {(g.firstName || "G").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="overflow-hidden min-w-0">
                                                        <Badge className="mb-1 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 border-0">Guest</Badge>
                                                        <h4 className="font-black text-lp-cta-bg truncate text-lg">
                                                            {`${g.firstName} ${g.lastName}`.trim() || "Guest"}
                                                        </h4>
                                                        <p className="text-xs font-bold text-lp-on-surface-variant truncate mt-0.5">
                                                            Guest booking
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-center pt-2">
                                                    <div className="bg-white/80 p-3 rounded-lg sm:rounded-2xl border border-lp-outline-variant/30 shadow-sm">
                                                        <p className="text-[10px] font-black uppercase text-lp-on-surface-variant tracking-tighter">Requested</p>
                                                        <p className="text-xs font-black text-slate-800 pt-1">
                                                            {mounted
                                                                ? new Date(`${g.appointmentDate}T${(g.appointmentTime || "00:00").slice(0, 5)}:00`).toLocaleDateString("en-US", {
                                                                      month: "short",
                                                                      day: "numeric",
                                                                      year: "numeric",
                                                                  })
                                                                : ""}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white/80 p-3 rounded-lg sm:rounded-2xl border border-lp-outline-variant/30 shadow-sm">
                                                        <p className="text-[10px] font-black uppercase text-lp-on-surface-variant tracking-tighter">Category</p>
                                                        <p className="text-xs font-black text-lp-brand pt-1 truncate">{g.category}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {[...new Set(appointments.map((a) => a.clientId))].map((clientId) => {
                                        const clientAppointments = appointments.filter((a) => a.clientId === clientId);
                                        const latestAppointment = clientAppointments[0];
                                        return (
                                            <div
                                                key={clientId}
                                                className="group w-full min-w-0 max-w-full overflow-hidden p-4 sm:p-6 bg-white border border-slate-50 rounded-xl sm:rounded-3xl hover:shadow-2xl hover:bg-lp-surface-container-low/50 transition-all duration-500"
                                            >
                                                <div className="flex flex-col gap-5">
                                                    <div className="p-4 sm:p-5 flex items-center gap-4">
                                                        <div className="h-14 w-14 rounded-lg sm:rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-lp-on-surface-variant text-xl shadow-inner">
                                                            {(latestAppointment.clientName || "C").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <h4 className="font-black text-lp-cta-bg truncate text-lg">{latestAppointment.clientName || "Healthcare Client"}</h4>
                                                            {latestAppointment.clientEmail && (
                                                                <p className="text-xs font-bold text-lp-on-surface-variant truncate flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" /> {latestAppointment.clientEmail}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-center pt-2">
                                                        <div className="bg-white/80 p-3 rounded-lg sm:rounded-2xl border border-lp-outline-variant/30 shadow-sm">
                                                            <p className="text-[10px] font-black uppercase text-lp-on-surface-variant tracking-tighter">Total Visits</p>
                                                            <p className="text-xl font-black text-lp-brand">{clientAppointments.length}</p>
                                                        </div>
                                                        <div className="bg-white/80 p-3 rounded-lg sm:rounded-2xl border border-lp-outline-variant/30 shadow-sm">
                                                            <p className="text-[10px] font-black uppercase text-lp-on-surface-variant tracking-tighter">Last Seen</p>
                                                            <p className="text-xs font-black text-slate-800 pt-1">
                                                                {mounted ? new Date(latestAppointment.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Button variant="outline" className="w-full rounded-lg sm:rounded-2xl border-lp-outline-variant/30 bg-white font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all group-hover:shadow-md">
                                                        Open Full History
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <nav className={dashboardMobileNav}>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { value: "profile", label: "Profile", icon: User },
                        { value: "credentials", label: "Creds", icon: GraduationCap },
                        { value: "consultations", label: "Requests", icon: MessageSquare },
                        { value: "calendar", label: "Calendar", icon: CalendarIcon },
                        { value: "payments", label: "Payments", icon: IndianRupee },
                        { value: "clients", label: "Clients", icon: Users },
                    ].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.value;

                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setActiveTab(item.value)}
                                className={`flex min-w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold transition-all ${isActive ? dashboardMobileNavActive : dashboardMobileNavInactive}`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="max-w-[4.5rem] truncate">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            <div className="mt-16 space-y-8 pb-20">
                <Separator className="bg-slate-200" />
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--color-primary)] text-white rounded-xl shadow-lg shadow-indigo-200">
                        <CalendarIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-lp-cta-bg">Pictorial Schedule</h2>
                        <p className="text-lp-on-surface-variant font-bold text-sm">A visual overview of your recurring and date-specific time</p>
                    </div>
                </div>

                <Card className="border-none shadow-2xl bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-3xl overflow-hidden">
                    <CardHeader className="pt-4 bg-white/80 border-b border-slate-50">
                        <CardTitle>Schedule Visualization</CardTitle>
                        <CardDescription>Green indicates recurring availability, Blue represents specific day appointments.</CardDescription>
                    </CardHeader>
                    <CardContent className="min-w-0 overflow-hidden p-4 sm:p-8">
                        <div className="grid min-w-0 grid-cols-1 gap-6 sm:gap-12 lg:grid-cols-3">
                            <div className="lg:col-span-1 flex justify-center p-5 sm:p-8 border-none rounded-xl sm:rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100">
                                {mounted ? (
                                    <Calendar
                                        mode="single"
                                        className="p-3 border-none"
                                        modifiers={{
                                            available: (date) => availability.some(slot => slot.dayOfWeek === date.getDay()),
                                            appointment: (date) => appointments.some(apt => {
                                                const aptDate = new Date(apt.startTime);
                                                return (
                                                    aptDate.getDate() === date.getDate() &&
                                                    aptDate.getMonth() === date.getMonth() &&
                                                    aptDate.getFullYear() === date.getFullYear()
                                                );
                                            })
                                        }}
                                        modifiersClassNames={{
                                            available: "bg-green-50 text-green-700 font-black border-b-4 border-green-500 rounded-none hover:bg-green-100",
                                            appointment: "bg-indigo-600 text-white font-black ring-4 ring-indigo-100 rounded-xl hover:bg-indigo-700"
                                        }}
                                    />
                                ) : (
                                    <div className="h-[350px] w-full flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-2 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50/30 p-5 sm:p-6 rounded-xl sm:rounded-3xl border border-green-100 shadow-sm">
                                        <h4 className="text-green-800 font-black flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
                                            <CheckCircle className="h-4 w-4" /> Weekly Slots
                                        </h4>
                                        <div className="space-y-3">
                                            {DAYS_OF_WEEK.map((day, idx) => {
                                                const daySlots = availability.filter(s => s.dayOfWeek === idx);
                                                if (daySlots.length === 0) return null;
                                                return (
                                                    <div key={idx} className="text-xs flex justify-between items-center bg-white/60 p-2.5 rounded-xl border border-green-100">
                                                        <span className="font-extrabold text-lp-cta-bg">{day}</span>
                                                        <span className="text-emerald-700 font-black">{daySlots.map(s => `${s.startTime}-${s.endTime}`).join(", ")}</span>
                                                    </div>
                                                );
                                            })}
                                            {availability.length === 0 && <p className="text-xs text-lp-on-surface-variant italic">Configure your weekly hours in the Calendar tab.</p>}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50/30 p-5 sm:p-6 rounded-xl sm:rounded-3xl border border-indigo-100 shadow-sm">
                                        <h4 className="text-indigo-800 font-black flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
                                            <Info className="h-4 w-4" /> Schedule Legend
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-xs bg-white/60 p-3 rounded-lg sm:rounded-2xl">
                                                <div className="w-4 h-4 bg-green-50 border-b-4 border-green-500 rounded-sm" />
                                                <span className="font-bold text-slate-700">Days with recurring availability set</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs bg-white/60 p-3 rounded-lg sm:rounded-2xl">
                                                <div className="w-4 h-4 bg-indigo-600 rounded-lg shadow-sm" />
                                                <span className="font-bold text-slate-700">Specific dates with scheduled clients</span>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 text-[10px] leading-relaxed text-lp-on-surface-variant bg-lp-surface-container-low/40 rounded-lg sm:rounded-2xl mt-2">
                                                <Info className="h-4 w-4 flex-shrink-0" />
                                                <span>Note: Appointment dates are highlighted in solid blue and take priority over recurring availability in the calendar view.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-900 text-indigo-100 p-5 sm:p-8 rounded-xl sm:rounded-3xl shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className="bg-white/10 p-2 rounded-xl">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white mb-2">Practice Optimisation</h4>
                                            <ul className="text-xs space-y-3 font-medium opacity-80">
                                                <li className="flex items-center gap-2">
                                                    <div className="h-1 w-1 bg-white rounded-full" /> Weekly slots recur indefinitely for your listed specialties.
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className="h-1 w-1 bg-white rounded-full" /> Use the "Calendar" tab to update or cancel specific hours.
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className="h-1 w-1 bg-white rounded-full" /> Keep your consultation fee updated for transparency.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
