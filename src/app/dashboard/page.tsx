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
  LogOut
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface UserProfile {
  id: number;
  userId: string;
  phone: string | null;
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
  id: number;
  userId: string;
  conditionName: string;
  diagnosisDate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Medication {
  id: number;
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
  id: number;
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
  id: number;
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

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [insuranceData, setInsuranceData] = useState<Insurance[]>([]);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingMeds, setIsLoadingMeds] = useState(true);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isLoadingInsurance, setIsLoadingInsurance] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});
  
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

  // Redirect if not authenticated
  useEffect(() => {
    // Check if we have a token in localStorage as a hint
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem("bearer_token");
    
    if (!isPending) {
      if (!session?.user && !hasToken) {
        // Only redirect if we've given the session a chance to load
        const timeoutId = setTimeout(() => {
          if (!session?.user && !localStorage.getItem("bearer_token")) {
            router.push("/login?redirect=/dashboard");
          }
        }, 1000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [session, isPending, router]);

  // Fetch all data
  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchMedicalHistory();
      fetchMedications();
      fetchDocuments();
      fetchInsurance();
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
      const response = await fetch("/api/user-profile", {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setProfileForm(data);
      } else if (response.status === 404) {
        // Profile doesn't exist yet, that's okay
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchMedicalHistory = async () => {
    try {
      const response = await fetch("/api/medical-history", {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setMedicalHistory(data);
      }
    } catch (error) {
      console.error("Error fetching medical history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchMedications = async () => {
    try {
      const response = await fetch("/api/medications", {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setMedications(data);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
    } finally {
      setIsLoadingMeds(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/medical-documents", {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const fetchInsurance = async () => {
    try {
      const response = await fetch("/api/insurance", {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsuranceData(data);
      }
    } catch (error) {
      console.error("Error fetching insurance:", error);
    } finally {
      setIsLoadingInsurance(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user-profile", {
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

  const handleAddCondition = async () => {
    if (!conditionForm.conditionName.trim()) {
      toast.error("Please enter a condition name");
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch("/api/medical-history", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(conditionForm)
      });
      
      if (response.ok) {
        toast.success("Condition added successfully");
        setShowAddCondition(false);
        setConditionForm({ conditionName: "", diagnosisDate: "", status: "active", notes: "" });
        fetchMedicalHistory();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add condition");
      }
    } catch (error) {
      toast.error("An error occurred");
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
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(medicationForm)
      });
      
      if (response.ok) {
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
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add medication");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDocument = async () => {
    if (!documentForm.documentName.trim() || !documentForm.fileUrl.trim()) {
      toast.error("Please enter document name and file URL");
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch("/api/medical-documents", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(documentForm)
      });
      
      if (response.ok) {
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
        fetchDocuments();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add document");
      }
    } catch (error) {
      toast.error("An error occurred");
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
      const response = await fetch("/api/insurance", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(insuranceForm)
      });
      
      if (response.ok) {
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
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add insurance");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCondition = async (id: number) => {
    try {
      const response = await fetch(`/api/medical-history/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        toast.success("Condition deleted");
        fetchMedicalHistory();
      } else {
        toast.error("Failed to delete condition");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteMedication = async (id: number) => {
    try {
      const response = await fetch(`/api/medications/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        toast.success("Medication deleted");
        fetchMedications();
      } else {
        toast.error("Failed to delete medication");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      const response = await fetch(`/api/medical-documents/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        toast.success("Document deleted");
        fetchDocuments();
      } else {
        toast.error("Failed to delete document");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteInsurance = async (id: number) => {
    try {
      const response = await fetch(`/api/insurance/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        toast.success("Insurance deleted");
        fetchInsurance();
      } else {
        toast.error("Failed to delete insurance");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] relative">
      {/* Background Image with 20% opacity */}
      <div 
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/professional-photograph-of-a-person-fill-f0c94809-20251120130450.jpg)'
        }}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-bold text-[var(--color-primary)]">HealthHere</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-muted-foreground)] hidden md:inline">
              Welcome, {session.user.name}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold text-[var(--color-foreground)] mb-2">
            Medical Dashboard
          </h2>
          <p className="text-[var(--color-muted-foreground)]">
            Manage your health information and medical records
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Heart className="h-4 w-4" />
              Medical History
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-2">
              <Pill className="h-4 w-4" />
              Medications
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="insurance" className="gap-2">
              <Shield className="h-4 w-4" />
              Insurance
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your profile and contact details</CardDescription>
                  </div>
                  {!isEditingProfile ? (
                    <Button onClick={() => setIsEditingProfile(true)} size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => setIsEditingProfile(false)} size="sm" variant="outline">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} size="sm" disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
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
                    {/* Profile Photo */}
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
                    </div>

                    <Separator />

                    {/* Basic Info */}
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
                        <Label>Phone Number</Label>
                        <Input
                          placeholder="Enter phone number"
                          value={profileForm.phone || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={profileForm.dateOfBirth || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select
                          value={profileForm.gender || ""}
                          onValueChange={(value) => setProfileForm({ ...profileForm, gender: value })}
                          disabled={!isEditingProfile}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Blood Type</Label>
                        <Select
                          value={profileForm.bloodType || ""}
                          onValueChange={(value) => setProfileForm({ ...profileForm, bloodType: value })}
                          disabled={!isEditingProfile}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Height (cm)</Label>
                        <Input
                          type="number"
                          placeholder="Enter height"
                          value={profileForm.height || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, height: parseInt(e.target.value) || null })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Weight (kg)</Label>
                        <Input
                          type="number"
                          placeholder="Enter weight"
                          value={profileForm.weight || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, weight: parseInt(e.target.value) || null })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Address */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Address</h3>
                      <div className="space-y-2">
                        <Label>Street Address</Label>
                        <Input
                          placeholder="Enter street address"
                          value={profileForm.address || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            placeholder="Enter city"
                            value={profileForm.city || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                            disabled={!isEditingProfile}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input
                            placeholder="Enter state"
                            value={profileForm.state || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                            disabled={!isEditingProfile}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Postal Code</Label>
                          <Input
                            placeholder="Enter postal code"
                            value={profileForm.postalCode || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                            disabled={!isEditingProfile}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Emergency Contact */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Emergency Contact</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Contact Name</Label>
                          <Input
                            placeholder="Enter name"
                            value={profileForm.emergencyContactName || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, emergencyContactName: e.target.value })}
                            disabled={!isEditingProfile}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Contact Phone</Label>
                          <Input
                            placeholder="Enter phone"
                            value={profileForm.emergencyContactPhone || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })}
                            disabled={!isEditingProfile}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Relationship</Label>
                          <Input
                            placeholder="e.g., Spouse, Parent, Sibling"
                            value={profileForm.emergencyContactRelationship || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, emergencyContactRelationship: e.target.value })}
                            disabled={!isEditingProfile}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medical History</CardTitle>
                    <CardDescription>Track your health conditions and diagnoses</CardDescription>
                  </div>
                  <Dialog open={showAddCondition} onOpenChange={setShowAddCondition}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Condition
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Medical Condition</DialogTitle>
                        <DialogDescription>Enter details about a health condition</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Condition Name *</Label>
                          <Input
                            placeholder="e.g., Hypertension"
                            value={conditionForm.conditionName}
                            onChange={(e) => setConditionForm({ ...conditionForm, conditionName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Diagnosis Date</Label>
                          <Input
                            type="date"
                            value={conditionForm.diagnosisDate}
                            onChange={(e) => setConditionForm({ ...conditionForm, diagnosisDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={conditionForm.status}
                            onValueChange={(value) => setConditionForm({ ...conditionForm, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="managed">Managed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            placeholder="Additional information..."
                            value={conditionForm.notes}
                            onChange={(e) => setConditionForm({ ...conditionForm, notes: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <Button onClick={handleAddCondition} className="w-full" disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Add Condition
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : medicalHistory.length === 0 ? (
                  <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No medical history recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medicalHistory.map((condition) => (
                      <div
                        key={condition.id}
                        className="p-4 border border-[var(--color-border)] rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-[var(--color-foreground)]">
                                {condition.conditionName}
                              </h4>
                              <Badge variant={condition.status === "active" ? "destructive" : "secondary"}>
                                {condition.status}
                              </Badge>
                            </div>
                            {condition.diagnosisDate && (
                              <p className="text-sm text-[var(--color-muted-foreground)] flex items-center gap-1 mb-1">
                                <Calendar className="h-3 w-3" />
                                Diagnosed: {new Date(condition.diagnosisDate).toLocaleDateString()}
                              </p>
                            )}
                            {condition.notes && (
                              <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
                                {condition.notes}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCondition(condition.id)}
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

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Medications</CardTitle>
                    <CardDescription>Manage your prescriptions and treatments</CardDescription>
                  </div>
                  <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medication
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Medication</DialogTitle>
                        <DialogDescription>Enter details about a medication</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="space-y-2">
                          <Label>Medication Name *</Label>
                          <Input
                            placeholder="e.g., Lisinopril"
                            value={medicationForm.medicationName}
                            onChange={(e) => setMedicationForm({ ...medicationForm, medicationName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Dosage *</Label>
                          <Input
                            placeholder="e.g., 10mg"
                            value={medicationForm.dosage}
                            onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Frequency *</Label>
                          <Input
                            placeholder="e.g., Once daily"
                            value={medicationForm.frequency}
                            onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Start Date *</Label>
                          <Input
                            type="date"
                            value={medicationForm.startDate}
                            onChange={(e) => setMedicationForm({ ...medicationForm, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={medicationForm.endDate}
                            onChange={(e) => setMedicationForm({ ...medicationForm, endDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Prescribing Doctor</Label>
                          <Input
                            placeholder="Dr. Smith"
                            value={medicationForm.prescribingDoctor}
                            onChange={(e) => setMedicationForm({ ...medicationForm, prescribingDoctor: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            placeholder="Additional information..."
                            value={medicationForm.notes}
                            onChange={(e) => setMedicationForm({ ...medicationForm, notes: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <Button onClick={handleAddMedication} className="w-full" disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Add Medication
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingMeds ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : medications.length === 0 ? (
                  <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                    <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No medications recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medications.map((medication) => (
                      <div
                        key={medication.id}
                        className="p-4 border border-[var(--color-border)] rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-[var(--color-foreground)]">
                                {medication.medicationName}
                              </h4>
                              <Badge variant={medication.isActive ? "default" : "secondary"}>
                                {medication.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-[var(--color-muted-foreground)]">
                              <p><strong>Dosage:</strong> {medication.dosage}</p>
                              <p><strong>Frequency:</strong> {medication.frequency}</p>
                              <p className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Started: {new Date(medication.startDate).toLocaleDateString()}
                              </p>
                              {medication.endDate && (
                                <p className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Ends: {new Date(medication.endDate).toLocaleDateString()}
                                </p>
                              )}
                              {medication.prescribingDoctor && (
                                <p><strong>Prescribed by:</strong> {medication.prescribingDoctor}</p>
                              )}
                              {medication.notes && (
                                <p className="mt-2">{medication.notes}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMedication(medication.id)}
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

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medical Documents</CardTitle>
                    <CardDescription>Upload and manage reports, prescriptions, and scans</CardDescription>
                  </div>
                  <Dialog open={showAddDocument} onOpenChange={setShowAddDocument}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Medical Document</DialogTitle>
                        <DialogDescription>Add a new document to your medical records</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Document Name *</Label>
                          <Input
                            placeholder="e.g., Blood Test Results"
                            value={documentForm.documentName}
                            onChange={(e) => setDocumentForm({ ...documentForm, documentName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Document Type *</Label>
                          <Select
                            value={documentForm.documentType}
                            onValueChange={(value) => setDocumentForm({ ...documentForm, documentType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="report">Medical Report</SelectItem>
                              <SelectItem value="prescription">Prescription</SelectItem>
                              <SelectItem value="scan">Scan/Imaging</SelectItem>
                              <SelectItem value="xray">X-Ray</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>File URL *</Label>
                          <Input
                            placeholder="https://example.com/document.pdf"
                            value={documentForm.fileUrl}
                            onChange={(e) => setDocumentForm({ ...documentForm, fileUrl: e.target.value })}
                          />
                          <p className="text-xs text-[var(--color-muted-foreground)]">
                            Enter the URL where your document is hosted
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Upload Date</Label>
                          <Input
                            type="date"
                            value={documentForm.uploadDate}
                            onChange={(e) => setDocumentForm({ ...documentForm, uploadDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            placeholder="Additional information..."
                            value={documentForm.notes}
                            onChange={(e) => setDocumentForm({ ...documentForm, notes: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <Button onClick={handleAddDocument} className="w-full" disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Upload Document
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDocs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {documents.map((document) => (
                      <div
                        key={document.id}
                        className="p-4 border border-[var(--color-border)] rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                            <h4 className="font-semibold text-[var(--color-foreground)]">
                              {document.documentName}
                            </h4>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDocument(document.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="space-y-1 text-sm text-[var(--color-muted-foreground)]">
                          <p>
                            <Badge variant="outline">{document.documentType}</Badge>
                          </p>
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                          </p>
                          {document.fileSize && (
                            <p>Size: {(document.fileSize / 1024).toFixed(2)} KB</p>
                          )}
                          {document.notes && (
                            <p className="mt-2">{document.notes}</p>
                          )}
                          <Button
                            size="sm"
                            variant="link"
                            className="p-0 h-auto mt-2"
                            onClick={() => window.open(document.fileUrl, "_blank")}
                          >
                            View Document →
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insurance Tab */}
          <TabsContent value="insurance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Insurance Information</CardTitle>
                    <CardDescription>Manage your health insurance policies</CardDescription>
                  </div>
                  <Dialog open={showAddInsurance} onOpenChange={setShowAddInsurance}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Insurance
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Insurance Policy</DialogTitle>
                        <DialogDescription>Enter your insurance coverage details</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="space-y-2">
                          <Label>Insurance Provider *</Label>
                          <Input
                            placeholder="e.g., Blue Cross Blue Shield"
                            value={insuranceForm.providerName}
                            onChange={(e) => setInsuranceForm({ ...insuranceForm, providerName: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Policy Number *</Label>
                            <Input
                              placeholder="Policy #"
                              value={insuranceForm.policyNumber}
                              onChange={(e) => setInsuranceForm({ ...insuranceForm, policyNumber: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Group Number</Label>
                            <Input
                              placeholder="Group #"
                              value={insuranceForm.groupNumber}
                              onChange={(e) => setInsuranceForm({ ...insuranceForm, groupNumber: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Policy Holder Name *</Label>
                          <Input
                            placeholder="Full name as it appears on card"
                            value={insuranceForm.policyHolderName}
                            onChange={(e) => setInsuranceForm({ ...insuranceForm, policyHolderName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Relationship to Holder</Label>
                          <Input
                            placeholder="e.g., Self, Spouse, Child"
                            value={insuranceForm.relationshipToHolder}
                            onChange={(e) => setInsuranceForm({ ...insuranceForm, relationshipToHolder: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Expiration Date</Label>
                          <Input
                            type="date"
                            value={insuranceForm.expirationDate}
                            onChange={(e) => setInsuranceForm({ ...insuranceForm, expirationDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            placeholder="Additional information..."
                            value={insuranceForm.notes}
                            onChange={(e) => setInsuranceForm({ ...insuranceForm, notes: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <Button onClick={handleAddInsurance} className="w-full" disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Add Insurance
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingInsurance ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : insuranceData.length === 0 ? (
                  <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No insurance information recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insuranceData.map((policy) => (
                      <div
                        key={policy.id}
                        className="p-4 border border-[var(--color-border)] rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-5 w-5 text-[var(--color-primary)]" />
                              <h4 className="font-semibold text-[var(--color-foreground)]">
                                {policy.providerName}
                              </h4>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 text-sm">
                              <div className="space-y-1">
                                <p><span className="text-[var(--color-muted-foreground)]">Policy #:</span> {policy.policyNumber}</p>
                                {policy.groupNumber && (
                                  <p><span className="text-[var(--color-muted-foreground)]">Group #:</span> {policy.groupNumber}</p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p><span className="text-[var(--color-muted-foreground)]">Holder:</span> {policy.policyHolderName}</p>
                                {policy.relationshipToHolder && (
                                  <p><span className="text-[var(--color-muted-foreground)]">Relationship:</span> {policy.relationshipToHolder}</p>
                                )}
                              </div>
                            </div>
                            {policy.expirationDate && (
                              <p className="text-sm mt-2 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-[var(--color-muted-foreground)]">Expires:</span> {new Date(policy.expirationDate).toLocaleDateString()}
                              </p>
                            )}
                            {policy.notes && (
                              <p className="text-sm mt-3 pt-3 border-t border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                                {policy.notes}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteInsurance(policy.id)}
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
        </Tabs>
      </div>
    </div>
  );
}