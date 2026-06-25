"use client";

import type { ChangeEvent, RefObject } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { PhoneCountryFields } from "@/components/PhoneCountryFields";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  getPhoneCountryOptionByIso2,
  normalizePhoneCountryCode,
  resolveCountryIsoFromDialCode,
} from "@/lib/phone-country-options";
import { formatProfessionalDisplayName, PROFESSIONAL_NAME_TITLES } from "@/lib/professional-name-title";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Camera,
  Check,
  CheckCircle,
  ChevronsUpDown,
  Edit,
  FileText,
  IndianRupee,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Stethoscope,
} from "lucide-react";
import {
  dashboardFieldLabel,
  dashboardGlassCardLg,
  dashboardPrimaryButton,
  dashboardProfileBanner,
  dashboardSectionLabel,
} from "./dashboard-theme";

export type ProfessionalProfileForm = {
  id?: string;
  userId?: string;
  specialization?: string;
  licenseNumber?: string;
  city?: string | null;
  bio?: string | null;
  nameTitle?: string | null;
  yearsOfExperience?: number | null;
  consultationFee?: number | null;
  isVerified?: boolean;
  phone?: string | null;
  phoneCountryCode?: string;
  phoneCountryIso?: string;
  profilePhotoUrl?: string | null;
};

const SPECIALIZATIONS = [
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
] as const;

type ProfessionalProfilePanelProps = {
  user: {
    email?: string | null;
    user_metadata?: { name?: string };
  };
  profile: ProfessionalProfileForm | null;
  profileForm: Partial<ProfessionalProfileForm>;
  setProfileForm: (value: Partial<ProfessionalProfileForm>) => void;
  isEditingProfile: boolean;
  setIsEditingProfile: (value: boolean) => void;
  isLoadingProfile: boolean;
  isSaving: boolean;
  isUploadingImage: boolean;
  profileImageInputRef: RefObject<HTMLInputElement | null>;
  onProfileImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onSaveProfile: () => void;
  onCancelEdit: () => void;
  isSpecializationOpen: boolean;
  setIsSpecializationOpen: (open: boolean) => void;
};

function ProfileStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Briefcase;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-lp-outline-variant/20 bg-white/70 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-lp-brand/10 text-lp-brand">
          <Icon className="size-4" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant">
          {label}
        </span>
      </div>
      <span className="truncate text-right text-sm font-bold text-lp-cta-bg">{value}</span>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Mail;
}) {
  return (
    <div className="rounded-xl border border-lp-outline-variant/20 bg-lp-surface-container-low/40 p-4">
      <div className="mb-1.5 flex items-center gap-2">
        {Icon ? <Icon className="size-3.5 text-lp-brand" /> : null}
        <p className={dashboardFieldLabel}>{label}</p>
      </div>
      <p className="break-words text-sm font-semibold text-lp-cta-bg">{value || "—"}</p>
    </div>
  );
}

