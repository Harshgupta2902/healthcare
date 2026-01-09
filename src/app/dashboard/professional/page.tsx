"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
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
import { authClient } from "@/lib/auth-client";
import { 
  User, 
  GraduationCap, 
  Users, 
  Calendar,
  DollarSign,
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
  LogOut
} from "lucide-react";

interface ProfessionalProfile {
  id: number;
  userId: string;
  specialization: string;
  licenseNumber: string;
  bio: string | null;
  yearsOfExperience: number | null;
  consultationFee: number | null;
  phone: string | null;
  profilePhotoUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Qualification {
  id: number;
  professionalId: string;
  degree: string;
  institution: string;
  year: number | null;
  documentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ConsultationRequest {
  id: number;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  professionalId: string;
  requestType: string;
  status: string;
  message: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  id: number;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  professionalId: string;
  appointmentType: string;
  status: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  meetingUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Availability {
  id: number;
  professionalId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  id: number;
  professionalId: string;
  appointmentId: number | null;
  amount: number;
  status: string;
  paymentMethod: string | null;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ProfessionalDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingQualifications, setIsLoadingQualifications] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<ProfessionalProfile>>({});
  
  const [showAddQualification, setShowAddQualification] = useState(false);
  const [showAddAvailability, setShowAddAvailability] = useState(false);
  
  const [qualificationForm, setQualificationForm] = useState({
    degree: "",
    institution: "",
    year: "",
    documentUrl: ""
  });
  
    const [availabilityForm, setAvailabilityForm] = useState({
      dayOfWeek: "1",
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true
    });
  
    const handleLogout = async () => {
      try {
        await authClient.signOut();
        localStorage.removeItem("bearer_token");
        router.push("/login");
        toast.success("Logged out successfully");
      } catch (error) {
        toast.error("Failed to log out");
      }
    };
  
    useEffect(() => {
    // Check if we have a token in localStorage as a hint
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem("bearer_token");

    if (!isPending) {
      if (!session?.user && !hasToken) {
        // Only redirect if we've given the session a chance to load
        const timeoutId = setTimeout(() => {
          if (!session?.user && !localStorage.getItem("bearer_token")) {
            router.push("/login?redirect=/dashboard/professional");
          }
        }, 1000);
        return () => clearTimeout(timeoutId);
      } else if (session?.user && session.user.role !== "professional") {
        toast.error("Access denied. This portal is for healthcare professionals only.");
        router.push("/dashboard");
      }
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchQualifications();
      fetchConsultationRequests();
      fetchAppointments();
      fetchAvailability();
      fetchPayments();
    }
  }, [session]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("bearer_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/professional/profile", {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setProfileForm(data);
      } else if (response.status === 404) {
        setProfile(null);
        setIsEditingProfile(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchQualifications = async () => {
    try {
      const response = await fetch("/api/professional/qualifications", {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setQualifications(data);
      }
    } catch (error) {
      console.error("Error fetching qualifications:", error);
    } finally {
      setIsLoadingQualifications(false);
    }
  };

  const fetchConsultationRequests = async () => {
    try {
      const response = await fetch("/api/professional/consultation-requests", {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setConsultationRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/professional/appointments", {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await fetch("/api/professional/availability", {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/professional/payments", {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.specialization || !profileForm.licenseNumber) {
      toast.error("Specialization and license number are required");
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch("/api/professional/profile", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setIsEditingProfile(false);
        toast.success("Profile updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQualification = async () => {
    if (!qualificationForm.degree.trim() || !qualificationForm.institution.trim()) {
      toast.error("Degree and institution are required");
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch("/api/professional/qualifications", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...qualificationForm,
          year: qualificationForm.year ? parseInt(qualificationForm.year) : null
        })
      });
      
      if (response.ok) {
        toast.success("Qualification added successfully");
        setShowAddQualification(false);
        setQualificationForm({ degree: "", institution: "", year: "", documentUrl: "" });
        fetchQualifications();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add qualification");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQualification = async (id: number) => {
    try {
      const response = await fetch(`/api/professional/qualifications/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        toast.success("Qualification deleted");
        fetchQualifications();
      } else {
        toast.error("Failed to delete qualification");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleAddAvailability = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/professional/availability", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...availabilityForm,
          dayOfWeek: parseInt(availabilityForm.dayOfWeek)
        })
      });
      
      if (response.ok) {
        toast.success("Availability added successfully");
        setShowAddAvailability(false);
        setAvailabilityForm({ dayOfWeek: "1", startTime: "09:00", endTime: "17:00", isAvailable: true });
        fetchAvailability();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add availability");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    try {
      const response = await fetch(`/api/professional/availability/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        toast.success("Availability deleted");
        fetchAvailability();
      } else {
        toast.error("Failed to delete availability");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdateRequestStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/professional/consultation-requests/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast.success(`Request ${status}`);
        fetchConsultationRequests();
      } else {
        toast.error("Failed to update request");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdateAppointmentStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/professional/appointments/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast.success(`Appointment ${status}`);
        fetchAppointments();
      } else {
        toast.error("Failed to update appointment");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const totalEarnings = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] relative">
      <div 
        className="absolute inset-0 z-0 opacity-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1920)'
        }}
      />
      
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-bold text-[var(--color-primary)]">HealthHere</h1>
            <Badge variant="secondary">Professional</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-muted-foreground)]">
              Dr. {session.user.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
            >
              Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold text-[var(--color-foreground)] mb-2">
            Professional Dashboard
          </h2>
          <p className="text-[var(--color-muted-foreground)]">
            Manage your practice, appointments, and client consultations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Total Earnings</p>
                  <p className="text-xl font-bold">${(totalEarnings / 100).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Pending</p>
                  <p className="text-xl font-bold">${(pendingPayments / 100).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Appointments</p>
                  <p className="text-xl font-bold">{appointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Requests</p>
                  <p className="text-xl font-bold">{consultationRequests.filter(r => r.status === "pending").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="credentials" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Credentials
            </TabsTrigger>
            <TabsTrigger value="consultations" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Consultations
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Professional Information</CardTitle>
                    <CardDescription>Your professional profile and contact details</CardDescription>
                  </div>
                  {!isEditingProfile ? (
                    <Button onClick={() => setIsEditingProfile(true)} size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => { setIsEditingProfile(false); setProfileForm(profile || {}); }} size="sm" variant="outline">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} size="sm" disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingProfile ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileForm.profilePhotoUrl || undefined} />
                        <AvatarFallback className="bg-[var(--color-primary)] text-white text-2xl">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isEditingProfile && (
                        <div className="space-y-2 flex-1">
                          <Label>Profile Photo URL</Label>
                          <Input
                            placeholder="Enter image URL"
                            value={profileForm.profilePhotoUrl || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, profilePhotoUrl: e.target.value })}
                          />
                        </div>
                      )}
                      {!isEditingProfile && profile?.isVerified && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified Professional
                        </Badge>
                      )}
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={session.user.name || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={session.user.email || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Specialization *</Label>
                        <Select
                          value={profileForm.specialization || ""}
                          onValueChange={(value) => setProfileForm({ ...profileForm, specialization: value })}
                          disabled={!isEditingProfile}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                          <SelectContent>
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
                        <Label>License Number *</Label>
                        <Input
                          placeholder="Enter license number"
                          value={profileForm.licenseNumber || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          placeholder="Enter phone number"
                          value={profileForm.phone || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Years of Experience</Label>
                        <Input
                          type="number"
                          placeholder="Enter years"
                          value={profileForm.yearsOfExperience || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, yearsOfExperience: parseInt(e.target.value) || null })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Consultation Fee (cents)</Label>
                        <Input
                          type="number"
                          placeholder="Enter fee in cents"
                          value={profileForm.consultationFee || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, consultationFee: parseInt(e.target.value) || null })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea
                        placeholder="Write about yourself, your experience, and expertise..."
                        value={profileForm.bio || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        disabled={!isEditingProfile}
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credentials" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Qualifications & Licenses</CardTitle>
                    <CardDescription>Your educational background and certifications</CardDescription>
                  </div>
                  <Dialog open={showAddQualification} onOpenChange={setShowAddQualification}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Qualification
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Qualification</DialogTitle>
                        <DialogDescription>Enter your educational qualification details</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Degree/Certification *</Label>
                          <Input
                            placeholder="e.g., MD, MBBS, Board Certification"
                            value={qualificationForm.degree}
                            onChange={(e) => setQualificationForm({ ...qualificationForm, degree: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Institution *</Label>
                          <Input
                            placeholder="e.g., Harvard Medical School"
                            value={qualificationForm.institution}
                            onChange={(e) => setQualificationForm({ ...qualificationForm, institution: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year</Label>
                          <Input
                            type="number"
                            placeholder="Year of completion"
                            value={qualificationForm.year}
                            onChange={(e) => setQualificationForm({ ...qualificationForm, year: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Document URL</Label>
                          <Input
                            placeholder="Link to certificate/diploma"
                            value={qualificationForm.documentUrl}
                            onChange={(e) => setQualificationForm({ ...qualificationForm, documentUrl: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleAddQualification} className="w-full" disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Add Qualification
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingQualifications ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : qualifications.length === 0 ? (
                  <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No qualifications added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {qualifications.map((qual) => (
                      <div
                        key={qual.id}
                        className="p-4 border border-[var(--color-border)] rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <GraduationCap className="h-5 w-5 text-[var(--color-primary)]" />
                              <h4 className="font-semibold text-[var(--color-foreground)]">
                                {qual.degree}
                              </h4>
                            </div>
                            <p className="text-sm text-[var(--color-muted-foreground)]">{qual.institution}</p>
                            {qual.year && (
                              <p className="text-sm text-[var(--color-muted-foreground)]">Year: {qual.year}</p>
                            )}
                            {qual.documentUrl && (
                              <Button
                                size="sm"
                                variant="link"
                                className="p-0 h-auto mt-2"
                                onClick={() => window.open(qual.documentUrl!, "_blank")}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                View Certificate
                              </Button>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteQualification(qual.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consultation Requests</CardTitle>
                <CardDescription>Manage incoming video and text consultation requests</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRequests ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : consultationRequests.length === 0 ? (
                  <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No consultation requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultationRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 border border-[var(--color-border)] rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {request.requestType === "video" ? (
                                <Video className="h-5 w-5 text-blue-600" />
                              ) : (
                                <MessageSquare className="h-5 w-5 text-green-600" />
                              )}
                              <h4 className="font-semibold text-[var(--color-foreground)]">
                                {request.requestType === "video" ? "Video" : "Text"} Consultation
                              </h4>
                              <Badge variant={
                                request.status === "pending" ? "secondary" :
                                request.status === "accepted" ? "default" : "destructive"
                              }>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-[var(--color-muted-foreground)]">
                              Client: {request.clientName || request.clientEmail || "Unknown"}
                            </p>
                            {request.preferredDate && (
                              <p className="text-sm text-[var(--color-muted-foreground)] flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Preferred: {new Date(request.preferredDate).toLocaleDateString()}
                                {request.preferredTime && ` at ${request.preferredTime}`}
                              </p>
                            )}
                            {request.message && (
                              <p className="text-sm mt-2 bg-gray-50 p-2 rounded">{request.message}</p>
                            )}
                          </div>
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600"
                                onClick={() => handleUpdateRequestStatus(request.id, "accepted")}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600"
                                onClick={() => handleUpdateRequestStatus(request.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4" />
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

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Availability</CardTitle>
                      <CardDescription>Set your available time slots</CardDescription>
                    </div>
                    <Dialog open={showAddAvailability} onOpenChange={setShowAddAvailability}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Slot
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Availability</DialogTitle>
                          <DialogDescription>Set your available time for appointments</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Day of Week</Label>
                            <Select
                              value={availabilityForm.dayOfWeek}
                              onValueChange={(value) => setAvailabilityForm({ ...availabilityForm, dayOfWeek: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DAYS_OF_WEEK.map((day, index) => (
                                  <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Start Time</Label>
                              <Input
                                type="time"
                                value={availabilityForm.startTime}
                                onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Time</Label>
                              <Input
                                type="time"
                                value={availabilityForm.endTime}
                                onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
                              />
                            </div>
                          </div>
                          <Button onClick={handleAddAvailability} className="w-full" disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Add Availability
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingAvailability ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                    </div>
                  ) : availability.length === 0 ? (
                    <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No availability set</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availability.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                            <span className="font-medium">{DAYS_OF_WEEK[slot.dayOfWeek]}</span>
                            <span className="text-[var(--color-muted-foreground)]">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAvailability(slot.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled consultations</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAppointments ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming appointments</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-3 border border-[var(--color-border)] rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{apt.clientName || "Client"}</span>
                                <Badge variant={
                                  apt.status === "scheduled" ? "default" :
                                  apt.status === "completed" ? "secondary" : "destructive"
                                }>
                                  {apt.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-[var(--color-muted-foreground)]">
                                {new Date(apt.startTime).toLocaleString()}
                              </p>
                              <p className="text-sm text-[var(--color-muted-foreground)]">
                                Type: {apt.appointmentType}
                              </p>
                            </div>
                            {apt.status === "scheduled" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateAppointmentStatus(apt.id, "completed")}
                              >
                                Complete
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

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track your earnings and payouts</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPayments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No payment records yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${payment.status === "completed" ? "bg-green-100" : "bg-yellow-100"}`}>
                            <DollarSign className={`h-5 w-5 ${payment.status === "completed" ? "text-green-600" : "text-yellow-600"}`} />
                          </div>
                          <div>
                            <p className="font-medium">${(payment.amount / 100).toFixed(2)}</p>
                            <p className="text-sm text-[var(--color-muted-foreground)]">
                              {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "Pending"}
                            </p>
                          </div>
                        </div>
                        <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Records</CardTitle>
                <CardDescription>View your client history and records</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No client records yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...new Set(appointments.map(a => a.clientId))].map((clientId) => {
                      const clientAppointments = appointments.filter(a => a.clientId === clientId);
                      const latestAppointment = clientAppointments[0];
                      return (
                        <div
                          key={clientId}
                          className="p-4 border border-[var(--color-border)] rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>
                                    {(latestAppointment.clientName || "C").charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold">{latestAppointment.clientName || "Client"}</h4>
                                  {latestAppointment.clientEmail && (
                                    <p className="text-sm text-[var(--color-muted-foreground)] flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {latestAppointment.clientEmail}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-[var(--color-muted-foreground)]">
                                Total appointments: {clientAppointments.length}
                              </p>
                              <p className="text-sm text-[var(--color-muted-foreground)]">
                                Last visit: {new Date(latestAppointment.startTime).toLocaleDateString()}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              View History
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
      </div>
    </div>
  );
}
