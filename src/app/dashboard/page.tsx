"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

interface UserProfile {
  id: string;
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

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

  useEffect(() => {
    setMounted(true);

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        router.push("/login?redirect=/dashboard");
      }
      setIsPending(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
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
      fetchMedicalHistory();
      fetchMedications();
      fetchDocuments();
      fetchInsurance();
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

      // Get medical profile info
      const { data: medProfile } = await supabase
        .from('client_medical_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (coreProfile || medProfile) {
        const merged: UserProfile = {
          id: user.id,
          userId: user.id,
          phone: coreProfile?.phone || null,
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

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateMedicalProfile(profileForm);
      await fetchProfile();
      setIsEditingProfile(false);
      toast.success("Profile updated successfully");
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
      await addMedicalCondition(conditionForm);
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
      await addMedication(medicationForm);
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
    if (!documentForm.documentName.trim() || !documentForm.fileUrl.trim()) {
      toast.error("Please enter document name and file URL");
      return;
    }

    setIsSaving(true);
    try {
      await addMedicalDocument(documentForm);
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
      await addInsurance(insuranceForm);
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
      await deleteMedicalCondition(id);
      toast.success("Condition deleted");
      fetchMedicalHistory();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete condition");
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      await deleteMedication(id);
      toast.success("Medication deleted");
      fetchMedications();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete medication");
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteMedicalDocument(id);
      toast.success("Document deleted");
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete document");
    }
  };

  const handleDeleteInsurance = async (id: string) => {
    try {
      await deleteInsurance(id);
      toast.success("Insurance deleted");
      fetchInsurance();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete insurance");
    }
  };

  if (isPending || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  // The rest of the UI (JSX) remains largely the same, but using the updated data
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] relative">
      <div
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/professional-photograph-of-a-person-fill-f0c94809-20251120130450.jpg)'
        }}
      />

      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-bold text-[var(--color-primary)]">HealthHere</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-muted-foreground)] hidden md:inline">
              Welcome, {user.user_metadata?.name || user.email}
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Heart className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-2">
              <Pill className="h-4 w-4" />
              Meds
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              Docs
            </TabsTrigger>
            <TabsTrigger value="insurance" className="gap-2">
              <Shield className="h-4 w-4" />
              Shield
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
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileForm.profilePhotoUrl || undefined} />
                        <AvatarFallback className="bg-[var(--color-primary)] text-white text-2xl">
                          {(user.user_metadata?.name || user.email)?.charAt(0).toUpperCase()}
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={user.user_metadata?.name || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user.email || ""} disabled />
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medical Conditions</CardTitle>
                    <CardDescription>Your diagnosed conditions and health status</CardDescription>
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
                        <DialogDescription>Enter the details of your medical condition.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Condition Name</Label>
                          <Input
                            placeholder="e.g. Hypertension"
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
                            onValueChange={(v) => setConditionForm({ ...conditionForm, status: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="chronic">Chronic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            placeholder="Additional details..."
                            value={conditionForm.notes}
                            onChange={(e) => setConditionForm({ ...conditionForm, notes: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddCondition(false)}>Cancel</Button>
                        <Button onClick={handleAddCondition} disabled={isSaving}>
                          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
                  <p className="text-center py-8 text-[var(--color-muted-foreground)]">No conditions recorded.</p>
                ) : (
                  <div className="space-y-4">
                    {medicalHistory.map((item) => (
                      <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold">{item.conditionName}</h4>
                            <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{item.status}</Badge>
                          </div>
                          <p className="text-sm text-[var(--color-muted-foreground)]">Diagnosed: {item.diagnosisDate || "Unknown"}</p>
                          {item.notes && <p className="text-sm mt-2">{item.notes}</p>}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCondition(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
                    <CardDescription>Track your active prescriptions and vitamins</CardDescription>
                  </div>
                  <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medication
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Medication</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Medication Name</Label>
                          <Input value={medicationForm.medicationName} onChange={e => setMedicationForm({ ...medicationForm, medicationName: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Dosage</Label>
                            <Input value={medicationForm.dosage} onChange={e => setMedicationForm({ ...medicationForm, dosage: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Input value={medicationForm.frequency} onChange={e => setMedicationForm({ ...medicationForm, frequency: e.target.value })} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="date" value={medicationForm.startDate} onChange={e => setMedicationForm({ ...medicationForm, startDate: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date (Optional)</Label>
                            <Input type="date" value={medicationForm.endDate} onChange={e => setMedicationForm({ ...medicationForm, endDate: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Prescribing Doctor</Label>
                          <Input value={medicationForm.prescribingDoctor} onChange={e => setMedicationForm({ ...medicationForm, prescribingDoctor: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea value={medicationForm.notes} onChange={e => setMedicationForm({ ...medicationForm, notes: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddMedication(false)}>Cancel</Button>
                        <Button onClick={handleAddMedication} disabled={isSaving}>Add Medication</Button>
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
                  <p className="text-center py-8 text-[var(--color-muted-foreground)]">No medications listed.</p>
                ) : (
                  <div className="space-y-4">
                    {medications.map((med) => (
                      <div key={med.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold">{med.medicationName}</h4>
                            <Badge variant={med.isActive ? 'outline' : 'secondary'}>{med.isActive ? 'Active' : 'Inactive'}</Badge>
                          </div>
                          <p className="text-sm">{med.dosage} - {med.frequency}</p>
                          <p className="text-sm text-[var(--color-muted-foreground)]">Started: {med.startDate}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteMedication(med.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            {/* Similar structure for Documents fetched directly from Supabase */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Medical Documents</CardTitle>
                  <Button size="sm" onClick={() => setShowAddDocument(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDocs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-center py-8 text-[var(--color-muted-foreground)]">No documents uploaded.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-bold truncate max-w-[150px]">{doc.documentName}</p>
                            <p className="text-xs text-[var(--color-muted-foreground)]">{doc.documentType}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer">Open</a>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc.id)}>
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

          {/* Insurance Tab */}
          <TabsContent value="insurance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Insurance Policies</CardTitle>
                  <Button size="sm" onClick={() => setShowAddInsurance(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingInsurance ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : insuranceData.length === 0 ? (
                  <p className="text-center py-8 text-[var(--color-muted-foreground)]">No insurance plans linked.</p>
                ) : (
                  <div className="space-y-4">
                    {insuranceData.map((ins) => (
                      <div key={ins.id} className="p-4 border rounded-lg relative">
                        <Button variant="ghost" size="sm" className="absolute top-4 right-4" onClick={() => handleDeleteInsurance(ins.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs uppercase text-[var(--color-muted-foreground)]">Provider</p>
                            <p className="font-bold">{ins.providerName}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-[var(--color-muted-foreground)]">Policy #</p>
                            <p className="font-bold">{ins.policyNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-[var(--color-muted-foreground)]">Policy Holder</p>
                            <p className="font-bold">{ins.policyHolderName}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-[var(--color-muted-foreground)]">Expires</p>
                            <p className="font-bold">{ins.expirationDate || 'N/A'}</p>
                          </div>
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