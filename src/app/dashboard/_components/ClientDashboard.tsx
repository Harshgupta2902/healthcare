"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchGuestAppointmentProfessionalMeta } from "@/lib/guest-appointment-professional-meta";
import {
    attachPrescriptionPdfStylesToHead,
    buildPrescriptionPdfDocumentHtml,
    buildQualificationLine,
    detachPrescriptionPdfStyles,
    attachPrescriptionPdfLoadingMask,
    detachPrescriptionPdfLoadingMask,
    flushPrescriptionPdfShellLayout,
    formatDoctorDisplayName,
    importPrescriptionPdfShellFromHtml,
    openPrescriptionPdfBlobInNewTab,
    preparePrescriptionPdfShellForRaster,
    rasterizePrescriptionShellToPdfBlobUrl,
    removeJspdfHtmlOverlaysFromBody,
    stripPrescriptionBodyForPdfEngine,
} from "@/lib/prescription-pdf-html";
import {
    updateMedicalProfile,
    addMedicalCondition,
    deleteMedicalCondition,
    addMedication,
    deleteMedication,
    addMedicalDocument,
    deleteMedicalDocument,
    addInsurance,
    deleteInsurance
} from "@/features/client/actions";
import { uploadProfileImage } from "@/features/profile/actions";
import { PhoneCountryFields } from "@/components/PhoneCountryFields";
import {
    DEFAULT_PHONE_COUNTRY_CODE,
    getPhoneCountryOptionByIso2,
    normalizePhoneCountryCode,
    resolveCountryIsoFromDialCode,
} from "@/lib/phone-country-options";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardSectionContext } from "./dashboard-section-context";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    User,
    Heart,
    Pill,
    FileText,
    Upload,
    Loader2,
    Edit,
    Plus,
    Trash2,
    Calendar,
    Phone,
    MapPin,
    AlertCircle,
    Save,
    Camera,
    Shield,
    Activity,
    Stethoscope,
    ExternalLink,
    ShieldCheck,
    IndianRupee,
} from "lucide-react";
import { ClientOrdersSection } from "./sections/client";
import { ClientScheduleCalendar } from "./ClientScheduleCalendar";
import { ClientMedicalHistoryList } from "./ClientMedicalHistoryList";
import { ClientMedicationsList } from "./ClientMedicationsList";
import { ClientDocumentsList } from "./ClientDocumentsList";
import { ClientInsuranceList } from "./ClientInsuranceList";
import { ClientAppointmentsList } from "./ClientAppointmentsList";
import type { ClientOrderHistoryItem } from "@/features/booking-orders/types";
import {
    dashboardGlassCard,
    dashboardGlassCardLg,
    dashboardPrimaryButton,
    dashboardProfileBanner,
    dashboardStatCard,
    dashboardStatIconWrap,
    dashboardStatLabel,
    dashboardStatValue,
} from "./dashboard-theme";

