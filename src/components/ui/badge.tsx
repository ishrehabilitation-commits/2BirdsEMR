import clsx from "clsx";
import type { ReactNode } from "react";

export type Tone = "neutral" | "accent" | "danger" | "warning" | "success" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  accent: "bg-accent-soft text-accent-text",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const label = (s: string) => s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

const statusTones: Record<string, Tone> = {
  // patients
  active: "success",
  referral: "info",
  on_hold: "warning",
  discharged: "neutral",
  // visits
  scheduled: "info",
  in_progress: "accent",
  completed: "success",
  missed: "danger",
  cancelled: "neutral",
  // notes
  not_started: "warning",
  draft: "warning",
  submitted: "info",
  approved: "success",
  returned: "danger",
  // orders
  sent: "warning",
  signed: "success",
  voided: "neutral",
  // audits
  open: "danger",
  in_review: "warning",
  resolved: "success",
  high: "danger",
  medium: "warning",
  low: "neutral",
};

export function StatusBadge({ status, prefix }: { status: string; prefix?: string }) {
  return (
    <Badge tone={statusTones[status] ?? "neutral"}>
      {prefix}
      {label(status)}
    </Badge>
  );
}
