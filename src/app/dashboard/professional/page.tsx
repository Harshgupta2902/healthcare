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
  updateAppointmentStatus
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
  Phone,
  Mail,
  LogOut,
  Info
} from "lucide-react";

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

export default function ProfessionalDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Double check professional role
        if (session.user.user_metadata?.role !== 'professional') {
          router.push("/dashboard");
          return;
        }
        setUser(session.user);
      } else {
        router.push("/login?redirect=/dashboard/professional");
      }
      setIsPending(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (session.user.user_metadata?.role !== 'professional') {
          router.push("/dashboard");
          return;
        }
        setUser(session.user);
      } else {
        setUser(null);
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  // Fetch all data
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
      // Get core profile info
      const { data: coreProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get professional profile info
      const { data: profProfile } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (coreProfile || profProfile) {
        const merged: ProfessionalProfile = {
          id: profProfile?.id || user.id,
          userId: user.id,
          specialization: profProfile?.specialization || "",
          licenseNumber: profProfile?.license_number || "",
          bio: profProfile?.bio || null,
          yearsOfExperience: profProfile?.years_of_experience || null,
          consultationFee: profProfile?.consultation_fee || null,
          isVerified: profProfile?.is_verified || false,
          phone: coreProfile?.phone || null,
          profilePhotoUrl: coreProfile?.image || null,
          createdAt: profProfile?.created_at || coreProfile?.created_at || "",
          updatedAt: profProfile?.updated_at || coreProfile?.updated_at || ""
        };
        setProfile(merged);
        setProfileForm(merged);
      }
    } catch (error) {
      console.error("Error fetching professional profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchQualifications = async () => {
    try {
      const { data } = await supabase
        .from('professional_qualifications')
        .select('*')
        .eq('professional_id', user.id)
        .order('year', { ascending: false });

      if (data) {
        setQualifications(data.map(item => ({
          id: item.id,
          professionalId: item.professional_id,
          degree: item.degree,
          institution: item.institution,
          year: item.year,
          documentUrl: item.document_url,
          createdAt: item.created_at
        })));
      }
    } catch (error) {
      console.error("Error fetching qualifications:", error);
    } finally {
      setIsLoadingQuals(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const { data } = await supabase
        .from('professional_availability')
        .select('*')
        .eq('professional_id', user.id)
        .order('day_of_week', { ascending: true });

      if (data) {
        setAvailability(data.map(item => ({
          id: item.id,
          professionalId: item.professional_id,
          dayOfWeek: item.day_of_week,
          startTime: item.start_time,
          endTime: item.end_time,
          isAvailable: item.is_available
        })));
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setIsLoadingAvail(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          client:users!appointments_client_id_fkey (
            name,
            email
          )
        `)
        .eq('professional_id', user.id)
        .order('start_time', { ascending: true });

      if (data) {
        setAppointments(data.map(item => ({
          id: item.id,
          clientId: item.client_id,
          professionalId: item.professional_id,
          appointmentType: item.appointment_type,
          status: item.status,
          startTime: item.start_time,
          endTime: item.end_time,
          notes: item.notes,
          meetingUrl: item.meeting_url,
          clientName: item.client?.name,
          clientEmail: item.client?.email,
          createdAt: item.created_at
        })));
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const fetchConsultationRequests = async () => {
    // Note: Consultation requests table not explicitly in SETUP but used in UI
    // Assuming it follows similar pattern
    try {
      const { data } = await supabase
        .from('consultation_requests')
        .select(`
          *,
          client:users!consultation_requests_client_id_fkey (
            name,
            email
          )
        `)
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setConsultationRequests(data.map(item => ({
          id: item.id,
          clientId: item.client_id,
          professionalId: item.professional_id,
          requestType: item.request_type,
          status: item.status,
          message: item.message,
          preferredDate: item.preferred_date,
          preferredTime: item.preferred_time,
          clientName: item.client?.name,
          clientEmail: item.client?.email,
          createdAt: item.created_at
        })));
      }
    } catch (error) {
      console.error("Error fetching consultation requests:", error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchPayments = async () => {
    // Payments table not in SETUP but assumed
    try {
      const { data } = await supabase
        .from('payments')
        .select(`
          *,
          client:users!payments_client_id_fkey (
            name
          )
        `)
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setPayments(data.map(item => ({
          id: item.id,
          clientId: item.client_id,
          professionalId: item.professional_id,
          amount: item.amount,
          status: item.status,
          paymentMethod: item.payment_method,
          transactionId: item.transaction_id,
          createdAt: item.created_at,
          clientName: item.client?.name
        })));
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
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

  const totalEarnings = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  if (isPending || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] relative">
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-bold text-[var(--color-primary)]">HealthHere Pro</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-muted-foreground)] hidden md:inline">
              Dr. {user.user_metadata?.name || user.email}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/")}>Home</Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur border-[var(--color-primary)]/20">
            <CardHeader className="pb-2">
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-green-600" />
                {totalEarnings.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/80 backdrop-blur border-[var(--color-primary)]/20">
            <CardHeader className="pb-2">
              <CardDescription>Upcoming Appointments</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                {appointments.filter(a => a.status === 'confirmed').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/80 backdrop-blur border-[var(--color-primary)]/20">
            <CardHeader className="pb-2">
              <CardDescription>New Requests</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                {consultationRequests.filter(r => r.status === 'pending').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="profile">Profile & Quals</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                ) : appointments.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No appointments scheduled.</p>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{apt.clientName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold">{apt.clientName}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {new Date(apt.startTime).toLocaleDateString()} at {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {apt.status === 'confirmed' && (
                            <Button size="sm" variant="outline" className="text-blue-600">
                              <Video className="h-4 w-4 mr-2" />
                              Join
                            </Button>
                          )}
                          <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>{apt.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Professional Profile</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(!isEditingProfile)}>
                      {isEditingProfile ? "Cancel" : <Edit className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingProfile ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={profileForm.profilePhotoUrl || ""} />
                          <AvatarFallback className="text-xl">{(user.user_metadata?.name || user.email).charAt(0)}</AvatarFallback>
                        </Avatar>
                        {isEditingProfile && (
                          <div className="flex-1 space-y-2">
                            <Label>Photo URL</Label>
                            <Input value={profileForm.profilePhotoUrl || ""} onChange={e => setProfileForm({ ...profileForm, profilePhotoUrl: e.target.value })} />
                          </div>
                        )}
                      </div>
                      <Separator />
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Specialization</Label>
                          <Input disabled={!isEditingProfile} value={profileForm.specialization || ""} onChange={e => setProfileForm({ ...profileForm, specialization: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>License Number</Label>
                          <Input disabled={!isEditingProfile} value={profileForm.licenseNumber || ""} onChange={e => setProfileForm({ ...profileForm, licenseNumber: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Experience (Years)</Label>
                            <Input type="number" disabled={!isEditingProfile} value={profileForm.yearsOfExperience || ""} onChange={e => setProfileForm({ ...profileForm, yearsOfExperience: parseInt(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Consultation Fee</Label>
                            <Input type="number" disabled={!isEditingProfile} value={profileForm.consultationFee || ""} onChange={e => setProfileForm({ ...profileForm, consultationFee: parseInt(e.target.value) })} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Bio</Label>
                          <Textarea disabled={!isEditingProfile} value={profileForm.bio || ""} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} />
                        </div>
                      </div>
                      {isEditingProfile && <Button className="w-full mt-4" onClick={handleSaveProfile}>{isSaving && <Loader2 className="animate-spin mr-2" />}Save Changes</Button>}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Qualifications</CardTitle>
                    <Button size="sm" onClick={() => setShowAddQualification(true)}><Plus className="h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingQuals ? <Loader2 className="animate-spin" /> : (
                    <div className="space-y-4">
                      {qualifications.map(q => (
                        <div key={q.id} className="flex justify-between items-center p-3 border rounded-xl">
                          <div>
                            <p className="font-bold">{q.degree}</p>
                            <p className="text-sm text-muted-foreground">{q.institution}, {q.year}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteQualification(q.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs follow same pattern of direct Supabase fetching */}
          <TabsContent value="requests">
            <Card>
              <CardHeader><CardTitle>Consultation Requests</CardTitle></CardHeader>
              <CardContent>
                {isLoadingRequests ? <Loader2 className="animate-spin mx-auto" /> : (
                  <div className="space-y-4">
                    {consultationRequests.map(req => (
                      <div key={req.id} className="p-4 border rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold">{req.clientName}</p>
                            <p className="text-xs text-muted-foreground">{req.requestType}</p>
                          </div>
                          <Badge>{req.status}</Badge>
                        </div>
                        <p className="text-sm italic text-muted-foreground mb-4">"{req.message}"</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Decline</Button>
                          <Button size="sm">Accept</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Weekly Schedule</CardTitle>
                  <Button size="sm" onClick={() => setShowAddAvailability(true)}><Plus className="h-4 w-4 mr-2" />Add Slot</Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAvail ? <Loader2 className="animate-spin mx-auto" /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availability.map(avail => (
                      <div key={avail.id} className="flex justify-between items-center p-4 border rounded-xl bg-white">
                        <div>
                          <p className="font-bold text-[var(--color-primary)]">{DAYS_OF_WEEK[avail.dayOfWeek]}</p>
                          <p className="text-sm flex items-center gap-2"><Clock className="h-3 w-3" /> {avail.startTime} - {avail.endTime}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAvailability(avail.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
              <CardContent>
                {isLoadingPayments ? <Loader2 className="animate-spin mx-auto" /> : (
                  <div className="space-y-2">
                    {payments.map(pay => (
                      <div key={pay.id} className="flex justify-between items-center p-4 border rounded-xl">
                        <div>
                          <p className="font-bold">{pay.clientName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(pay.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{pay.amount}</p>
                          <Badge variant="outline">{pay.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs for Add/Edit */}
      <Dialog open={showAddQualification} onOpenChange={setShowAddQualification}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Qualification</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Degree</Label><Input value={qualificationForm.degree} onChange={e => setQualificationForm({ ...qualificationForm, degree: e.target.value })} /></div>
            <div className="space-y-2"><Label>Institution</Label><Input value={qualificationForm.institution} onChange={e => setQualificationForm({ ...qualificationForm, institution: e.target.value })} /></div>
            <div className="space-y-2"><Label>Year</Label><Input type="number" value={qualificationForm.year} onChange={e => setQualificationForm({ ...qualificationForm, year: parseInt(e.target.value) })} /></div>
          </div>
          <Button onClick={handleAddQual} className="w-full">Add Qualification</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddAvailability} onOpenChange={setShowAddAvailability}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Availability Slot</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select value={availabilityForm.dayOfWeek.toString()} onValueChange={v => setAvailabilityForm({ ...availabilityForm, dayOfWeek: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day, i) => <SelectItem key={i} value={i.toString()}>{day}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={availabilityForm.startTime} onChange={e => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={availabilityForm.endTime} onChange={e => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })} />
              </div>
            </div>
          </div>
          <Button onClick={handleUpdateAvail} className="w-full">Save Slot</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
