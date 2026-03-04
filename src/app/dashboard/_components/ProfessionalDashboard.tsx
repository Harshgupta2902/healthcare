"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    updateProfessionalProfile,
    addQualification,
    deleteQualification,
    updateAvailability,
    deleteAvailability,
    updateAppointmentStatus,
    updateConsultationRequestStatus
} from "@/features/professional/actions";
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
    Info
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

interface ProfessionalProfile {
    id: string;
    userId: string;
    specialization: string;
    licenseNumber: string;
    bio: string | null;
    yearsOfExperience: number | null;
    consultationFee: number | null;
    isVerified: boolean;
    phone: string | null;
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
    documentUrl: string | null;
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

export function ProfessionalDashboard({ user }: { user: any }) {
    const router = useRouter();
    const supabase = createClient();

    const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
    const [qualifications, setQualifications] = useState<Qualification[]>([]);
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);

    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoadingQuals, setIsLoadingQuals] = useState(true);
    const [isLoadingAvail, setIsLoadingAvail] = useState(true);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
    const [isLoadingRequests, setIsLoadingRequests] = useState(true);
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<Partial<ProfessionalProfile>>({});

    const [showAddQualification, setShowAddQualification] = useState(false);
    const [showAddAvailability, setShowAddAvailability] = useState(false);

    const [qualificationForm, setQualificationForm] = useState({
        degree: "",
        institution: "",
        year: new Date().getFullYear(),
        documentUrl: ""
    });

    const [availabilityForm, setAvailabilityForm] = useState({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchQualifications();
            fetchAvailability();
            fetchAppointments();
            fetchConsultationRequests();
            fetchPayments();
        }
    }, [user]);

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

            if (coreProfile || profProfile) {
                const merged: ProfessionalProfile = {
                    id: profProfile?.id || "",
                    userId: user.id,
                    specialization: profProfile?.specialization || "",
                    licenseNumber: profProfile?.license_number || "",
                    bio: profProfile?.bio || null,
                    yearsOfExperience: profProfile?.years_of_experience || null,
                    consultationFee: profProfile?.consultation_fee || null,
                    isVerified: profProfile?.is_verified || false,
                    phone: coreProfile?.phone || null,
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
            const { data, error } = await supabase
                .from('professional_qualifications')
                .select('*')
                .eq('professional_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setQualifications(data.map(q => ({
                    id: q.id,
                    professionalId: q.professional_id,
                    degree: q.degree,
                    institution: q.institution,
                    year: q.year,
                    documentUrl: q.document_url,
                    createdAt: q.created_at
                })));
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
            await updateProfessionalProfile(profileForm);
            await fetchProfile();
            setIsEditingProfile(false);
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddQual = async () => {
        setIsSaving(true);
        try {
            await addQualification(qualificationForm);
            toast.success("Qualification added");
            setShowAddQualification(false);
            setQualificationForm({ degree: "", institution: "", year: new Date().getFullYear(), documentUrl: "" });
            fetchQualifications();
        } catch (error: any) {
            toast.error(error.message || "Failed to add qualification");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateAvail = async () => {
        setIsSaving(true);
        try {
            await updateAvailability(availabilityForm);
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
            await deleteQualification(id);
            toast.success("Qualification deleted");
            fetchQualifications();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete");
        }
    };

    const handleDeleteAvailability = async (id: string) => {
        try {
            await deleteAvailability(id);
            toast.success("Availability deleted");
            fetchAvailability();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete");
        }
    };

    const handleUpdateAppointmentStatus = async (id: string, status: string) => {
        try {
            await updateAppointmentStatus(id, status);
            toast.success(`Appointment ${status}`);
            fetchAppointments();
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleUpdateRequestStatus = async (id: string, status: string) => {
        try {
            await updateConsultationRequestStatus(id, status);
            toast.success(`Request ${status}`);
            fetchConsultationRequests();
        } catch (error: any) {
            toast.error(error.message || "Failed to update request");
        }
    };

    const totalEarnings = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="container px-4 sm:px-6 py-6 md:py-10">
            <div className="mb-8">
                <h2 className="text-3xl font-heading font-bold text-[var(--color-foreground)] mb-2">
                    Professional Dashboard
                </h2>
                <p className="text-[var(--color-muted-foreground)]">
                    Manage your practice, appointments, and client consultations
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="hover:shadow-lg transition-all border-none bg-white/60 backdrop-blur-sm">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <IndianRupee className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Earnings</p>
                                <p className="text-xl font-black text-slate-900">₹{(totalEarnings / 100).toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all border-none bg-white/60 backdrop-blur-sm">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-100 rounded-xl">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending</p>
                                <p className="text-xl font-black text-slate-900">₹{(pendingPayments / 100).toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all border-none bg-white/60 backdrop-blur-sm">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Appointments</p>
                                <p className="text-xl font-black text-slate-900">{appointments.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all border-none bg-white/60 backdrop-blur-sm">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Requests</p>
                                <p className="text-xl font-black text-slate-900">{consultationRequests.filter(r => r.status === "pending").length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="flex w-full overflow-x-auto overflow-y-hidden lg:w-auto lg:inline-flex bg-white/50 backdrop-blur p-1.5 rounded-2xl border border-white/40 h-auto no-scrollbar whitespace-nowrap justify-start md:justify-center lg:justify-start gap-2 snap-x snap-mandatory scroll-smooth">
                    <TabsTrigger value="profile" className="gap-2 rounded-xl flex-shrink-0 px-6 snap-center">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="credentials" className="gap-2 rounded-xl flex-shrink-0 px-6 snap-center">
                        <GraduationCap className="h-4 w-4" />
                        Credentials
                    </TabsTrigger>
                    <TabsTrigger value="consultations" className="gap-2 rounded-xl flex-shrink-0 px-6 snap-center">
                        <MessageSquare className="h-4 w-4" />
                        Consultations
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="gap-2 rounded-xl flex-shrink-0 px-6 snap-center">
                        <CalendarIcon className="h-4 w-4" />
                        Calendar
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="gap-2 rounded-xl flex-shrink-0 px-6 snap-center">
                        <IndianRupee className="h-4 w-4" />
                        Payments
                    </TabsTrigger>
                    <TabsTrigger value="clients" className="gap-2 rounded-xl flex-shrink-0 px-6 snap-center">
                        <Users className="h-4 w-4" />
                        Clients
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black text-slate-900">Professional Information</CardTitle>
                                    <CardDescription>Your professional profile and contact details</CardDescription>
                                </div>
                                {!isEditingProfile ? (
                                    <Button onClick={() => setIsEditingProfile(true)} size="sm" variant="outline" className="rounded-full px-5">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={() => { setIsEditingProfile(false); setProfileForm(profile || {}); }} size="sm" variant="outline" className="rounded-full px-5">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveProfile} size="sm" disabled={isSaving} className="rounded-full px-5 bg-[var(--color-primary)]">
                                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 md:p-8">
                            {isLoadingProfile ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-8">
                                        <div className="relative">
                                            <Avatar className="h-32 w-32 ring-4 ring-white shadow-2xl">
                                                <AvatarImage src={profileForm.profilePhotoUrl || undefined} className="object-cover" />
                                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl font-black">
                                                    {(user.user_metadata?.name || user.email)?.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            {!isEditingProfile && profile?.isVerified && (
                                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg">
                                                    <CheckCircle className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            {isEditingProfile ? (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold text-slate-600">Profile Photo URL</Label>
                                                    <Input
                                                        placeholder="Enter image URL"
                                                        value={profileForm.profilePhotoUrl || ""}
                                                        onChange={(e) => setProfileForm({ ...profileForm, profilePhotoUrl: e.target.value })}
                                                        className="rounded-xl border-slate-200 focus:ring-slate-400"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black text-slate-900">{user.user_metadata?.name || "Dr. Professional"}</h3>
                                                    <p className="text-indigo-600 font-bold tracking-wide uppercase text-sm">{profile?.specialization || "General Medicine"}</p>
                                                    {profile?.isVerified && (
                                                        <Badge className="bg-green-50 text-green-700 border-green-100 mt-2 font-bold px-3">Verified Medical Professional</Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Separator className="bg-slate-100" />

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-600">Full Name</Label>
                                            <Input value={user.user_metadata?.name || ""} disabled className="bg-slate-50/50 rounded-xl border-none font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-600">Email Address</Label>
                                            <Input value={user.email || ""} disabled className="bg-slate-50/50 rounded-xl border-none font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-600">Specialization *</Label>
                                            <Select
                                                value={profileForm.specialization || ""}
                                                onValueChange={(value) => setProfileForm({ ...profileForm, specialization: value })}
                                                disabled={!isEditingProfile}
                                            >
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue placeholder="Select specialization" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="General Physician">General Physician</SelectItem>
                                                    <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                                                    <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                                                    <SelectItem value="Neurologist">Neurologist</SelectItem>
                                                    <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                                                    <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                                                    <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                                                    <SelectItem value="Gynecologist">Gynecologist</SelectItem>
                                                    <SelectItem value="ENT Specialist">ENT Specialist</SelectItem>
                                                    <SelectItem value="Ophthalmologist">Ophthalmologist</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-600">Medical License Number *</Label>
                                            <Input
                                                placeholder="Enter license number"
                                                value={profileForm.licenseNumber || ""}
                                                onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                                                disabled={!isEditingProfile}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-600">Contact Phone</Label>
                                            <Input
                                                placeholder="Enter phone number"
                                                value={profileForm.phone || ""}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                disabled={!isEditingProfile}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-600">Years of Experience</Label>
                                            <Input
                                                type="number"
                                                placeholder="Enter years"
                                                value={profileForm.yearsOfExperience || ""}
                                                onChange={(e) => setProfileForm({ ...profileForm, yearsOfExperience: parseInt(e.target.value) || null })}
                                                disabled={!isEditingProfile}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-600">Consultation Fee (paise)</Label>
                                            <Input
                                                type="number"
                                                placeholder="Enter fee in paise (100 paise = 1 INR)"
                                                value={profileForm.consultationFee || ""}
                                                onChange={(e) => setProfileForm({ ...profileForm, consultationFee: parseInt(e.target.value) || null })}
                                                disabled={!isEditingProfile}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-slate-600">Professional Bio</Label>
                                        <Textarea
                                            placeholder="Write about yourself, your experience, and expertise..."
                                            value={profileForm.bio || ""}
                                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                            disabled={!isEditingProfile}
                                            rows={6}
                                            className="rounded-2xl border-slate-200 resize-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="credentials" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-2xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Qualifications & Licenses</CardTitle>
                                    <CardDescription>Your educational background and certifications</CardDescription>
                                </div>
                                <Dialog open={showAddQualification} onOpenChange={setShowAddQualification}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg px-6">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Credential
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-black">Add New Qualification</DialogTitle>
                                            <DialogDescription>Enter your educational or professional certification details</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-6 pt-4">
                                            <div className="space-y-2">
                                                <Label className="font-bold text-slate-600">Degree/Certification *</Label>
                                                <Input
                                                    placeholder="e.g., MD Cardiology, Board Certified"
                                                    value={qualificationForm.degree}
                                                    onChange={(e) => setQualificationForm({ ...qualificationForm, degree: e.target.value })}
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold text-slate-600">Issuing Institution *</Label>
                                                <Input
                                                    placeholder="e.g., Johns Hopkins Hospital"
                                                    value={qualificationForm.institution}
                                                    onChange={(e) => setQualificationForm({ ...qualificationForm, institution: e.target.value })}
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="font-bold text-slate-600">Year Awarded</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="YYYY"
                                                        value={qualificationForm.year}
                                                        onChange={(e) => setQualificationForm({ ...qualificationForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold text-slate-600">Verification URL</Label>
                                                    <Input
                                                        placeholder="Link to digital certificate"
                                                        value={qualificationForm.documentUrl}
                                                        onChange={(e) => setQualificationForm({ ...qualificationForm, documentUrl: e.target.value })}
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <Button onClick={handleAddQual} className="w-full rounded-full h-12 bg-indigo-600 text-lg font-bold" disabled={isSaving}>
                                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                                Verify & Add Credential
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 md:p-8">
                            {isLoadingQuals ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : qualifications.length === 0 ? (
                                <div className="text-center py-24 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <div className="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <GraduationCap className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900">No Credentials Listed</h4>
                                    <p className="text-slate-500 max-w-xs mx-auto mt-2">Display your professional authority by adding your degrees and certifications.</p>
                                    <Button variant="link" onClick={() => setShowAddQualification(true)} className="mt-4 text-indigo-600 font-bold">Add your first one now →</Button>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2">
                                    {qualifications.map((qual) => (
                                        <div
                                            key={qual.id}
                                            className="group relative p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                            <GraduationCap className="h-6 w-6" />
                                                        </div>
                                                        <h4 className="font-black text-slate-900 text-lg">
                                                            {qual.degree}
                                                        </h4>
                                                    </div>
                                                    <p className="text-slate-600 font-bold">{qual.institution}</p>
                                                    <div className="flex items-center gap-4 mt-4 text-sm font-medium text-slate-400">
                                                        {qual.year && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" /> {qual.year}
                                                            </span>
                                                        )}
                                                        {qual.documentUrl && (
                                                            <Button
                                                                size="sm"
                                                                variant="link"
                                                                className="p-0 h-auto text-indigo-500 font-bold"
                                                                onClick={() => window.open(qual.documentUrl!, "_blank")}
                                                            >
                                                                <FileText className="h-3 w-3 mr-1" />
                                                                Verification Link
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50 hover:text-red-500"
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
                    <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-2xl">
                        <CardHeader>
                            <CardTitle>Consultation Requests</CardTitle>
                            <CardDescription>Manage incoming video and text consultation requests from new clients</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 md:p-8">
                            {isLoadingRequests ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : consultationRequests.length === 0 ? (
                                <div className="text-center py-24 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <div className="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <MessageSquare className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900">Quiet Inbox</h4>
                                    <p className="text-slate-500 max-w-xs mx-auto mt-2">New consultation requests will appear here as clients find your profile.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {consultationRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="group p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-xl transition-all duration-300"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <div className={`p-2 rounded-xl ${request.requestType === "video" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                                                            {request.requestType === "video" ? <Video className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
                                                        </div>
                                                        <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">
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
                                                        <div className="bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                                            {(request.clientName || "C").charAt(0)}
                                                        </div>
                                                        <p className="font-bold text-slate-800">
                                                            {request.clientName || "Healthcare Client"}
                                                        </p>
                                                    </div>
                                                    {request.preferredDate && (
                                                        <p className="text-sm font-bold text-indigo-600 flex items-center gap-2">
                                                            <CalendarIcon className="h-4 w-4" />
                                                            {new Date(request.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                            {request.preferredTime && <span className="text-slate-400">• {request.preferredTime}</span>}
                                                        </p>
                                                    )}
                                                    {request.message && (
                                                        <div className="relative mt-4">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 rounded-full" />
                                                            <p className="text-slate-600 italic text-sm pl-4 line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">"{request.message}"</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {request.status === "pending" && (
                                                    <div className="flex gap-3">
                                                        <Button
                                                            size="lg"
                                                            className="rounded-full bg-green-600 hover:bg-green-700 shadow-lg text-white font-black px-8"
                                                            onClick={() => handleUpdateRequestStatus(request.id, "accepted")}
                                                        >
                                                            <CheckCircle className="h-5 w-5 mr-2" />
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            size="lg"
                                                            variant="outline"
                                                            className="rounded-full text-red-600 border-red-200 hover:bg-red-50 font-black px-8"
                                                            onClick={() => handleUpdateRequestStatus(request.id, "rejected")}
                                                        >
                                                            <XCircle className="h-5 w-5 mr-2" />
                                                            Decline
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calendar" className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden">
                            <CardHeader className="bg-indigo-50/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-slate-900 font-black">Weekly Availability</CardTitle>
                                        <CardDescription>Setup your core recurring working hours</CardDescription>
                                    </div>
                                    <Dialog open={showAddAvailability} onOpenChange={setShowAddAvailability}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Slot
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-black">Add availability time slot</DialogTitle>
                                                <DialogDescription>These slots will repeat every week</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-6 pt-4">
                                                <div className="space-y-2">
                                                    <Label className="font-bold text-slate-600">Select Day</Label>
                                                    <Select
                                                        value={availabilityForm.dayOfWeek.toString()}
                                                        onValueChange={(value) => setAvailabilityForm({ ...availabilityForm, dayOfWeek: parseInt(value) })}
                                                    >
                                                        <SelectTrigger className="rounded-xl h-12">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            {DAYS_OF_WEEK.map((day, index) => (
                                                                <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="font-bold text-slate-600 flex items-center gap-2">
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
                                                        <Label className="font-bold text-slate-600 flex items-center gap-2">
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
                                                <Button onClick={handleUpdateAvail} className="w-full rounded-full h-12 bg-indigo-600 text-lg font-bold" disabled={isSaving}>
                                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                                    Save Schedule
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 md:p-8">
                                {isLoadingAvail ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                    </div>
                                ) : availability.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50/50 rounded-2xl">
                                        <p className="text-slate-500 font-bold">Your schedule is empty.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {availability.map((slot) => (
                                            <div
                                                key={slot.id}
                                                className="group flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="w-24 font-black text-slate-900 border-r-2 border-slate-100">
                                                        {DAYS_OF_WEEK[slot.dayOfWeek]}
                                                    </div>
                                                    <div className="flex items-center gap-2 font-black text-indigo-600">
                                                        <Clock className="h-4 w-4" />
                                                        {slot.startTime} <span className="text-slate-300 font-normal mx-1">→</span> {slot.endTime}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50"
                                                    onClick={() => handleDeleteAvailability(slot.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden">
                            <CardHeader className="bg-emerald-50/50">
                                <CardTitle className="text-slate-900 font-black">Upcoming Appointments</CardTitle>
                                <CardDescription>Confirmed consultations for the next 7 days</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 md:p-8">
                                {isLoadingAppointments ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                    </div>
                                ) : appointments.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50/50 rounded-2xl">
                                        <p className="text-slate-500 font-bold">No upcoming appointments scheduled.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {appointments.map((apt) => (
                                            <div
                                                key={apt.id}
                                                className="p-5 border border-slate-100 rounded-2xl bg-white shadow-sm"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600">
                                                                {(apt.clientName || "P").charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-extrabold text-slate-900">{apt.clientName || "Patient"}</h4>
                                                                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none font-black text-[10px] uppercase">{apt.appointmentType}</Badge>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1 pl-12 text-sm">
                                                            <p className="text-slate-900 font-black">{new Date(apt.startTime).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p>
                                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{apt.status}</p>
                                                        </div>
                                                    </div>
                                                    {apt.status === "scheduled" && (
                                                        <Button
                                                            size="sm"
                                                            className="rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 shadow-md font-bold"
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
                    <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden">
                        <CardHeader>
                            <CardTitle>Financial Overview</CardTitle>
                            <CardDescription>Track your transaction history and upcoming payouts</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 md:p-8">
                            {isLoadingPayments ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-24 bg-slate-50/50 rounded-2xl">
                                    <IndianRupee className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold">No payments processed yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="group flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-2xl transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`p-4 rounded-2xl ${payment.status === "completed" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
                                                    <IndianRupee className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <p className="text-3xl font-black text-slate-900 tracking-tight">₹{(payment.amount / 100).toFixed(2)}</p>
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(payment.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 md:mt-0 flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-slate-900">{payment.clientName || "Direct Payment"}</p>
                                                    <p className="text-xs font-bold text-slate-400 capitalize">{payment.paymentMethod}</p>
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
                    <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-2xl">
                        <CardHeader>
                            <CardTitle>Client Records</CardTitle>
                            <CardDescription>Comprehensive database of clients you have consulted with</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 md:p-8">
                            {isLoadingAppointments ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : appointments.length === 0 ? (
                                <div className="text-center py-24 bg-slate-50/50 rounded-2xl">
                                    <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold">Your client list is currently empty.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {[...new Set(appointments.map(a => a.clientId))].map((clientId) => {
                                        const clientAppointments = appointments.filter(a => a.clientId === clientId);
                                        const latestAppointment = clientAppointments[0];
                                        return (
                                            <div
                                                key={clientId}
                                                className="group p-4 sm:p-6 bg-white border border-slate-50 rounded-3xl hover:shadow-2xl hover:bg-slate-50/50 transition-all duration-500"
                                            >
                                                <div className="flex flex-col gap-5">
                                                    <div className="p-4 sm:p-5 flex items-center gap-4">
                                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-600 text-xl shadow-inner">
                                                            {(latestAppointment.clientName || "C").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <h4 className="font-black text-slate-900 truncate text-lg">{latestAppointment.clientName || "Healthcare Client"}</h4>
                                                            {latestAppointment.clientEmail && (
                                                                <p className="text-xs font-bold text-slate-400 truncate flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" /> {latestAppointment.clientEmail}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-center pt-2">
                                                        <div className="bg-white/80 p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Total Visits</p>
                                                            <p className="text-xl font-black text-indigo-600">{clientAppointments.length}</p>
                                                        </div>
                                                        <div className="bg-white/80 p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Last Seen</p>
                                                            <p className="text-xs font-black text-slate-800 pt-1">
                                                                {new Date(latestAppointment.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Button variant="outline" className="w-full rounded-2xl border-slate-100 bg-white font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all group-hover:shadow-md">
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

            <div className="mt-16 space-y-8 pb-20">
                <Separator className="bg-slate-200" />
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--color-primary)] text-white rounded-xl shadow-lg shadow-indigo-200">
                        <CalendarIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Pictorial Schedule</h2>
                        <p className="text-slate-500 font-bold text-sm">A visual overview of your recurring and date-specific time</p>
                    </div>
                </div>

                <Card className="border-none shadow-2xl bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-white/80 border-b border-slate-50">
                        <CardTitle>Schedule Visualization</CardTitle>
                        <CardDescription>Green indicates recurring availability, Blue represents specific day appointments.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-1 flex justify-center p-8 border-none rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100">
                                <Calendar
                                    mode="single"
                                    className="p-3 border-none"
                                    modifiers={{
                                        available: (date) => availability.some(slot => slot.dayOfWeek === date.getDay()),
                                        appointment: (date) => appointments.some(apt => {
                                            const aptDate = new Date(apt.startTime);
                                            return aptDate.toDateString() === date.toDateString();
                                        })
                                    }}
                                    modifiersClassNames={{
                                        available: "bg-green-50 text-green-700 font-black border-b-4 border-green-500 rounded-none hover:bg-green-100",
                                        appointment: "bg-indigo-600 text-white font-black ring-4 ring-indigo-100 rounded-xl hover:bg-indigo-700"
                                    }}
                                />
                            </div>

                            <div className="lg:col-span-2 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50/30 p-6 rounded-3xl border border-green-100 shadow-sm">
                                        <h4 className="text-green-800 font-black flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
                                            <CheckCircle className="h-4 w-4" /> Weekly Slots
                                        </h4>
                                        <div className="space-y-3">
                                            {DAYS_OF_WEEK.map((day, idx) => {
                                                const daySlots = availability.filter(s => s.dayOfWeek === idx);
                                                if (daySlots.length === 0) return null;
                                                return (
                                                    <div key={idx} className="text-xs flex justify-between items-center bg-white/60 p-2.5 rounded-xl border border-green-100">
                                                        <span className="font-extrabold text-slate-900">{day}</span>
                                                        <span className="text-emerald-700 font-black">{daySlots.map(s => `${s.startTime}-${s.endTime}`).join(", ")}</span>
                                                    </div>
                                                );
                                            })}
                                            {availability.length === 0 && <p className="text-xs text-slate-400 italic">Configure your weekly hours in the Calendar tab.</p>}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50/30 p-6 rounded-3xl border border-indigo-100 shadow-sm">
                                        <h4 className="text-indigo-800 font-black flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
                                            <Info className="h-4 w-4" /> Schedule Legend
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-xs bg-white/60 p-3 rounded-2xl">
                                                <div className="w-4 h-4 bg-green-50 border-b-4 border-green-500 rounded-sm" />
                                                <span className="font-bold text-slate-700">Days with recurring availability set</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs bg-white/60 p-3 rounded-2xl">
                                                <div className="w-4 h-4 bg-indigo-600 rounded-lg shadow-sm" />
                                                <span className="font-bold text-slate-700">Specific dates with scheduled clients</span>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 text-[10px] leading-relaxed text-slate-400 bg-slate-50/40 rounded-2xl mt-2">
                                                <Info className="h-4 w-4 flex-shrink-0" />
                                                <span>Note: Appointment dates are highlighted in solid blue and take priority over recurring availability in the calendar view.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-900 text-indigo-100 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
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
