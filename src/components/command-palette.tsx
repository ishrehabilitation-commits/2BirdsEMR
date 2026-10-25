"use client";

import { Command } from "cmdk";
import { FileText, MessageSquarePlus, Moon, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { searchPatients, type PatientHit } from "@/app/actions";
import { openFeedback, toggleTheme } from "@/lib/client-store";
import { NAV } from "@/lib/nav";
import { REPORTS } from "@/lib/reports-catalog";

const itemClass =
  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text outline-none transition-colors";

/**
 * Press ⌘K / Ctrl+K (or "/") anywhere to jump to any page, report, patient or
 * action by typing what you want, instead of remembering where it lives.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<PatientHit[]>([]);
  const [searching, startSearch] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("2birds:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("2birds:open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const t = setTimeout(() => startSearch(async () => setPatients(await searchPatients(query))), 150);
    return () => clearTimeout(t);
  }, [query]);

  const changeQuery = (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) setPatients([]);
  };

  const run = (fn: () => void) => {
    setOpen(false);
    changeQuery("");
    fn();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Search 2Birds"
      overlayClassName="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px]"
      contentClassName="fixed inset-x-3 top-[12vh] z-50 mx-auto max-w-xl animate-pop-in overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search className="size-4 text-muted" aria-hidden />
        <Command.Input
          value={query}
          onValueChange={changeQuery}
          placeholder="Search patients, reports, pages…"
          className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
        />
        <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">Esc</kbd>
      </div>

      <Command.List className="max-h-[60vh] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-8 text-center text-sm text-muted">
          {searching ? "Searching…" : "Nothing matches. Try a patient name, MRN, or a word like “orders”."}
        </Command.Empty>

        {patients.length > 0 && (
          <Command.Group heading="Patients">
            {patients.map((p) => (
              <Command.Item
                key={p.id}
                value={`patient ${p.name} ${p.mrn} ${p.detail} ${query}`}
                onSelect={() => run(() => router.push(`/patients/${p.id}`))}
                className={itemClass}
              >
                <User className="size-4 text-muted" aria-hidden />
                <span className="font-medium">{p.name}</span>
                <span className="truncate text-xs text-muted">
                  {p.mrn} · {p.detail}
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        <Command.Group heading="Go to">
          {NAV.map((item) => (
            <Command.Item
              key={item.href}
              value={`${item.label} ${item.hint}`}
              keywords={item.keywords}
              onSelect={() => run(() => router.push(item.href))}
              className={itemClass}
            >
              <item.icon className="size-4 text-muted" aria-hidden />
              <span className="font-medium">{item.label}</span>
              <span className="truncate text-xs text-muted">{item.hint}</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Reports">
          {REPORTS.map((r) => (
            <Command.Item
              key={r.slug}
              value={`${r.title} ${r.description}`}
              keywords={[r.category, ...r.keywords]}
              onSelect={() => run(() => router.push(`/reports/${r.slug}`))}
              className={itemClass}
            >
              <FileText className="size-4 text-muted" aria-hidden />
              <span className="font-medium">{r.title}</span>
              <span className="truncate text-xs text-muted">{r.category}</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Actions">
          <Command.Item value="Toggle dark mode theme" onSelect={() => run(toggleTheme)} className={itemClass}>
            <Moon className="size-4 text-muted" aria-hidden />
            Toggle dark mode
          </Command.Item>
          <Command.Item value="Send feedback idea suggestion bug" onSelect={() => run(openFeedback)} className={itemClass}>
            <MessageSquarePlus className="size-4 text-muted" aria-hidden />
            Send feedback or an idea
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
