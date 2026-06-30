"use client";

import { useMemo, useState } from "react";
import { Clock, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { isValidHourlyAvailabilityWindow } from "@/lib/booking/slots";
import {
  deleteAvailability,
  patchAvailabilitySlot,
  updateAvailability,
} from "@/features/professional/actions";
import { dashboardPrimaryButton } from "./dashboard-theme";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Monday-first display order (dayOfWeek indices). */
const WEEK_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export type ProfessionalAvailabilitySlot = {
  id: string;
  professionalId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

type SlotFormState = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

function toInputTime(value: string): string {
  return value.slice(0, 5);
}

function formatTimeLabel(value: string): string {
  const [h, m] = toInputTime(value).split(":").map(Number);
  const date = new Date(2000, 0, 1, h || 0, m || 0);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function durationLabel(startTime: string, endTime: string): string {
  const [sh, sm] = toInputTime(startTime).split(":").map(Number);
  const [eh, em] = toInputTime(endTime).split(":").map(Number);
  const minutes = (eh * 60 + em) - (sh * 60 + sm);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
}

type ProfessionalAvailabilityPanelProps = {
  availability: ProfessionalAvailabilitySlot[];
  isLoading: boolean;
  onChanged: () => void;
};

export function ProfessionalAvailabilityPanel({
  availability,
  isLoading,
  onChanged,
}: ProfessionalAvailabilityPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<SlotFormState>({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  });

  const scheduledDaySet = useMemo(
    () => new Set(availability.map((slot) => slot.dayOfWeek)),
    [availability]
  );

  const sortedSlots = useMemo(
    () =>
      [...availability].sort(
        (a, b) =>
          WEEK_DISPLAY_ORDER.indexOf(a.dayOfWeek as (typeof WEEK_DISPLAY_ORDER)[number]) -
          WEEK_DISPLAY_ORDER.indexOf(b.dayOfWeek as (typeof WEEK_DISPLAY_ORDER)[number])
      ),
    [availability]
  );

  const availableDayIndices = useMemo(() => {
    const taken = new Set(availability.map((s) => s.dayOfWeek));
    if (editingSlotId) {
      const editing = availability.find((s) => s.id === editingSlotId);
      if (editing) taken.delete(editing.dayOfWeek);
    }
    return DAYS_OF_WEEK.map((_, index) => index).filter((index) => !taken.has(index));
  }, [availability, editingSlotId]);

  const openAddDialog = (dayOfWeek?: number) => {
    setEditingSlotId(null);
    setForm({
      dayOfWeek: dayOfWeek ?? availableDayIndices[0] ?? 1,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (slot: ProfessionalAvailabilitySlot) => {
    setEditingSlotId(slot.id);
    setForm({
      dayOfWeek: slot.dayOfWeek,
      startTime: toInputTime(slot.startTime),
      endTime: toInputTime(slot.endTime),
      isAvailable: slot.isAvailable,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!isValidHourlyAvailabilityWindow(form.startTime, form.endTime)) {
      toast.error("End time must be at least 1 hour after start (24-hour format).");
      return;
    }

    setIsSaving(true);
    try {
      if (editingSlotId) {
        const result = await patchAvailabilitySlot({
          id: editingSlotId,
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          isAvailable: form.isAvailable,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Availability updated");
      } else {
        if (scheduledDaySet.has(form.dayOfWeek)) {
          toast.error(`${DAYS_OF_WEEK[form.dayOfWeek]} is already scheduled.`);
          return;
        }
        const result = await updateAvailability(form);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Availability added");
      }
      setDialogOpen(false);
      onChanged();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not save availability");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteAvailability(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Day removed from availability");
      onChanged();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not delete slot");
    } finally {
      setDeletingId(null);
    }
  };

  const dayOptions =
    editingSlotId != null
      ? [...new Set([form.dayOfWeek, ...availableDayIndices])].sort((a, b) => a - b)
      : availableDayIndices;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
      <div className="rounded-2xl border border-lp-outline-variant/25 bg-gradient-to-br from-lp-brand/5 via-white to-lp-surface-container-low/40 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold text-lp-cta-bg">Weekly availability</h2>
            <p className="max-w-xl text-sm text-lp-on-surface-variant">
              Set the days and hours patients can book you. Changes apply to new bookings and your
              schedule view.
            </p>
          </div>
          <Button
            type="button"
            className={cn("cursor-pointer rounded-xl", dashboardPrimaryButton)}
            disabled={availableDayIndices.length === 0 && editingSlotId == null}
            onClick={() => openAddDialog()}
          >
            <Plus className="mr-2 size-4" />
            Add day
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2">
          {WEEK_DISPLAY_ORDER.map((dayIndex) => {
            const slot = availability.find((s) => s.dayOfWeek === dayIndex);
            const active = Boolean(slot?.isAvailable);
            return (
              <button
                key={dayIndex}
                type="button"
                onClick={() => {
                  if (slot) openEditDialog(slot);
                  else if (!scheduledDaySet.has(dayIndex)) openAddDialog(dayIndex);
                }}
                className={cn(
                  "flex flex-col items-center rounded-xl border px-1 py-3 text-center transition-all",
                  slot
                    ? active
                      ? "border-lp-brand/40 bg-lp-brand/10 shadow-sm"
                      : "border-lp-outline-variant/30 bg-lp-surface-container-low/60"
                    : "border-dashed border-lp-outline-variant/35 bg-white hover:border-lp-brand/30 hover:bg-lp-brand/5"
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">
                  {SHORT_DAYS[dayIndex]}
                </span>
                {slot ? (
                  <>
                    <span className="mt-1 font-heading text-xs font-bold text-lp-brand">
                      {toInputTime(slot.startTime)}
                    </span>
                    <span className="text-[10px] text-lp-on-surface-variant">
                      {toInputTime(slot.endTime)}
                    </span>
                  </>
                ) : (
                  <Plus className="mt-2 size-4 text-lp-on-surface-variant/50" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-lp-outline-variant/25 bg-white shadow-md">
        <div className="border-b border-lp-outline-variant/20 px-6 py-4">
          <h3 className="font-heading text-lg font-bold text-lp-cta-bg">Your working hours</h3>
          <p className="text-sm text-lp-on-surface-variant">
            Edit times or remove a day. One slot per day.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-10 animate-spin text-lp-brand" />
          </div>
        ) : sortedSlots.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Clock className="mx-auto mb-3 size-10 text-lp-brand/40" aria-hidden />
            <p className="font-heading font-semibold text-lp-on-surface">No availability set yet</p>
            <p className="mt-1 text-sm text-lp-on-surface-variant">
              Add at least one day so patients can book consultations with you.
            </p>
            <Button
              type="button"
              className={cn("mt-6 cursor-pointer rounded-xl", dashboardPrimaryButton)}
              onClick={() => openAddDialog()}
            >
              <Plus className="mr-2 size-4" />
              Add your first day
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-lp-outline-variant/15">
            {sortedSlots.map((slot) => (
              <li
                key={slot.id}
                className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-lp-brand/10 font-heading text-sm font-bold text-lp-brand">
                    <span className="text-[10px] uppercase">{SHORT_DAYS[slot.dayOfWeek]}</span>
                    <span className="text-xs">{DAYS_OF_WEEK[slot.dayOfWeek].slice(0, 3)}</span>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="font-heading font-bold text-lp-on-surface">
                      {DAYS_OF_WEEK[slot.dayOfWeek]}
                    </p>
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-lp-brand">
                      <Clock className="size-4 shrink-0" aria-hidden />
                      {formatTimeLabel(slot.startTime)} – {formatTimeLabel(slot.endTime)}
                      <span className="text-lp-on-surface-variant">
                        · {durationLabel(slot.startTime, slot.endTime)}
                      </span>
                    </p>
                    {!slot.isAvailable ? (
                      <Badge variant="outline" className="rounded-full text-[10px] uppercase">
                        Unavailable
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer rounded-xl"
                    onClick={() => openEditDialog(slot)}
                  >
                    <Pencil className="mr-1.5 size-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer rounded-xl text-lp-on-surface-variant hover:bg-red-50 hover:text-red-600"
                    disabled={deletingId === slot.id}
                    onClick={() => handleDelete(slot.id)}
                    aria-label={`Remove ${DAYS_OF_WEEK[slot.dayOfWeek]}`}
                  >
                    {deletingId === slot.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editingSlotId ? "Edit availability" : "Add availability"}
            </DialogTitle>
            <DialogDescription>
              {editingSlotId
                ? "Update the day or hours for this weekly slot."
                : "Choose a day and your working hours. Patients can book within this window."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label>Day</Label>
              <Select
                value={form.dayOfWeek.toString()}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, dayOfWeek: parseInt(value, 10) }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {dayOptions.map((index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {DAYS_OF_WEEK[index]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avail-start">Start</Label>
                <Input
                  id="avail-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avail-end">End</Label>
                <Input
                  id="avail-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-lp-outline-variant/25 bg-lp-surface-container-low/40 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-lp-on-surface">Accept bookings</p>
                <p className="text-xs text-lp-on-surface-variant">
                  Turn off to block new bookings on this day
                </p>
              </div>
              <Switch
                checked={form.isAvailable}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isAvailable: checked }))
                }
              />
            </div>

            <Button
              type="button"
              className={cn("h-11 w-full cursor-pointer rounded-xl", dashboardPrimaryButton)}
              disabled={isSaving || dayOptions.length === 0}
              onClick={handleSave}
            >
              {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {editingSlotId ? "Save changes" : "Add to schedule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
