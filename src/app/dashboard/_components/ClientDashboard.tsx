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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    ShieldCheck
} from "lucide-react";

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

    const [isLoadingProfile, setIsLoadingProfile] = useState(!initialData?.profile);
    const [isLoadingHistory, setIsLoadingHistory] = useState(!initialData?.medicalHistory);
    const [isLoadingMeds, setIsLoadingMeds] = useState(!initialData?.medications);
    const [isLoadingDocs, setIsLoadingDocs] = useState(!initialData?.documents);
    const [isLoadingInsurance, setIsLoadingInsurance] = useState(!initialData?.insurance);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(!initialData?.appointments);
    const [isSaving, setIsSaving] = useState(false);
    const [prescriptionPdfLoadingAppointmentId, setPrescriptionPdfLoadingAppointmentId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const documentInputRef = useRef<HTMLInputElement>(null);
    const profileImageInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<Partial<UserProfile>>(initialData?.profile || {});
    const [activeTab, setActiveTab] = useState("profile");
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
        <div className="container overflow-x-hidden px-4 py-6 pb-28 sm:px-6 sm:py-8 sm:pb-8">
            <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--color-foreground)] mb-2 uppercase tracking-tight">
                    Patient Medical Dashboard
                </h2>
                <p className="text-[var(--color-muted-foreground)] font-medium">
                    Centralized hub for your health metrics, prescriptions, and medical history.
                </p>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10">
                <Card className="bg-white/60 backdrop-blur-md border-none shadow-lg hover:shadow-xl transition-all rounded-lg sm:rounded-2xl">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-red-100 rounded-xl text-red-600">
                            <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] sm:text-xs font-black uppercase text-slate-400">Conditions</p>
                            <p className="text-2xl font-black text-slate-900">{medicalHistory.filter(h => h.status === 'active').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 backdrop-blur-md border-none shadow-lg hover:shadow-xl transition-all rounded-lg sm:rounded-2xl">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-blue-100 rounded-xl text-blue-600">
                            <Pill className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] sm:text-xs font-black uppercase text-slate-400">Active Meds</p>
                            <p className="text-2xl font-black text-slate-900">{medications.filter(m => m.isActive).length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 backdrop-blur-md border-none shadow-lg hover:shadow-xl transition-all rounded-lg sm:rounded-2xl">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-purple-100 rounded-xl text-purple-600">
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] sm:text-xs font-black uppercase text-slate-400">Documents</p>
                            <p className="text-2xl font-black text-slate-900">{documents.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 backdrop-blur-md border-none shadow-lg hover:shadow-xl transition-all rounded-lg sm:rounded-2xl">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-emerald-100 rounded-xl text-emerald-600">
                            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] sm:text-xs font-black uppercase text-slate-400">Insurance</p>
                            <p className="text-2xl font-black text-slate-900">{insuranceData.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
                <TabsList className="hidden sm:flex sm:w-full sm:overflow-x-auto sm:overflow-y-hidden lg:w-auto lg:inline-flex bg-white/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/40 shadow-sm h-auto no-scrollbar sm:whitespace-nowrap justify-start md:justify-center lg:justify-start gap-2 sm:snap-x sm:snap-mandatory sm:scroll-smooth">
                    <TabsTrigger value="profile" className="gap-2 rounded-xl w-full sm:w-auto sm:flex-shrink-0 px-3 sm:px-5 snap-center text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider">
                        <User className="h-4 w-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2 rounded-xl w-full sm:w-auto sm:flex-shrink-0 px-3 sm:px-5 snap-center text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider">
                        <Heart className="h-4 w-4" /> History
                    </TabsTrigger>
                    <TabsTrigger value="medications" className="gap-2 rounded-xl w-full sm:w-auto sm:flex-shrink-0 px-3 sm:px-5 snap-center text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider">
                        <Pill className="h-4 w-4" /> Meds
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="gap-2 rounded-xl w-full sm:w-auto sm:flex-shrink-0 px-3 sm:px-5 snap-center text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider">
                        <FileText className="h-4 w-4" /> Docs
                    </TabsTrigger>
                    <TabsTrigger value="insurance" className="gap-2 rounded-xl w-full sm:w-auto sm:flex-shrink-0 px-3 sm:px-5 snap-center text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider">
                        <Shield className="h-4 w-4" /> Insurance
                    </TabsTrigger>
                    <TabsTrigger value="appointments" className="gap-2 rounded-xl w-full sm:w-auto sm:flex-shrink-0 px-3 sm:px-5 snap-center text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider">
                        <Calendar className="h-4 w-4" /> Appointments
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
                        <Card className="lg:col-span-1 border-none shadow-xl bg-white/70 backdrop-blur-md rounded-xl sm:rounded-3xl overflow-hidden h-fit">
                            <div className="h-24 bg-gradient-to-r from-blue-400 to-indigo-500" />
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
                                            <AvatarFallback className="bg-indigo-600 text-white text-3xl font-black">
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
                                    <h3 className="text-xl font-black text-slate-900 truncate px-2">{user.user_metadata?.name || "Patient"}</h3>
                                    <p className="break-all text-sm font-bold text-slate-400">{user.email}</p>
                                    <Badge variant="secondary" className="mt-2 bg-blue-50 text-blue-700 border-blue-100 font-bold px-3">Standard Account</Badge>
                                </div>
                                <Separator className="mb-6 bg-slate-100" />
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 font-bold uppercase tracking-tighter">Blood Type</span>
                                        <span className="font-black text-red-600">{profile?.bloodType || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 font-bold uppercase tracking-tighter">Gender</span>
                                        <span className="font-black text-slate-900 capitalize">{profile?.gender || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 font-bold uppercase tracking-tighter">Weight</span>
                                        <span className="font-black text-slate-900">{profile?.weight ? `${profile.weight} kg` : "N/A"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 font-bold uppercase tracking-tighter">Height</span>
                                        <span className="font-black text-slate-900">{profile?.height ? `${profile.height} cm` : "N/A"}</span>
                                    </div>
                                </div>
                                <Button className="w-full mt-6 sm:mt-8 rounded-lg sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg font-bold" onClick={() => setIsEditingProfile(true)}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2 border-none shadow-xl bg-white/70 backdrop-blur-md rounded-xl sm:rounded-3xl">
                            <CardHeader className="pt-4 border-b border-slate-50/50">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <CardTitle className="text-xl font-black">Extended Medical Data</CardTitle>
                                        <CardDescription>Securely stored personal identifiers</CardDescription>
                                    </div>
                                    {isEditingProfile && (
                                        <div className="flex w-full gap-2 sm:w-auto">
                                            <Button onClick={() => setIsEditingProfile(false)} variant="outline" className="flex-1 rounded-full px-5 sm:flex-none sm:px-6">Cancel</Button>
                                            <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 rounded-full bg-indigo-600 hover:bg-indigo-700 px-5 sm:flex-none sm:px-6 font-bold shadow-md">
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
                                            <Label className="text-xs font-black text-indigo-600 uppercase tracking-widest">Personal Details</Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</Label>
                                                    <Input
                                                        type="date"
                                                        max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
                                                        value={profileForm.dateOfBirth || ""}
                                                        onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                                                        disabled={!isEditingProfile}
                                                        className="rounded-xl border-slate-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Gender</Label>
                                                    <Select
                                                        value={profileForm.gender || ""}
                                                        onValueChange={(v) => setProfileForm({ ...profileForm, gender: v })}
                                                        disabled={!isEditingProfile}
                                                    >
                                                        <SelectTrigger className="rounded-xl border-slate-100 h-10">
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
                                            <Label className="text-xs font-black text-indigo-600 uppercase tracking-widest">Health Metrics</Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Blood</Label>
                                                    <Select
                                                        value={profileForm.bloodType || ""}
                                                        onValueChange={(v) => setProfileForm({ ...profileForm, bloodType: v })}
                                                        disabled={!isEditingProfile}
                                                    >
                                                        <SelectTrigger className="rounded-xl border-slate-100 h-10 px-2">
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
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Height(cm)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="175"
                                                        value={profileForm.height || ""}
                                                        onChange={(e) => setProfileForm({ ...profileForm, height: parseFloat(e.target.value) || null })}
                                                        disabled={!isEditingProfile}
                                                        className="rounded-xl border-slate-100 h-10"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Weight(kg)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="70"
                                                        value={profileForm.weight || ""}
                                                        onChange={(e) => setProfileForm({ ...profileForm, weight: parseFloat(e.target.value) || null })}
                                                        disabled={!isEditingProfile}
                                                        className="rounded-xl border-slate-100 h-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-black text-indigo-600 uppercase tracking-widest">Location & Contact</Label>
                                        <div className="grid min-w-0 gap-6 md:grid-cols-2">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Primary Address</Label>
                                                    <Input
                                                        placeholder="Street Address"
                                                        value={profileForm.address || ""}
                                                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                                        disabled={!isEditingProfile}
                                                        className="rounded-xl border-slate-100"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">City</Label>
                                                        <Input
                                                            value={profileForm.city || ""}
                                                            onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                                                            disabled={!isEditingProfile}
                                                            className="rounded-xl border-slate-100"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">State</Label>
                                                        <Input
                                                            value={profileForm.state || ""}
                                                            onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                                                            disabled={!isEditingProfile}
                                                            className="rounded-xl border-slate-100"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Postal Code</Label>
                                                    <Input
                                                        value={profileForm.postalCode || ""}
                                                        onInput={(e: any) => e.target.value = e.target.value.replace(/\D/g, '')}
                                                        onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                                                        disabled={!isEditingProfile}
                                                        className="rounded-xl border-slate-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Mobile phone</Label>
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
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact Name</Label>
                                                    <Input
                                                        placeholder="Contact Name"
                                                        value={profileForm.emergencyContactName || ""}
                                                        onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')}
                                                        onChange={(e) => setProfileForm({ ...profileForm, emergencyContactName: e.target.value })}
                                                        disabled={!isEditingProfile}
                                                        className="rounded-xl border-slate-100"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Emergency Phone</Label>
                                                        <Input
                                                            placeholder="Phone Number"
                                                            value={profileForm.emergencyContactPhone || ""}
                                                            onInput={(e: any) => e.target.value = e.target.value.replace(/\D/g, '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })}
                                                            disabled={!isEditingProfile}
                                                            className="rounded-xl border-slate-100"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Relationship</Label>
                                                        <Input
                                                            placeholder="Spouse, Parent, etc."
                                                            value={profileForm.emergencyContactRelationship || ""}
                                                            onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, emergencyContactRelationship: e.target.value })}
                                                            disabled={!isEditingProfile}
                                                            className="rounded-xl border-slate-100"
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
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-xl sm:rounded-3xl">
                        <CardHeader className="pt-4 bg-red-50/30">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <CardTitle className="text-xl font-black flex items-center gap-2 text-red-900">
                                        <Activity className="h-6 w-6" /> Medical Conditions
                                    </CardTitle>
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
                            {isLoadingHistory ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                                </div>
                            ) : medicalHistory.length === 0 ? (
                                <div className="text-center py-16 sm:py-24 bg-red-50/10 rounded-xl sm:rounded-3xl border-2 border-dashed border-red-100">
                                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-200" />
                                    <h4 className="text-lg font-black text-slate-900">No Conditions Reported</h4>
                                    <p className="text-slate-400 mt-1">Keep your longitudinal health record updated.</p>
                                </div>
                            ) : (
                                <div className="grid min-w-0 gap-4 sm:gap-6 md:grid-cols-2">
                                    {medicalHistory.map((condition) => (
                                        <div
                                            key={condition.id}
                                            className="group relative w-full min-w-0 max-w-full overflow-hidden p-5 sm:p-6 bg-white border border-slate-50 rounded-xl sm:rounded-3xl hover:shadow-2xl hover:bg-slate-50/50 transition-all duration-500"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                                            <Stethoscope className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">{condition.conditionName}</h4>
                                                            <Badge className={`mt-1 font-black text-[10px] uppercase rounded-full ${condition.status === 'active' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-100 text-slate-600 border-none'}`}>
                                                                {condition.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    {condition.diagnosisDate && mounted && (
                                                        <p className="text-xs font-bold text-slate-400 pl-11">
                                                            Diagnosed: {new Date(condition.diagnosisDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
                                                        </p>
                                                    )}
                                                    {condition.notes && (
                                                        <p className="text-sm text-slate-500 pl-11 bg-slate-50/50 p-3 rounded-lg sm:rounded-2xl italic">"{condition.notes}"</p>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100"
                                                    onClick={() => handleDeleteCondition(condition.id)}
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

                {/* Medications Tab - Premium Grid */}
                <TabsContent value="medications" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-xl sm:rounded-3xl">
                        <CardHeader className="pt-4 bg-blue-50/30">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle className="text-xl font-black flex items-center gap-2 text-blue-900">
                                    <Pill className="h-6 w-6" /> Current Medications
                                </CardTitle>
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
                                                    <Label className="font-bold text-xs uppercase text-slate-500">Start Date *</Label>
                                                    <Input
                                                        type="date"
                                                        max={new Date().toISOString().split('T')[0]}
                                                        value={medicationForm.startDate}
                                                        onChange={e => setMedicationForm({ ...medicationForm, startDate: e.target.value })}
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold text-xs uppercase text-slate-500">End Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={medicationForm.endDate}
                                                        onChange={e => setMedicationForm({ ...medicationForm, endDate: e.target.value })}
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold text-xs uppercase text-slate-500">Prescribing Doctor</Label>
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
                            {isLoadingMeds ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                                </div>
                            ) : medications.length === 0 ? (
                                <div className="text-center py-16 sm:py-24 bg-blue-50/10 rounded-xl sm:rounded-3xl border-2 border-dashed border-blue-100">
                                    <div className="bg-white h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-inner">
                                        <Pill className="h-8 w-8 text-blue-200" />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900">No Active Prescriptions</h4>
                                    <p className="text-slate-400 mt-1">Add medications to receive reminders and safety alerts.</p>
                                </div>
                            ) : (
                                <div className="grid min-w-0 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {medications.map((med) => (
                                        <div key={med.id} className="group w-full min-w-0 max-w-full overflow-hidden bg-white border border-slate-50 rounded-xl sm:rounded-3xl hover:shadow-2xl transition-all duration-500">
                                            <div className="p-5 sm:p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-lg sm:rounded-2xl flex items-center justify-center font-black">
                                                        {med.dosage.match(/\d+/)?.[0] || 'M'}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="rounded-full text-slate-200 hover:text-red-500 hover:bg-red-50"
                                                        onClick={() => handleDeleteMedication(med.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <h4 className="font-black text-slate-900 text-lg uppercase truncate">{med.medicationName}</h4>
                                                <Badge className="bg-blue-50 text-blue-700 border-none font-black text-[10px] mt-1 mb-4">{med.dosage} - {med.frequency}</Badge>

                                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-slate-400 font-bold uppercase tracking-tighter">Doctor</span>
                                                        <span className="font-black text-slate-900 uppercase tracking-tight">{med.prescribingDoctor || "Self"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-slate-400 font-bold uppercase tracking-tighter">Status</span>
                                                        <span className={`font-black uppercase tracking-tight ${med.isActive ? 'text-green-500' : 'text-slate-300'}`}>
                                                            {med.isActive ? 'Active Plan' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documents - Modern File Explorer style */}
                <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-xl sm:rounded-3xl">
                        <CardHeader className="pt-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <CardTitle className="text-xl font-black flex items-center gap-2">
                                        <FileText className="h-6 w-6 text-indigo-600" /> Vault Documents
                                    </CardTitle>
                                    <CardDescription>Secure storage for lab reports and prescriptions</CardDescription>
                                </div>
                                <Dialog open={showAddDocument} onOpenChange={setShowAddDocument}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="w-full rounded-lg bg-indigo-600 font-bold shadow-lg px-5 sm:w-auto sm:rounded-full sm:px-8">
                                            <Upload className="h-4 w-4 mr-2" /> Upload New
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md rounded-xl sm:rounded-3xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black">Secure Upload</DialogTitle>
                                            <DialogDescription>Your files are encrypted and stored securely.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-6 pt-4">
                                            <div className="space-y-2">
                                                <Label className="font-bold">Document Name</Label>
                                                <Input
                                                    value={documentForm.documentName}
                                                    onInput={(e: any) => e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s\.\-]/g, '')}
                                                    onChange={e => setDocumentForm({ ...documentForm, documentName: e.target.value })}
                                                    placeholder="e.g. Lab Report March 2024"
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold">Document Type</Label>
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
                                            <div className="space-y-4">
                                                <div
                                                    className={`p-6 sm:p-10 border-2 border-dashed rounded-xl sm:rounded-[32px] text-center transition-all duration-300 relative group cursor-pointer
                                                        ${isDragging
                                                            ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-2xl shadow-indigo-100'
                                                            : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-slate-50'
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
                                                    <div className="space-y-3">
                                                        <div className={`h-20 w-20 rounded-xl sm:rounded-3xl shadow-sm flex items-center justify-center mx-auto transition-all duration-500
                                                            ${isDragging ? 'bg-indigo-600 text-white rotate-12' : 'bg-white text-indigo-500 group-hover:scale-110'}
                                                        `}>
                                                            <Upload className="h-10 w-10" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 text-lg">
                                                                {selectedFile ? selectedFile.name : "Drop your file here"}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                                                                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse documents"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button onClick={handleAddDocument} className="w-full h-14 rounded-lg sm:rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-lg transition-all" disabled={isSaving}>
                                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                                                Store in Vault
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            {isLoadingDocs ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="text-center py-16 sm:py-24 bg-slate-50/20 rounded-xl sm:rounded-3xl border-2 border-dashed border-slate-100">
                                    <p className="text-slate-400 font-bold">Your document vault is empty.</p>
                                </div>
                            ) : (
                                <div className="grid min-w-0 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="group w-full min-w-0 max-w-full bg-white border border-slate-50 rounded-xl sm:rounded-3xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                                            <div className="p-5 sm:p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-lg sm:rounded-2xl flex items-center justify-center">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <h4 className="font-black text-slate-900 truncate uppercase tracking-tight">{doc.documentName}</h4>
                                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1">{doc.documentType}</p>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Size</span>
                                                        <span className="text-xs font-black text-slate-700">
                                                            {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : "N/A"}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="rounded-full font-black text-[10px] uppercase tracking-widest border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                                                        onClick={() => window.open(doc.fileUrl, '_blank')}
                                                    >
                                                        <ExternalLink className="h-3 w-3 mr-1" /> View
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Insurance Tab */}
                <TabsContent value="insurance" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-xl sm:rounded-3xl">
                        <CardHeader className="pt-4 bg-emerald-50/30">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle className="text-xl font-black flex items-center gap-2 text-emerald-900">
                                    <Shield className="h-6 w-6" /> Insurance Plans
                                </CardTitle>
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
                            {isLoadingInsurance ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                                </div>
                            ) : insuranceData.length === 0 ? (
                                <div className="text-center py-16 sm:py-24 bg-emerald-50/10 rounded-xl sm:rounded-3xl border-2 border-dashed border-emerald-100">
                                    <p className="text-slate-400 font-bold">No insurance policies linked.</p>
                                </div>
                            ) : (
                                <div className="grid min-w-0 gap-4 sm:gap-8">
                                    {insuranceData.map((ins) => (
                                        <div key={ins.id} className="group relative w-full min-w-0 max-w-full overflow-hidden bg-white border border-slate-100 rounded-xl sm:rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500">
                                            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-50">
                                                <div className="p-5 sm:p-8 md:w-1/3 bg-slate-50/40">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Coverage Provider</p>
                                                    <h4 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tighter">{ins.providerName}</h4>
                                                    <Badge className="mt-4 bg-emerald-100 text-emerald-700 border-none font-black px-4 py-1">Verified Active</Badge>
                                                </div>
                                                <div className="p-5 sm:p-8 md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Policy ID</p>
                                                        <p className="font-extrabold text-slate-900 tracking-wider text-lg">{ins.policyNumber}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Beneficiary</p>
                                                        <p className="font-extrabold text-slate-900 tracking-tight text-lg">{ins.policyHolderName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Expiration</p>
                                                        <p className="font-extrabold text-red-400 tracking-tight text-lg">{ins.expirationDate || 'Lifetime'}</p>
                                                    </div>
                                                    <div className="flex items-end md:justify-end">
                                                        <Button variant="ghost" className="w-full rounded-lg sm:rounded-2xl text-red-300 hover:text-red-500 hover:bg-red-50 font-black px-5 sm:w-auto sm:px-6" onClick={() => handleDeleteInsurance(ins.id)}>
                                                            <Trash2 className="h-5 w-5 mr-2" /> Disconnect Policy
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appointments Tab */}
                <TabsContent value="appointments" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-xl sm:rounded-3xl">
                        <CardHeader className="pt-4 bg-indigo-50/30">
                            <CardTitle className="text-xl font-black flex items-center gap-2 text-indigo-900">
                                <Calendar className="h-6 w-6" /> My Consultation Requests
                            </CardTitle>
                            <CardDescription>Requests submitted from the book consultation page</CardDescription>
                        </CardHeader>
                        <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                            {isLoadingAppointments ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                                </div>
                            ) : appointments.length === 0 ? (
                                <div className="text-center py-16 sm:py-24 bg-indigo-50/10 rounded-xl sm:rounded-3xl border-2 border-dashed border-indigo-100">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 text-indigo-200" />
                                    <h4 className="text-lg font-black text-slate-900">No requests yet</h4>
                                    <p className="text-slate-400 mt-1">Your consultation requests will appear here.</p>
                                </div>
                            ) : (
                                <div className="grid min-w-0 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {appointments.map((apt) => (
                                        <div
                                            key={apt.id}
                                            className="group w-full min-w-0 max-w-full overflow-hidden p-5 bg-white border border-slate-100 rounded-xl sm:rounded-3xl hover:shadow-2xl transition-all duration-500"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <Badge className="font-black text-[10px] uppercase rounded-full bg-amber-50 text-amber-700 border-amber-100">
                                                    Submitted
                                                </Badge>
                                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                    {apt.category}
                                                </p>
                                            </div>

                                            <div className="mt-4 space-y-1">
                                                <h4 className="font-black text-slate-900 truncate text-lg">
                                                    {apt.professionalName || "Consultation Team"}
                                                </h4>
                                                <p className="text-xs text-slate-400 font-bold truncate uppercase tracking-wide">
                                                    {apt.city}, {apt.state}
                                                </p>
                                            </div>

                                            <div className="mt-4 p-3 rounded-lg sm:rounded-2xl bg-indigo-50/40 border border-indigo-100/60">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Schedule</p>
                                                <p className="text-sm font-black text-indigo-700">
                                                    {mounted
                                                        ? new Date(`${apt.appointmentDate}T${(apt.appointmentTime || "00:00").slice(0, 5)}:00`).toLocaleString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                        })
                                                        : ''}
                                                </p>
                                            </div>

                                            {apt.message && (
                                                <p className="mt-3 text-sm text-slate-500 italic line-clamp-2">"{apt.message}"</p>
                                            )}

                                            {apt.prescriptionUpdatedAt && (
                                                <p className="mt-2 text-[11px] font-black uppercase tracking-wider text-emerald-600">
                                                    Prescription updated{" "}
                                                    {mounted
                                                        ? new Date(apt.prescriptionUpdatedAt).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })
                                                        : ""}
                                                </p>
                                            )}

                                            {apt.prescriptionHtml && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => void handleViewPrescriptionPdf(apt)}
                                                    disabled={prescriptionPdfLoadingAppointmentId === apt.id}
                                                    className="mt-3 w-full rounded-full border-emerald-100 text-emerald-700 hover:bg-emerald-50 font-black"
                                                    >
                                                    {prescriptionPdfLoadingAppointmentId === apt.id ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <FileText className="h-4 w-4 mr-2" />
                                                    )}
                                                    {prescriptionPdfLoadingAppointmentId === apt.id ? "Preparing PDF…" : "View PDF"}
                                                </Button>
                                            )}

                                            {/* {apt.calendarInviteUrl && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-4 w-full rounded-full border-indigo-100 text-indigo-700 hover:bg-indigo-50 font-black"
                                                    onClick={() => window.open(apt.calendarInviteUrl || '', '_blank')}
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Open Invite
                                                </Button>
                                            )} */}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-teal-100 bg-white/95 px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-12px_30px_rgba(15,118,110,0.12)] backdrop-blur-md sm:hidden">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { value: "profile", label: "Profile", icon: User },
                        { value: "history", label: "History", icon: Heart },
                        { value: "medications", label: "Meds", icon: Pill },
                        { value: "documents", label: "Docs", icon: FileText },
                        { value: "insurance", label: "Insurance", icon: Shield },
                        { value: "appointments", label: "Requests", icon: Calendar },
                    ].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.value;

                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setActiveTab(item.value)}
                                className={`flex min-w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold transition-all ${isActive
                                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25"
                                    : "text-gray-600 hover:bg-teal-50"
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="max-w-[4.5rem] truncate">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Support Float Button - Pure Aesthetics */}
            <div className="hidden sm:fixed sm:bottom-10 sm:right-10 sm:z-40">
                <Button className="h-11 w-11 sm:h-14 sm:w-14 rounded-full bg-slate-900 text-white shadow-2xl hover:scale-110 transition-transform flex items-center justify-center p-0 border-4 border-white">
                    <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
            </div>
        </div>
    );
}