interface UserProfile {
    id: string;
    userId: string;
    phone: string | null;
    phoneCountryCode: string;
    /** Client-only; disambiguates shared dials (e.g. +1) until ISO is stored in DB. */
    phoneCountryIso?: string;
    dateOfBirth: string | null;
    gender: string | null;
    bloodType: string | null;
    height: number | null;
    weight: number | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    emergencyContactRelationship: string | null;
    profilePhotoUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

interface MedicalHistory {
    id: string;
    userId: string;
    conditionName: string;
    diagnosisDate: string | null;
    status: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

interface Medication {
    id: string;
    userId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string | null;
    prescribingDoctor: string | null;
    notes: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface MedicalDocument {
    id: string;
    userId: string;
    documentName: string;
    documentType: string;
    fileUrl: string;
    fileSize: number | null;
    uploadDate: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

interface Insurance {
    id: string;
    userId: string;
    providerName: string;
    policyNumber: string;
    groupNumber: string | null;
    policyHolderName: string;
    relationshipToHolder: string | null;
    expirationDate: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

interface Appointment {
    id: string;
    professionalId: string | null;
    firstName: string;
    lastName: string;
    age: number;
    phone: string;
    email: string;
    category: string;
    state: string;
    city: string;
    appointmentDate: string;
    appointmentTime: string;
    meetingDurationMinutes?: number | null;
    meetingEndTime?: string | null;
    message: string | null;
    calendarInviteUrl: string | null;
    prescriptionHtml: string | null;
    prescriptionUpdatedAt: string | null;
    professionalName: string | null;
    professionalEmail: string | null;
    professionalSpecialization: string | null;
    professionalQualificationsSummary: string | null;
    createdAt: string;
}

function formatPatientDetailValue(value: string | null | undefined) {
    return (value || "")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ClientDashboard({ initialData }: { initialData: any }) {
    const user = initialData?.user;
    const router = useRouter();
    const supabase = createClient();

    const [profile, setProfile] = useState<UserProfile | null>(initialData?.profile || null);
    const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>(initialData?.medicalHistory || []);
    const [medications, setMedications] = useState<Medication[]>(initialData?.medications || []);
    const [documents, setDocuments] = useState<MedicalDocument[]>(initialData?.documents || []);
    const [insuranceData, setInsuranceData] = useState<Insurance[]>(initialData?.insurance || []);
    const [appointments, setAppointments] = useState<Appointment[]>(initialData?.appointments || []);
    const [orders] = useState<ClientOrderHistoryItem[]>(initialData?.orders || []);

    const [isLoadingProfile, setIsLoadingProfile] = useState(!initialData?.profile);
    const [isLoadingHistory, setIsLoadingHistory] = useState(!initialData?.medicalHistory);
    const [isLoadingMeds, setIsLoadingMeds] = useState(!initialData?.medications);
    const [isLoadingDocs, setIsLoadingDocs] = useState(!initialData?.documents);
    const [isLoadingInsurance, setIsLoadingInsurance] = useState(!initialData?.insurance);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(!initialData?.appointments);
    const [isLoadingOrders] = useState(!initialData?.orders);
    const [isSaving, setIsSaving] = useState(false);
    const [prescriptionPdfLoadingAppointmentId, setPrescriptionPdfLoadingAppointmentId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const documentInputRef = useRef<HTMLInputElement>(null);
    const profileImageInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<Partial<UserProfile>>(initialData?.profile || {});
    const { activeSection } = useDashboardSectionContext();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (initialData?.dashboardError) {
            toast.error(initialData.dashboardError);
            setIsLoadingProfile(false);
            setIsLoadingHistory(false);
            setIsLoadingMeds(false);
            setIsLoadingDocs(false);
            setIsLoadingInsurance(false);
            setIsLoadingAppointments(false);
        }
    }, [initialData?.dashboardError]);

    const [showAddCondition, setShowAddCondition] = useState(false);
    const [showAddMedication, setShowAddMedication] = useState(false);
    const [showAddDocument, setShowAddDocument] = useState(false);
    const [showAddInsurance, setShowAddInsurance] = useState(false);

    const [conditionForm, setConditionForm] = useState({
        conditionName: "",
        diagnosisDate: "",
        status: "active",
        notes: ""
    });

    const [medicationForm, setMedicationForm] = useState({
        medicationName: "",
        dosage: "",
        frequency: "",
        startDate: "",
        endDate: "",
        prescribingDoctor: "",
        notes: "",
        isActive: true
    });

    const [documentForm, setDocumentForm] = useState({
        documentName: "",
        documentType: "report",
        fileUrl: "",
        fileSize: 0,
        uploadDate: new Date().toISOString().split('T')[0],
        notes: ""
    });

    const [insuranceForm, setInsuranceForm] = useState({
        providerName: "",
        policyNumber: "",
        groupNumber: "",
        policyHolderName: "",
        relationshipToHolder: "",
        expirationDate: "",
        notes: ""
    });

    useEffect(() => {
        if (!initialData && user) {
            fetchProfile();
            fetchMedicalHistory();
            fetchMedications();
            fetchDocuments();
            fetchInsurance();
            fetchAppointments();
        }
    }, [initialData, user]);

    const fetchProfile = async () => {
        try {
            const { data: coreProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            const { data: medProfile } = await supabase
                .from('client_medical_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (coreProfile || medProfile) {
                const dial =
                    normalizePhoneCountryCode(
                        (coreProfile as { phone_country_code?: string | null })?.phone_country_code
                    ) ?? DEFAULT_PHONE_COUNTRY_CODE;
                const merged: UserProfile = {
                    id: user.id,
                    userId: user.id,
                    phone: coreProfile?.phone || null,
                    phoneCountryCode: dial,
                    profilePhotoUrl: coreProfile?.image || null,
                    dateOfBirth: medProfile?.date_of_birth || null,
                    gender: medProfile?.gender || null,
                    bloodType: medProfile?.blood_type || null,
                    height: medProfile?.height ? parseFloat(medProfile.height) : null,
                    weight: medProfile?.weight ? parseFloat(medProfile.weight) : null,
                    address: medProfile?.address || null,
                    city: medProfile?.city || null,
                    state: medProfile?.state || null,
                    postalCode: medProfile?.postal_code || null,
                    emergencyContactName: medProfile?.emergency_contact_name || null,
                    emergencyContactPhone: medProfile?.emergency_contact_phone || null,
                    emergencyContactRelationship: medProfile?.emergency_contact_relationship || null,
                    createdAt: coreProfile?.created_at || "",
                    updatedAt: coreProfile?.updated_at || ""
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

    const fetchMedicalHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('medical_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setMedicalHistory(data.map(item => ({
                    id: item.id,
                    userId: item.user_id,
                    conditionName: item.condition_name,
                    diagnosisDate: item.diagnosis_date,
                    status: item.status,
                    notes: item.notes,
                    createdAt: item.created_at,
                    updatedAt: item.updated_at
                })));
            }
        } catch (error) {
            console.error("Error fetching medical history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const fetchMedications = async () => {
        try {
            const { data, error } = await supabase
                .from('medications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setMedications(data.map(item => ({
                    id: item.id,
                    userId: item.user_id,
                    medicationName: item.medication_name,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    startDate: item.start_date,
                    endDate: item.end_date,
                    prescribingDoctor: item.prescribing_doctor,
                    notes: item.notes,
                    isActive: item.is_active,
                    createdAt: item.created_at,
                    updatedAt: item.updated_at
                })));
            }
        } catch (error) {
            console.error("Error fetching medications:", error);
        } finally {
            setIsLoadingMeds(false);
        }
    };