export function ProfessionalProfilePanel({
  user,
  profile,
  profileForm,
  setProfileForm,
  isEditingProfile,
  setIsEditingProfile,
  isLoadingProfile,
  isSaving,
  isUploadingImage,
  profileImageInputRef,
  onProfileImageUpload,
  onSaveProfile,
  onCancelEdit,
  isSpecializationOpen,
  setIsSpecializationOpen,
}: ProfessionalProfilePanelProps) {
  const displayName =
    formatProfessionalDisplayName(user.user_metadata?.name || "", profile?.nameTitle) ||
    "Professional";
  const feeInr = Math.floor((profileForm.consultationFee || 0) / 100).toLocaleString("en-IN");
  const phoneDisplay = profileForm.phone
    ? `${profileForm.phoneCountryCode ?? DEFAULT_PHONE_COUNTRY_CODE} ${profileForm.phone}`
    : "—";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 gap-5 sm:gap-8 lg:grid-cols-3">
        <Card className={cn("h-fit lg:col-span-1", dashboardGlassCardLg)}>
          <div className={dashboardProfileBanner} />
          <CardContent className="relative px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
            <div className="-mt-12 mb-5 flex justify-center">
              <div className="relative group">
                <input
                  type="file"
                  ref={profileImageInputRef}
                  onChange={onProfileImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Avatar
                  className="relative h-24 w-24 overflow-hidden shadow-2xl ring-4 ring-white sm:h-28 sm:w-28"
                  onClick={() => !isUploadingImage && profileImageInputRef.current?.click()}
                >
                  <AvatarImage
                    src={profileForm.profilePhotoUrl || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-lp-brand to-lp-brand-bright text-2xl font-bold text-lp-on-brand">
                    {(user.user_metadata?.name || user.email || "P").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                  {isUploadingImage ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  )}
                </Avatar>
                {!isEditingProfile && profile?.isVerified ? (
                  <div className="absolute -bottom-1 -right-1 rounded-full border-4 border-white bg-green-500 p-1 text-white shadow-lg">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mb-6 space-y-2 text-center">
              <h3 className="font-heading text-xl font-bold text-lp-cta-bg">{displayName}</h3>
              <p className="text-sm font-medium text-lp-brand">
                {profileForm.specialization || "Specialization not set"}
              </p>
              {profile?.isVerified ? (
                <Badge className="mt-1 border-green-100 bg-green-50 px-3 font-semibold text-green-700">
                  Verified professional
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="mt-1 border-lp-outline-variant/30 bg-lp-surface-container font-semibold text-lp-on-surface-variant"
                >
                  Verification pending
                </Badge>
              )}
            </div>

            <Separator className="mb-5 bg-lp-outline-variant/30" />

            <div className="space-y-2.5">
              <ProfileStat
                label="Experience"
                value={`${profileForm.yearsOfExperience ?? 0} yrs`}
                icon={Briefcase}
              />
              <ProfileStat label="Consultation" value={`₹${feeInr}`} icon={IndianRupee} />
              <ProfileStat
                label="Location"
                value={profileForm.city || "Not set"}
                icon={MapPin}
              />
              <ProfileStat
                label="License"
                value={profileForm.licenseNumber || "Not set"}
                icon={FileText}
              />
            </div>

            {!isEditingProfile ? (
              <Button
                className={cn("mt-6 w-full rounded-xl", dashboardPrimaryButton)}
                onClick={() => setIsEditingProfile(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit profile
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card className={cn("lg:col-span-2", dashboardGlassCardLg)}>
          <CardHeader className="border-b border-lp-outline-variant/20 pt-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="font-heading text-xl font-bold text-lp-cta-bg">
                  Professional information
                </CardTitle>
                <CardDescription>
                  Practice details patients see when booking consultations
                </CardDescription>
              </div>
              {isEditingProfile ? (
                <div className="flex w-full gap-2 sm:w-auto">
                  <Button
                    onClick={onCancelEdit}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={onSaveProfile}
                    disabled={isSaving}
                    size="sm"
                    className={cn("flex-1 rounded-xl sm:flex-none", dashboardPrimaryButton)}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save changes
                  </Button>
                </div>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
            {isLoadingProfile ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-lp-brand" />
              </div>
            ) : isEditingProfile ? (
              <div className="space-y-8">
                <section className="space-y-4">
                  <p className={dashboardSectionLabel}>Identity</p>
                  <div className="grid min-w-0 gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label className={dashboardFieldLabel}>Profile photo URL</Label>
                      <Input
                        placeholder="Enter image URL"
                        value={profileForm.profilePhotoUrl || ""}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, profilePhotoUrl: e.target.value })
                        }
                        className="rounded-xl border-lp-outline-variant/30"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className={dashboardFieldLabel}>Title & full name</Label>
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
                          <SelectTrigger className="h-11 w-full shrink-0 rounded-none border-0 sm:w-32">
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
                          className="min-w-0 flex-1 rounded-none border-0 border-t border-lp-outline-variant/30 bg-lp-surface-container-low/50 sm:border-l sm:border-t-0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className={dashboardFieldLabel}>Email</Label>
                      <Input
                        value={user.email || ""}
                        disabled
                        className="rounded-xl border-lp-outline-variant/30 bg-lp-surface-container-low/50"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className={dashboardSectionLabel}>Practice</p>
                  <div className="grid min-w-0 gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label className={dashboardFieldLabel}>Specialization *</Label>
                      <Popover open={isSpecializationOpen} onOpenChange={setIsSpecializationOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between rounded-xl"
                          >
                            {profileForm.specialization || "Select specialization"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] rounded-xl p-0">
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
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        profileForm.specialization === spec
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
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
                      <Label className={dashboardFieldLabel}>License number</Label>
                      <Input
                        placeholder="Medical license"
                        value={profileForm.licenseNumber || ""}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, licenseNumber: e.target.value })
                        }
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={dashboardFieldLabel}>City</Label>
                      <Input
                        placeholder="Primary practice location"
                        value={profileForm.city || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={dashboardFieldLabel}>Years of experience</Label>
                      <Input
                        type="number"
                        min="0"
                        onKeyDown={(e) =>
                          ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()
                        }
                        value={profileForm.yearsOfExperience ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                          setProfileForm({ ...profileForm, yearsOfExperience: val });
                        }}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={dashboardFieldLabel}>Consultation fee (INR)</Label>
                      <Input
                        type="number"
                        min="0"
                        onKeyDown={(e) =>
                          ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()
                        }
                        placeholder="e.g. 500"
                        value={
                          profileForm.consultationFee != null
                            ? Math.floor((profileForm.consultationFee || 0) / 100)
                            : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                          setProfileForm({
                            ...profileForm,
                            consultationFee: val === null ? null : val * 100,
                          });
                        }}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className={dashboardSectionLabel}>Contact</p>
                  <div className="space-y-2">
                    <Label className={dashboardFieldLabel}>Phone</Label>
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
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <p className={dashboardSectionLabel}>About</p>
                  <Textarea
                    placeholder="Experience, expertise, and approach to care..."
                    value={profileForm.bio || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows={5}
                    className="resize-none rounded-xl border-lp-outline-variant/30"
                  />
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <section className="space-y-4">
                  <p className={dashboardSectionLabel}>Identity</p>
                  <div className="grid min-w-0 gap-4 md:grid-cols-2">
                    <ReadOnlyField
                      label="Full name"
                      value={displayName}
                      icon={Stethoscope}
                    />
                    <ReadOnlyField label="Email" value={user.email || ""} icon={Mail} />
                  </div>
                </section>

                <section className="space-y-4">
                  <p className={dashboardSectionLabel}>Practice</p>
                  <div className="grid min-w-0 gap-4 md:grid-cols-2">
                    <ReadOnlyField
                      label="Specialization"
                      value={profileForm.specialization || ""}
                    />
                    <ReadOnlyField
                      label="License number"
                      value={profileForm.licenseNumber || ""}
                      icon={FileText}
                    />
                    <ReadOnlyField
                      label="Experience"
                      value={`${profileForm.yearsOfExperience ?? 0} years`}
                      icon={Briefcase}
                    />
                    <ReadOnlyField
                      label="Consultation fee"
                      value={`₹${feeInr} INR`}
                      icon={IndianRupee}
                    />
                    <ReadOnlyField
                      label="City"
                      value={profileForm.city || ""}
                      icon={MapPin}
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <p className={dashboardSectionLabel}>Contact</p>
                  <ReadOnlyField label="Phone" value={phoneDisplay} icon={Phone} />
                </section>

                <section className="space-y-4">
                  <p className={dashboardSectionLabel}>About</p>
                  <div className="rounded-xl border border-lp-outline-variant/20 bg-lp-surface-container-low/40 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-lp-on-surface">
                      {profileForm.bio?.trim() || "No professional bio added yet."}
                    </p>
                  </div>
                </section>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
