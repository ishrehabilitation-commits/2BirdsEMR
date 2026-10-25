import clsx from "clsx";
import type { Discipline } from "@/lib/types";

const colors: Record<Discipline, string> = {
  PT: "bg-teal-500",
  PTA: "bg-teal-400",
  OT: "bg-violet-500",
  COTA: "bg-violet-400",
  SLP: "bg-amber-500",
  RN: "bg-sky-500",
  LPN: "bg-sky-400",
  HHA: "bg-rose-400",
  MSW: "bg-slate-400",
};

export function DisciplineDot({ discipline, className }: { discipline: Discipline; className?: string }) {
  return <span className={clsx("inline-block size-2 shrink-0 rounded-full", colors[discipline], className)} aria-hidden />;
}

export function DisciplineTag({ discipline }: { discipline: Discipline }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-muted">
      <DisciplineDot discipline={discipline} />
      {discipline}
    </span>
  );
}