    const fetchDocuments = async () => {
        try {
            const { data, error } = await supabase
                .from('medical_documents')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setDocuments(data.map(item => ({
                    id: item.id,
                    userId: item.user_id,
                    documentName: item.document_name,
                    documentType: item.document_type,
                    fileUrl: item.file_url,
                    fileSize: item.file_size,
                    uploadDate: item.upload_date,
                    notes: item.notes,
                    createdAt: item.created_at,
                    updatedAt: item.updated_at
                })));
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setIsLoadingDocs(false);
        }
    };

    const fetchInsurance = async () => {
        try {
            const { data, error } = await supabase
                .from('insurance')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setInsuranceData(data.map(item => ({
                    id: item.id,
                    userId: item.user_id,
                    providerName: item.provider_name,
                    policyNumber: item.policy_number,
                    groupNumber: item.group_number,
                    policyHolderName: item.policy_holder_name,
                    relationshipToHolder: item.relationship_to_holder,
                    expirationDate: item.expiration_date,
                    notes: item.notes,
                    createdAt: item.created_at,
                    updatedAt: item.updated_at
                })));
            }
        } catch (error) {
            console.error("Error fetching insurance:", error);
        } finally {
            setIsLoadingInsurance(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const { data, error } = await supabase
                .from('guest_appointments')
                .select('*')
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true });
            if (error) {
                console.error('Error fetching guest appointments:', error);
            }

