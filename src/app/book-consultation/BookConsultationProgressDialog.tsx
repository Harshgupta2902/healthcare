"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  bookConsultationMeetingCreateLinkStep,
  bookConsultationMeetingEmailConsultantStep,
  bookConsultationMeetingEmailPatientStep,
  bookConsultationMeetingSaveStep,
  bookConsultationMeetingValidateStep,
  submitGuestAppointment,
} from "./actions";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

const startedPipelineLocks = new Set<string>();

type StepStatus = "pending" | "running" | "done" | "error";

type BookingStep = {
  id: string;
  label: string;
  detail?: string;
  status: StepStatus;
  durationMs?: number;
  error?: string;
};

export type BookingPipelinePayload = {
  firstName: string;
  lastName: string;
  age: number;
  phone: string;
  email: string;
  category: string;
  state: string;
  city: string;
  date: string;
  time: string;
  message: string;
  professionalId: string;
  deviceHash: string;
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "running") {
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />;
  }
  if (status === "done") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />;
  }
  if (status === "error") {
    return <XCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden />;
  }
  return <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden />;
}

export type BookConsultationProgressDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: BookingPipelinePayload | null;
  patientLabel: string;
  sessionKey: number;
  onComplete: (appointmentId: string) => void;
};

export function BookConsultationProgressDialog({
  open,
  onOpenChange,
  payload,
  patientLabel,
  sessionKey,
  onComplete,
}: BookConsultationProgressDialogProps) {
  const [steps, setSteps] = useState<BookingStep[]>([]);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineDone, setPipelineDone] = useState(false);
  const runIdRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const patchStep = useCallback((id: string, patch: Partial<BookingStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const execStep = useCallback(
    async <T extends { success: boolean }>(
      id: string,
      fn: () => Promise<T>,
      detail?: (result: Extract<T, { success: true }>) => string | undefined,
    ): Promise<Extract<T, { success: true }> | null> => {
      const start = performance.now();
      patchStep(id, { status: "running", error: undefined, detail: undefined });
      const res = await fn();
      const durationMs = performance.now() - start;
      if (!res.success) {
        patchStep(id, {
          status: "error",
          durationMs,
          error: "error" in res && typeof res.error === "string" ? res.error : "Step failed",
        });
        return null;
      }
      const ok = res as Extract<T, { success: true }>;
      patchStep(id, {
        status: "done",
        durationMs,
        detail: detail?.(ok),
      });
      return ok;
    },
    [patchStep],
  );

  useEffect(() => {
    if (!open || !payload) return;

    const lockKey = `${sessionKey}`;
    if (startedPipelineLocks.has(lockKey)) return;
    startedPipelineLocks.add(lockKey);

    const runId = ++runIdRef.current;
    setSteps([
      { id: "save", label: "Save booking", status: "pending" },
      { id: "validate", label: "Validate appointment", status: "pending" },
      { id: "create-link", label: "Create meeting link", status: "pending" },
    ]);
    setAppointmentId(null);
    setProviderLabel(null);
    setIsRunning(true);
    setPipelineDone(false);

    const isStale = () => runId !== runIdRef.current;

    ;(async () => {
      const saveRes = await execStep("save", async () => {
        const res = await submitGuestAppointment(payload);
        if ("error" in res && res.error) {
          return {
            success: false as const,
            error: typeof res.error === "string" ? res.error : "Could not save booking.",
          };
        }
        return { success: true as const, id: (res as { success: true; id: string }).id };
      });
      if (isStale() || !saveRes) {
        setIsRunning(false);
        return;
      }

      const bookedId = saveRes.id;
      setAppointmentId(bookedId);

      const validateRes = await execStep("validate", () =>
        bookConsultationMeetingValidateStep({ guestAppointmentId: bookedId }),
      );
      if (isStale() || !validateRes) {
        setIsRunning(false);
        return;
      }

      patchStep("validate", {
        detail: `${validateRes.patientName} · ${validateRes.consultantName}`,
      });

      const linkRes = await execStep(
        "create-link",
        () => bookConsultationMeetingCreateLinkStep({ guestAppointmentId: bookedId }),
        (r) => r.providerLabel,
      );
      if (isStale() || !linkRes) {
        setIsRunning(false);
        return;
      }

      const { meetUrl, provider, providerLabel: provLabel } = linkRes;
      setProviderLabel(provLabel);

      const persistPayload = {
        guestAppointmentId: bookedId,
        meetUrl,
        provider,
      };

      if (provider === "google") {
        setSteps((prev) => [
          ...prev,
          { id: "google-invites", label: "Send calendar invites (Google)", status: "pending" },
          { id: "save-link", label: "Save meeting link", status: "pending" },
        ]);

        const inviteDetail = `Invites sent to ${validateRes.patientEmail} and ${validateRes.consultantEmail}`;
        await execStep(
          "google-invites",
          async () => ({ success: true as const }),
          () => inviteDetail,
        );
        if (isStale()) return;

        const saveLinkRes = await execStep("save-link", () =>
          bookConsultationMeetingSaveStep(persistPayload),
        );
        if (isStale() || !saveLinkRes) {
          setIsRunning(false);
          return;
        }
      } else {
        setSteps((prev) => [
          ...prev,
          { id: "email-patient", label: "Email invite to patient", status: "pending" },
          { id: "email-consultant", label: "Email invite to consultant", status: "pending" },
          { id: "save-link", label: "Save meeting link", status: "pending" },
        ]);

        const patientRes = await execStep(
          "email-patient",
          () => bookConsultationMeetingEmailPatientStep(persistPayload),
          (r) => (r.skipped ? "Skipped (Google path)" : `Sent to ${r.sentTo}`),
        );
        if (isStale() || !patientRes) {
          setIsRunning(false);
          return;
        }

        const consultantRes = await execStep(
          "email-consultant",
          () => bookConsultationMeetingEmailConsultantStep(persistPayload),
          (r) => (r.skipped ? "Skipped (Google path)" : `Sent to ${r.sentTo}`),
        );
        if (isStale() || !consultantRes) {
          setIsRunning(false);
          return;
        }

        const saveLinkRes = await execStep("save-link", () =>
          bookConsultationMeetingSaveStep(persistPayload),
        );
        if (isStale() || !saveLinkRes) {
          setIsRunning(false);
          return;
        }
      }

      setPipelineDone(true);
      setIsRunning(false);
      onCompleteRef.current(bookedId);
    })().finally(() => {
      if (!isStale()) startedPipelineLocks.delete(lockKey);
    });

    return () => {
      runIdRef.current += 1;
      startedPipelineLocks.delete(lockKey);
    };
  }, [open, payload, sessionKey, patchStep, execStep]);

  const hasError = steps.some((s) => s.status === "error");
  const canContinue = Boolean(appointmentId) && (pipelineDone || hasError) && !isRunning;
  const canDismiss = canContinue;

  const blockDismiss = (e: Event) => {
    if (!canDismiss) e.preventDefault();
  };

  const handleContinue = () => {
    if (!appointmentId || !canDismiss) return;
    onCompleteRef.current(appointmentId);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && !canDismiss) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md rounded-2xl"
        showCloseButton={canDismiss}
        onPointerDownOutside={blockDismiss}
        onInteractOutside={blockDismiss}
        onFocusOutside={blockDismiss}
        onEscapeKeyDown={blockDismiss}
      >
        <DialogHeader>
          <DialogTitle className="font-heading">Setting up your consultation</DialogTitle>
          <DialogDescription>
            {patientLabel}
            {providerLabel ? ` · ${providerLabel}` : appointmentId ? " · Creating meeting & sending invites" : " · Please wait"}
          </DialogDescription>
        </DialogHeader>

        <ol className="space-y-3 max-h-[min(50vh,320px)] overflow-y-auto pr-1" aria-live="polite">
          {steps.map((step) => (
            <li
              key={step.id}
              className={cn(
                "flex gap-3 rounded-xl border p-3 text-sm transition-colors",
                step.status === "running" && "border-primary/30 bg-primary/5",
                step.status === "done" && "border-emerald-500/20 bg-emerald-500/5",
                step.status === "error" && "border-red-500/30 bg-red-500/5",
                step.status === "pending" && "border-border/60 bg-muted/30",
              )}
            >
              <StepIcon status={step.status} />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium leading-snug">{step.label}</p>
                  {step.durationMs != null && step.status !== "pending" ? (
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatDuration(step.durationMs)}
                    </span>
                  ) : null}
                </div>
                {step.detail ? (
                  <p className="text-xs text-muted-foreground break-words">{step.detail}</p>
                ) : null}
                {step.error ? (
                  <p className="text-xs text-red-600 dark:text-red-400">{step.error}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <DialogFooter className="gap-2 sm:gap-0">
          {isRunning ? (
            <p className="text-xs text-muted-foreground mr-auto flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Creating meeting and sending invites…
            </p>
          ) : null}
          {canDismiss && hasError ? (
            <Button type="button" variant="outline" className="rounded-xl" onClick={handleContinue}>
              Continue to confirmation
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
