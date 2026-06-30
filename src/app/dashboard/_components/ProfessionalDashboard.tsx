"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import {
    updateProfessionalProfile,
    addQualification,
    deleteQualification,
    getMyQualificationsSanitized,
    reuploadQualificationDocument,
    updateConsultationRequestStatus,
    saveGuestPrescription,
    type ProfessionalGuestBooking,
} from "@/features/professional/actions";
import { uploadProfileImage } from "@/features/profile/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardSectionContext } from "./dashboard-section-context";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Info,
    Upload,
} from "lucide-react";
import { ProfessionalScheduleCalendar } from "./ProfessionalScheduleCalendar";
import { ProfessionalAvailabilityPanel } from "./ProfessionalAvailabilityPanel";
import { ProfessionalDashboardHomeAside } from "./ProfessionalDashboardHomeAside";
import { ProfessionalProfilePanel } from "./ProfessionalProfilePanel";
import { QualificationInstitutionInput } from "./QualificationInstitutionInput";
import { ConsultationRequestsGroupedList } from "./ConsultationRequestsGroupedList";
import { ProfessionalCredentialsList } from "./ProfessionalCredentialsList";
import { ProfessionalPaymentsList } from "./ProfessionalPaymentsList";
import { ProfessionalClientsList } from "./ProfessionalClientsList";
import {
    DEFAULT_PHONE_COUNTRY_CODE,
    normalizePhoneCountryCode,
} from "@/lib/phone-country-options";
import { cn } from "@/lib/utils";
import {
    dashboardPrimaryButton,
    dashboardStatCard,
    dashboardStatIconWrap,
    dashboardStatLabel,
    dashboardStatValue,
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
    const [reuploadingQualId, setReuploadingQualId] = useState<string | null>(null);
    const profileImageInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<Partial<ProfessionalProfile>>(initialData?.profile || {});
    const { activeSection } = useDashboardSectionContext();
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
                        meetingDurationMinutes: g.meeting_duration_minutes,
                        meetingEndTime: g.meeting_end_time,
                        calendarInviteUrl: g.calendar_invite_url || null,
                        meetingTitle: g.meeting_title || null,
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

    const handleReuploadQualification = async (id: string, file: File) => {
        setReuploadingQualId(id);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const result = await reuploadQualificationDocument(id, formData);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Document re-uploaded. Status reset to in review.");
            fetchQualifications();
        } catch (error: any) {
            toast.error(error.message || "Failed to re-upload document");
        } finally {
            setReuploadingQualId(null);
        }
    };

    const totalEarnings = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

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

    return (
        <div className="min-w-0">
            {activeSection === "home" ? (
            <>
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

            <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
                <ProfessionalScheduleCalendar
                    appointments={appointments}
                    guestAppointments={guestAppointments}
                    availability={availability}
                    mounted={mounted}
                    isLoading={isLoadingAppointments || isLoadingGuestBookings || isLoadingAvail}
                    className="min-w-0"
                />
                <ProfessionalDashboardHomeAside
                    appointments={appointments}
                    guestAppointments={guestAppointments}
                    payments={payments}
                    mounted={mounted}
                    isLoading={isLoadingAppointments || isLoadingGuestBookings || isLoadingPayments}
                />
            </div>
            </>
            ) : null}

            <div className="space-y-6">

                {activeSection === "profile" ? (
                <ProfessionalProfilePanel
                    user={user}
                    profile={profile}
                    profileForm={profileForm}
                    setProfileForm={setProfileForm}
                    isEditingProfile={isEditingProfile}
                    setIsEditingProfile={setIsEditingProfile}
                    isLoadingProfile={isLoadingProfile}
                    isSaving={isSaving}
                    isUploadingImage={isUploadingImage}
                    profileImageInputRef={profileImageInputRef}
                    onProfileImageUpload={handleProfileImageUpload}
                    onSaveProfile={handleSaveProfile}
                    onCancelEdit={() => {
                        setIsEditingProfile(false);
                        setProfileForm(profile || {});
                    }}
                    isSpecializationOpen={isSpecializationOpen}
                    setIsSpecializationOpen={setIsSpecializationOpen}
                />
                ) : null}

                {activeSection === "credentials" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border border-lp-outline-variant/20 shadow-xl bg-lp-surface-container-lowest/80 backdrop-blur-md rounded-lg sm:rounded-2xl overflow-hidden">
                        <CardHeader className="pt-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <CardTitle>Qualifications & Licenses</CardTitle>
                                    <CardDescription>
                                        Manage degrees and certifications — view institution, year, and verification status.
                                    </CardDescription>
                                </div>
                                <Dialog open={showAddQualification} onOpenChange={setShowAddQualification}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className={cn("w-full rounded-xl px-5 sm:w-auto", dashboardPrimaryButton)}>
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
                                            <Button onClick={handleAddQual} className={cn("h-12 w-full text-lg font-bold", dashboardPrimaryButton)} disabled={isSaving}>
                                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                                Verify & Add Credential
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            <ProfessionalCredentialsList
                                qualifications={qualifications}
                                isLoading={isLoadingQuals}
                                reuploadingId={reuploadingQualId}
                                onDelete={handleDeleteQualification}
                                onReupload={handleReuploadQualification}
                                onAddClick={() => setShowAddQualification(true)}
                            />
                        </CardContent>
                    </Card>
                </div>
                ) : null}

                {activeSection === "consultations" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border border-lp-outline-variant/20 shadow-xl bg-lp-surface-container-lowest/80 backdrop-blur-md rounded-lg sm:rounded-2xl">
                        <CardHeader className="pt-4">
                            <CardTitle>Consultation Requests</CardTitle>
                            <CardDescription>
                                Grouped by client email — expand a row to view date, category, address, time, message, and prescribe.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            <ConsultationRequestsGroupedList
                                guestAppointments={guestAppointments}
                                consultationRequests={consultationRequests}
                                mounted={mounted}
                                isLoading={isLoadingRequests || isLoadingGuestBookings}
                                onPrescribe={openPrescriptionModal}
                                onUpdateRequestStatus={handleUpdateRequestStatus}
                            />
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
                </div>
                ) : null}

                {activeSection === "calendar" ? (
                <ProfessionalAvailabilityPanel
                    availability={availability}
                    isLoading={isLoadingAvail}
                    onChanged={fetchAvailability}
                />
                ) : null}

                {activeSection === "payments" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border border-lp-outline-variant/20 shadow-xl bg-lp-surface-container-lowest/80 backdrop-blur-md rounded-lg sm:rounded-2xl overflow-hidden">
                        <CardHeader className="pt-4">
                            <CardTitle>Financial Overview</CardTitle>
                            <CardDescription>Track your transaction history and payout status</CardDescription>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            <ProfessionalPaymentsList
                                payments={payments}
                                isLoading={isLoadingPayments}
                                mounted={mounted}
                            />
                        </CardContent>
                    </Card>
                </div>
                ) : null}

                {activeSection === "clients" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border border-lp-outline-variant/20 shadow-xl bg-lp-surface-container-lowest/80 backdrop-blur-md rounded-lg sm:rounded-2xl overflow-hidden">
                        <CardHeader className="pt-4">
                            <CardTitle>Client Records</CardTitle>
                            <CardDescription>
                                Registered patients and guest bookings you have consulted with
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            <ProfessionalClientsList
                                appointments={appointments}
                                guestAppointments={guestAppointments}
                                isLoading={isLoadingAppointments || isLoadingGuestBookings}
                                mounted={mounted}
                            />
                        </CardContent>
                    </Card>
                </div>
                ) : null}
            </div>
        </div>
    );
}