            if (data) {
                const professionalIds = Array.from(
                    new Set(
                        data
                            .map((apt: any) => apt.professional_id)
                            .filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
                    )
                );
                const professionalMeta = await fetchGuestAppointmentProfessionalMeta(supabase, professionalIds);

                setAppointments(
                    data.map((apt: any) => {
                        const meta = apt.professional_id ? professionalMeta[apt.professional_id] : undefined;
                        return {
                            id: apt.id,
                            professionalId: apt.professional_id || null,
                            firstName: apt.first_name,
                            lastName: apt.last_name,
                            age: apt.age,
                            phone: apt.phone,
                            email: apt.email,
                            category: apt.category,
                            state: apt.state,
                            city: apt.city,
                            appointmentDate: apt.appointment_date,
                            appointmentTime: apt.appointment_time,
                            meetingDurationMinutes: apt.meeting_duration_minutes ?? null,
                            meetingEndTime: apt.meeting_end_time ?? null,
                            message: apt.message,
                            calendarInviteUrl: apt.calendar_invite_url || null,
                            prescriptionHtml: apt.prescription_html || null,
                            prescriptionUpdatedAt: apt.prescription_updated_at || null,
                            professionalName: meta?.name ?? null,
                            professionalEmail: meta?.email ?? null,
                            professionalSpecialization: meta?.specialization ?? null,
                            professionalQualificationsSummary: meta?.qualificationsSummary ?? null,
                            createdAt: apt.created_at,
                        };
                    })
                );
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setIsLoadingAppointments(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const result = await updateMedicalProfile(profileForm);
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

    const handleAddCondition = async () => {
        if (!conditionForm.conditionName.trim()) {
            toast.error("Please enter a condition name");
            return;
        }
        setIsSaving(true);
        try {
            const result = await addMedicalCondition(conditionForm);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Condition added successfully");
            setShowAddCondition(false);
            setConditionForm({ conditionName: "", diagnosisDate: "", status: "active", notes: "" });
            fetchMedicalHistory();
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddMedication = async () => {
        if (!medicationForm.medicationName.trim() || !medicationForm.dosage.trim() ||
            !medicationForm.frequency.trim() || !medicationForm.startDate) {
            toast.error("Please fill in all required fields");
            return;
        }
        setIsSaving(true);
        try {
            const result = await addMedication(medicationForm);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Medication added successfully");
            setShowAddMedication(false);
            setMedicationForm({
                medicationName: "",
                dosage: "",
                frequency: "",
                startDate: "",
                endDate: "",
                prescribingDoctor: "",
                notes: "",
                isActive: true
            });
            fetchMedications();
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddDocument = async () => {
        if (!documentForm.documentName.trim() || !selectedFile) {
            toast.error("Please enter document name and select a file");
            return;
        }
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('documentName', documentForm.documentName);
            formData.append('documentType', documentForm.documentType);
            formData.append('notes', documentForm.notes);

            const docResult = await addMedicalDocument(formData);
            if (!docResult.success) {
                toast.error(docResult.error);
                return;
            }
            toast.success("Document added successfully");
            setShowAddDocument(false);
            setDocumentForm({
                documentName: "",
                documentType: "report",
                fileUrl: "",
                fileSize: 0,
                uploadDate: new Date().toISOString().split('T')[0],
                notes: ""
            });
            setSelectedFile(null);
            fetchDocuments();
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddInsurance = async () => {
        if (!insuranceForm.providerName.trim() || !insuranceForm.policyNumber.trim() ||
            !insuranceForm.policyHolderName.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }
        setIsSaving(true);
        try {
            const result = await addInsurance(insuranceForm);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Insurance added successfully");
            setShowAddInsurance(false);
            setInsuranceForm({
                providerName: "",
                policyNumber: "",
                groupNumber: "",
                policyHolderName: "",
                relationshipToHolder: "",
                expirationDate: "",
                notes: ""
            });
            fetchInsurance();
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCondition = async (id: string) => {
        try {
            const result = await deleteMedicalCondition(id);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Condition deleted");
            fetchMedicalHistory();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete condition");
        }
    };

    const handleDeleteMedication = async (id: string) => {
        try {
            const result = await deleteMedication(id);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Medication deleted");
            fetchMedications();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete medication");
        }
    };

    const handleDeleteDocument = async (id: string) => {
        try {
            const result = await deleteMedicalDocument(id);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Document deleted");
            fetchDocuments();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete document");
        }
    };

    const handleDeleteInsurance = async (id: string) => {
        try {
            const result = await deleteInsurance(id);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Insurance deleted");
            fetchInsurance();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete insurance");
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

    const handleViewPrescriptionPdf = async (appointment: Appointment) => {
        if (!appointment.prescriptionHtml) {
            toast.error("Prescription not available yet.");
            return;
        }
        const doctorName = formatDoctorDisplayName(appointment.professionalName);
        const qualificationLine = buildQualificationLine(
            appointment.professionalSpecialization,
            appointment.professionalQualificationsSummary
        );
        const patientFullName = `${appointment.firstName} ${appointment.lastName}`.trim();
        const issueDateDisplay = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
        const fullHtml = buildPrescriptionPdfDocumentHtml({
            prescriptionHtml: appointment.prescriptionHtml,
            doctorDisplayName: doctorName,
            qualificationLine,
            patientFullName,
            issueDateDisplay,
            patientAge: appointment.age,
            patientSex: formatPatientDetailValue(profile?.gender),
            patientBloodGroup: profile?.bloodType || "",
            patientWeight: profile?.weight != null ? `${profile.weight} kg` : "",
            patientHeight: profile?.height != null ? `${profile.height} cm` : "",
            diagnosisCategory: appointment.category?.trim() || "—",
        });

        setPrescriptionPdfLoadingAppointmentId(appointment.id);

        // html2canvas on the live shell (not jsPDF doc.html overlay) avoids blank leading pages + header shift.
        let headStyle: HTMLStyleElement | null = null;
        let shell: HTMLElement | null = null;
        let loadingMask: HTMLDivElement | null = null;
        try {
            headStyle = attachPrescriptionPdfStylesToHead();
            shell = importPrescriptionPdfShellFromHtml(fullHtml);
            preparePrescriptionPdfShellForRaster(shell);
            document.body.appendChild(shell);
            loadingMask = attachPrescriptionPdfLoadingMask();
            stripPrescriptionBodyForPdfEngine(shell);
            void shell.offsetHeight;
            await flushPrescriptionPdfShellLayout();

            const url = await rasterizePrescriptionShellToPdfBlobUrl(shell);
            openPrescriptionPdfBlobInNewTab(url);
        } catch (error: any) {
            toast.error(error?.message || "Failed to render prescription PDF.");
        } finally {
            detachPrescriptionPdfLoadingMask(loadingMask);
            if (shell?.parentNode) {
                shell.parentNode.removeChild(shell);
            }
            detachPrescriptionPdfStyles(headStyle);
            removeJspdfHtmlOverlaysFromBody();
            setPrescriptionPdfLoadingAppointmentId(null);
        }
    };

    return (
        <div className="min-w-0">
            {activeSection === "home" ? (
            <>
            <div className="mb-8 grid grid-cols-2 gap-3 sm:mb-10 sm:gap-4 md:gap-6 lg:grid-cols-4">
                <Card className={dashboardStatCard}>
                    <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                        <div className={dashboardStatIconWrap}>
                            <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className={dashboardStatLabel}>Conditions</p>
                            <p className={dashboardStatValue}>{medicalHistory.filter(h => h.status === 'active').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className={dashboardStatCard}>
                    <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                        <div className={dashboardStatIconWrap}>
                            <Pill className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className={dashboardStatLabel}>Active Meds</p>
                            <p className={dashboardStatValue}>{medications.filter(m => m.isActive).length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className={dashboardStatCard}>
                    <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                        <div className={dashboardStatIconWrap}>
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className={dashboardStatLabel}>Documents</p>
                            <p className={dashboardStatValue}>{documents.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className={dashboardStatCard}>
                    <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                        <div className={dashboardStatIconWrap}>
                            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className={dashboardStatLabel}>Insurance</p>
                            <p className={dashboardStatValue}>{insuranceData.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ClientScheduleCalendar
                appointments={appointments}
                mounted={mounted}
                isLoading={isLoadingAppointments}
            />
            </>
            ) : null}

            <div className="space-y-6 sm:space-y-8">

                {activeSection === "profile" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
                        <Card className={`lg:col-span-1 h-fit ${dashboardGlassCardLg}`}>
                            <div className={dashboardProfileBanner} />
                            <CardContent className="relative pt-0 px-5 sm:px-8 pb-6 sm:pb-8">
                                <div className="flex justify-center -mt-12 mb-6">
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            ref={profileImageInputRef}
                                            onChange={handleProfileImageUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <Avatar
                                            className="h-24 w-24 ring-4 ring-white shadow-2xl relative overflow-hidden cursor-pointer"
                                            onClick={() => !isUploadingImage && profileImageInputRef.current?.click()}
                                        >
                                            <AvatarImage src={profileForm.profilePhotoUrl || undefined} className="object-cover" />
                                            <AvatarFallback className="bg-lp-brand text-lp-on-brand text-3xl font-bold">
                                                {(user.user_metadata?.name || user.email)?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                            {isUploadingImage ? (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <Camera className="h-6 w-6 text-white" />
                                                </div>
                                            )}
                                        </Avatar>
                                    </div>
                                </div>
                                <div className="text-center space-y-1 mb-8">
                                    <h3 className="truncate px-2 font-heading text-xl font-bold text-lp-cta-bg">{user.user_metadata?.name || "Patient"}</h3>
                                    <p className="break-all text-sm font-medium text-lp-on-surface-variant">{user.email}</p>
                                    <Badge variant="secondary" className="mt-2 border-lp-outline-variant/30 bg-lp-surface-container px-3 font-semibold text-lp-brand">Standard Account</Badge>
                                </div>
                                <Separator className="mb-6 bg-lp-outline-variant/30" />
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-lp-on-surface-variant font-bold uppercase tracking-tighter">Blood Type</span>
                                        <span className="font-black text-red-600">{profile?.bloodType || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-lp-on-surface-variant font-bold uppercase tracking-tighter">Gender</span>
                                        <span className="font-black text-lp-cta-bg capitalize">{profile?.gender || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-lp-on-surface-variant font-bold uppercase tracking-tighter">Weight</span>
                                        <span className="font-black text-lp-cta-bg">{profile?.weight ? `${profile.weight} kg` : "N/A"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-lp-on-surface-variant font-bold uppercase tracking-tighter">Height</span>
                                        <span className="font-black text-lp-cta-bg">{profile?.height ? `${profile.height} cm` : "N/A"}</span>
                                    </div>
                                </div>
                                <Button className={`mt-6 w-full sm:mt-8 ${dashboardPrimaryButton}`} onClick={() => setIsEditingProfile(true)}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className={`lg:col-span-2 ${dashboardGlassCardLg}`}>
                            <CardHeader className="border-b border-lp-outline-variant/20 pt-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <CardTitle className="text-xl font-black">Extended Medical Data</CardTitle>
                                        <CardDescription>Securely stored personal identifiers</CardDescription>
                                    </div>
                                    {isEditingProfile && (
                                        <div className="flex w-full gap-2 sm:w-auto">
                                            <Button onClick={() => setIsEditingProfile(false)} variant="outline" className="flex-1 rounded-full px-5 sm:flex-none sm:px-6">Cancel</Button>
                                            <Button onClick={handleSaveProfile} disabled={isSaving} className={`flex-1 rounded-full px-5 sm:flex-none sm:px-6 ${dashboardPrimaryButton}`}>
                                                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save Changes
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                                <div className="space-y-8">
                                    {/* Personal & Health Stats */}
                                    <div className="grid min-w-0 gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <Label className="text-xs font-black text-lp-brand uppercase tracking-widest">Personal Details</Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">Date of Birth</Label>
                                                    <Input
                                                        type="date"
                                                        max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
                                                        value={profileForm.dateOfBirth || ""}
                                                        onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                                                        disabled={!isEditingProfile}
                                                        className="rounded-xl border-lp-outline-variant/30"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">Gender</Label>
                                                    <Select
                                                        value={profileForm.gender || ""}
                                                        onValueChange={(v) => setProfileForm({ ...profileForm, gender: v })}
                                                        disabled={!isEditingProfile}
                                                    >
                                                        <SelectTrigger className="rounded-xl border-lp-outline-variant/30 h-10">
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-xs font-black text-lp-brand uppercase tracking-widest">Health Metrics</Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">Blood</Label>
                                                    <Select
                                                        value={profileForm.bloodType || ""}
                                                        onValueChange={(v) => setProfileForm({ ...profileForm, bloodType: v })}
                                                        disabled={!isEditingProfile}
                                                    >
                                                        <SelectTrigger className="rounded-xl border-lp-outline-variant/30 h-10 px-2">
                                                            <SelectValue placeholder="Type" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => (
                                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">Height(cm)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="175"
                                                        value={profileForm.height || ""}
                                                        onChange={(e) => setProfileForm({ ...profileForm, height: parseFloat(e.target.value) || null })}
                                                        disabled={!isEditingProfile}
                                                        className="rounded-xl border-lp-outline-variant/30 h-10"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">Weight(kg)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="70"
                                                        value={profileForm.weight || ""}
                                                        onChange={(e) => setProfileForm({ ...profileForm, weight: parseFloat(e.target.value) || null })}
                                                        disabled={!isEditingProfile}
                                                        className="rounded-xl border-lp-outline-variant/30 h-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-black text-lp-brand uppercase tracking-widest">Location & Contact</Label>
                                        <div className="grid min-w-0 gap-6 md:grid-cols-2">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">Primary Address</Label>
                                                    <Input
                                                        placeholder="Street Address"
                                                        value={profileForm.address || ""}
                                                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                                        disabled={!isEditingProfile}
                                                        className="rounded-xl border-lp-outline-variant/30"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">City</Label>
                                                        <Input
                                                            value={profileForm.city || ""}
                                                            onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                                                            disabled={!isEditingProfile}
                                                            className="rounded-xl border-lp-outline-variant/30"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">State</Label>
                                                        <Input
                                                            value={profileForm.state || ""}
                                                            onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                                                            disabled={!isEditingProfile}
                                                            className="rounded-xl border-lp-outline-variant/30"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">Postal Code</Label>
                                                    <Input
                                                        value={profileForm.postalCode || ""}
                                                        onInput={(e: any) => e.target.value = e.target.value.replace(/\D/g, '')}
                                                        onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                                                        disabled={!isEditingProfile}
                                                        className="rounded-xl border-lp-outline-variant/30"
                                                    />
                                                </div>
                                                <div className="min-w-0 space-y-2">
                                                    <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">Mobile phone</Label>
                                                    <PhoneCountryFields
                                                        className="min-w-0"
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
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">Emergency Contact Name</Label>
                                                    <Input
                                                        placeholder="Contact Name"
                                                        value={profileForm.emergencyContactName || ""}
                                                        onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')}
                                                        onChange={(e) => setProfileForm({ ...profileForm, emergencyContactName: e.target.value })}
                                                        disabled={!isEditingProfile}
                                                        className="rounded-xl border-lp-outline-variant/30"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">Emergency Phone</Label>
                                                        <Input
                                                            placeholder="Phone Number"
                                                            value={profileForm.emergencyContactPhone || ""}
                                                            onInput={(e: any) => e.target.value = e.target.value.replace(/\D/g, '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })}
                                                            disabled={!isEditingProfile}
                                                            className="rounded-xl border-lp-outline-variant/30"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-lp-on-surface-variant uppercase">Relationship</Label>
                                                        <Input
                                                            placeholder="Spouse, Parent, etc."
                                                            value={profileForm.emergencyContactRelationship || ""}
                                                            onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, emergencyContactRelationship: e.target.value })}
                                                            disabled={!isEditingProfile}
                                                            className="rounded-xl border-lp-outline-variant/30"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                ) : null}

                {activeSection === "history" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className={dashboardGlassCard}>
                        <CardHeader className="pt-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <CardTitle className="font-heading text-xl font-bold">Medical Conditions</CardTitle>
                                    <CardDescription>History of diagnosed health conditions</CardDescription>
                                </div>
                                <Dialog open={showAddCondition} onOpenChange={setShowAddCondition}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full rounded-lg bg-red-600 hover:bg-red-700 shadow-lg px-5 sm:w-auto sm:rounded-full sm:px-8 font-bold">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Report New Condition
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-xl sm:rounded-3xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black">Record Medical History</DialogTitle>
                                            <DialogDescription>Your healthcare providers will see this information.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-6 pt-4">
                                            <div className="space-y-2">
                                                <Label className="font-bold">Condition Name *</Label>
                                                <Input
                                                    id="conditionName"
                                                    value={conditionForm.conditionName}
                                                    onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')}
                                                    onChange={(e) => setConditionForm({ ...conditionForm, conditionName: e.target.value })}
                                                    placeholder="e.g. Hypertension"
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Date of Diagnosis</Label>
                                                    <Input
                                                        type="date"
                                                        max={new Date().toISOString().split('T')[0]}
                                                        value={conditionForm.diagnosisDate}
                                                        onChange={(e) => setConditionForm({ ...conditionForm, diagnosisDate: e.target.value })}
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Current Status</Label>
                                                    <Select
                                                        value={conditionForm.status}
                                                        onValueChange={(v) => setConditionForm({ ...conditionForm, status: v })}
                                                    >
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="active">Currently Active</SelectItem>
                                                            <SelectItem value="resolved">Resolved / History</SelectItem>
                                                            <SelectItem value="managed">Managed Medical</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold">Observations / Notes</Label>
                                                <Textarea
                                                    placeholder="Specific symptoms, triggers, or specialists involved..."
                                                    className="rounded-lg sm:rounded-2xl resize-none"
                                                    rows={4}
                                                    value={conditionForm.notes}
                                                    onChange={(e) => setConditionForm({ ...conditionForm, notes: e.target.value })}
                                                />
                                            </div>
                                            <Button onClick={handleAddCondition} className="w-full h-12 rounded-lg sm:rounded-full bg-indigo-600 font-bold text-lg" disabled={isSaving}>
                                                {isSaving && <Loader2 className="h-5 w-5 mr-2 animate-spin" />} Save to Records
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            <ClientMedicalHistoryList
                                records={medicalHistory}
                                isLoading={isLoadingHistory}
                                mounted={mounted}
                                onDelete={handleDeleteCondition}
                            />
                        </CardContent>
                    </Card>
                </div>
                ) : null}

                {activeSection === "medications" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className={dashboardGlassCard}>
                        <CardHeader className="pt-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="font-heading text-xl font-bold">Current Medications</CardTitle>
                                    <CardDescription>Active prescriptions and dosage tracking</CardDescription>
                                </div>
                                <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 shadow-lg px-5 sm:w-auto sm:rounded-full sm:px-8 font-bold">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Medication
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md rounded-xl sm:rounded-3xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black">Track Prescription</DialogTitle>
                                            <DialogDescription>Maintain an accurate list for safety and reminders.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-6 pt-4">
                                            <div className="space-y-2">
                                                <Label className="font-bold">Medication Name</Label>
                                                <Input value={medicationForm.medicationName} onChange={e => setMedicationForm({ ...medicationForm, medicationName: e.target.value })} className="rounded-xl h-12" />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Dosage</Label>
                                                    <Input placeholder="e.g. 500mg" value={medicationForm.dosage} onChange={e => setMedicationForm({ ...medicationForm, dosage: e.target.value })} className="rounded-xl" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Frequency</Label>
                                                    <Input placeholder="e.g. Twice Daily" value={medicationForm.frequency} onChange={e => setMedicationForm({ ...medicationForm, frequency: e.target.value })} className="rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="font-bold text-xs uppercase text-lp-on-surface-variant">Start Date *</Label>
                                                    <Input
                                                        type="date"
                                                        max={new Date().toISOString().split('T')[0]}
                                                        value={medicationForm.startDate}
                                                        onChange={e => setMedicationForm({ ...medicationForm, startDate: e.target.value })}
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold text-xs uppercase text-lp-on-surface-variant">End Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={medicationForm.endDate}
                                                        onChange={e => setMedicationForm({ ...medicationForm, endDate: e.target.value })}
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold text-xs uppercase text-lp-on-surface-variant">Prescribing Doctor</Label>
                                                <Input
                                                    value={medicationForm.prescribingDoctor}
                                                    onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s\.]/g, '')}
                                                    onChange={e => setMedicationForm({ ...medicationForm, prescribingDoctor: e.target.value })}
                                                    placeholder="Dr. Smith"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <Button onClick={handleAddMedication} className="w-full h-12 rounded-lg sm:rounded-full bg-indigo-600 font-bold" disabled={isSaving}>Add Medication</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            <ClientMedicationsList
                                records={medications}
                                isLoading={isLoadingMeds}
                                mounted={mounted}
                                onDelete={handleDeleteMedication}
                            />
                        </CardContent>
                    </Card>
                </div>
                ) : null}

                {activeSection === "documents" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className={dashboardGlassCard}>
                        <CardHeader className="pt-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <CardTitle className="font-heading text-xl font-bold">Vault Documents</CardTitle>
                                    <CardDescription>Secure storage for lab reports and prescriptions</CardDescription>
                                </div>
                                <Dialog open={showAddDocument} onOpenChange={setShowAddDocument}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className={`w-full px-5 sm:w-auto sm:rounded-full sm:px-8 ${dashboardPrimaryButton}`}>
                                            <Upload className="mr-2 h-4 w-4" /> Upload New
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="flex max-h-[min(90dvh,36rem)] w-[calc(100%-1.5rem)] max-w-md flex-col gap-0 overflow-hidden rounded-xl p-4 sm:rounded-3xl sm:p-6">
                                        <DialogHeader className="shrink-0 space-y-1 pb-3 text-left">
                                            <DialogTitle className="font-heading text-xl font-bold text-lp-cta-bg sm:text-2xl">
                                                Secure Upload
                                            </DialogTitle>
                                            <DialogDescription className="text-lp-on-surface-variant">
                                                Your files are encrypted and stored securely.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden pr-0.5">
                                            <div className="space-y-2">
                                                <Label className="font-semibold">Document Name</Label>
                                                <Input
                                                    value={documentForm.documentName}
                                                    onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s\.\-]/g, '')}
                                                    onChange={e => setDocumentForm({ ...documentForm, documentName: e.target.value })}
                                                    placeholder="e.g. Lab Report March 2024"
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-semibold">Document Type</Label>
                                                <Select value={documentForm.documentType} onValueChange={v => setDocumentForm({ ...documentForm, documentType: v })}>
                                                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="report">Laboratory Report</SelectItem>
                                                        <SelectItem value="prescription">Doctor Prescription</SelectItem>
                                                        <SelectItem value="imaging">X-Ray / MRI Scan</SelectItem>
                                                        <SelectItem value="other">Other Medical File</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div
                                                className={`group relative min-w-0 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-4 text-center transition-all duration-300 sm:rounded-2xl sm:p-6
                                                    ${isDragging
                                                        ? 'scale-[1.01] border-lp-brand bg-lp-surface-container shadow-lg'
                                                        : 'border-lp-outline-variant/40 bg-lp-surface-container-low/80 hover:border-lp-brand/50 hover:bg-lp-surface-container-low'
                                                    }`}
                                                onClick={() => documentInputRef.current?.click()}
                                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                onDragLeave={() => setIsDragging(false)}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setIsDragging(false);
                                                    const file = e.dataTransfer.files?.[0];
                                                    if (file) setSelectedFile(file);
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    ref={documentInputRef}
                                                    className="hidden"
                                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                                />
                                                <div className="mx-auto min-w-0 max-w-full space-y-2 sm:space-y-3">
                                                    <div
                                                        className={`mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300 sm:h-16 sm:w-16
                                                            ${isDragging ? 'rotate-6 bg-lp-brand text-lp-on-brand' : 'bg-lp-surface-container-lowest text-lp-brand group-hover:scale-105'}
                                                        `}
                                                    >
                                                        <Upload className="h-7 w-7 sm:h-8 sm:w-8" />
                                                    </div>
                                                    <div className="min-w-0 max-w-full px-1">
                                                        <p
                                                            className="truncate text-base font-bold text-lp-cta-bg sm:text-lg"
                                                            title={selectedFile?.name}
                                                        >
                                                            {selectedFile ? selectedFile.name : "Drop your file here"}
                                                        </p>
                                                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                                                            {selectedFile
                                                                ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                                                                : "or click to browse documents"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleAddDocument}
                                            className={`mt-4 h-12 w-full shrink-0 rounded-xl sm:rounded-full ${dashboardPrimaryButton}`}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                                            Store in Vault
                                        </Button>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            <ClientDocumentsList
                                records={documents}
                                isLoading={isLoadingDocs}
                                mounted={mounted}
                                onDelete={handleDeleteDocument}
                            />
                        </CardContent>
                    </Card>
                </div>
                ) : null}

                {activeSection === "insurance" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className={dashboardGlassCard}>
                        <CardHeader className="pt-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="font-heading text-xl font-bold">Insurance Plans</CardTitle>
                                    <CardDescription>Direct billing and coverage verification</CardDescription>
                                </div>
                                <Dialog open={showAddInsurance} onOpenChange={setShowAddInsurance}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="w-full rounded-lg bg-emerald-600 font-bold shadow-lg px-5 sm:w-auto sm:rounded-full sm:px-8">
                                            <Plus className="h-4 w-4 mr-2" /> Add Provider
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md rounded-xl sm:rounded-3xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black text-emerald-900">Link Insurance</DialogTitle>
                                            <DialogDescription>Direct billing and coverage verification.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-6 pt-4">
                                            <div className="space-y-2">
                                                <Label className="font-bold">Provider Name</Label>
                                                <Input
                                                    value={insuranceForm.providerName}
                                                    onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s\&]/g, '')}
                                                    onChange={e => setInsuranceForm({ ...insuranceForm, providerName: e.target.value })}
                                                    placeholder="e.g. Star Health"
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Policy Number</Label>
                                                    <Input
                                                        value={insuranceForm.policyNumber}
                                                        onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')}
                                                        onChange={e => setInsuranceForm({ ...insuranceForm, policyNumber: e.target.value })}
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Holder Name</Label>
                                                    <Input
                                                        value={insuranceForm.policyHolderName}
                                                        onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')}
                                                        onChange={e => setInsuranceForm({ ...insuranceForm, policyHolderName: e.target.value })}
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold">Expiration Date</Label>
                                                <Input type="date" value={insuranceForm.expirationDate} onChange={e => setInsuranceForm({ ...insuranceForm, expirationDate: e.target.value })} className="rounded-xl" />
                                            </div>
                                            <Button onClick={handleAddInsurance} className="w-full h-12 rounded-lg sm:rounded-full bg-emerald-600 font-bold" disabled={isSaving}>Link My Insurance</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            <ClientInsuranceList
                                records={insuranceData}
                                isLoading={isLoadingInsurance}
                                mounted={mounted}
                                onDelete={handleDeleteInsurance}
                            />
                        </CardContent>
                    </Card>
                </div>
                ) : null}

                {activeSection === "appointments" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className={dashboardGlassCard}>
                        <CardHeader className="pt-4">
                            <CardTitle className="font-heading text-xl font-bold">My Consultation Requests</CardTitle>
                            <CardDescription>Requests submitted from the book consultation page</CardDescription>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            <ClientAppointmentsList
                                records={appointments}
                                isLoading={isLoadingAppointments}
                                mounted={mounted}
                                prescriptionPdfLoadingId={prescriptionPdfLoadingAppointmentId}
                                onViewPrescriptionPdf={(record) => {
                                    const apt = appointments.find((a) => a.id === record.id);
                                    if (apt) void handleViewPrescriptionPdf(apt);
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
                ) : null}

                {activeSection === "orders" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <ClientOrdersSection orders={orders} isLoading={isLoadingOrders} mounted={mounted} />
                </div>
                ) : null}
            </div>

            {/* Support Float Button - Pure Aesthetics */}
            <div className="hidden sm:fixed sm:bottom-10 sm:right-10 sm:z-40">
                <Button className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-lp-surface-container-lowest bg-lp-cta-bg p-0 text-lp-on-brand shadow-2xl transition-transform hover:scale-110 sm:h-14 sm:w-14">
                    <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
            </div>
        </div>
    );
}
