"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { submitFeedback } from "@/app/actions";

const moods = [
  { value: -1, emoji: "😕", label: "Frustrating" },
  { value: 0, emoji: "😐", label: "Okay" },
  { value: 1, emoji: "😀", label: "Love it" },
] as const;

/** Lets anyone tell us what to fix or build next, from any page. */
export function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sentiment, setSentiment] = useState<-1 | 0 | 1>(0);
  const [status, setStatus] = useState<"idle" | "sent" | string>("idle");
  const [pending, startTransition] = useTransition();

  const [pathname, setPathname] = useState("");

  useEffect(() => {
    const onOpen = () => {
      setPathname(window.location.pathname);
      setOpen(true);
      setStatus("idle");
    };
    window.addEventListener("2birds:open-feedback", onOpen);
    return () => window.removeEventListener("2birds:open-feedback", onOpen);
  }, []);

  if (!open) return null;

  const send = () =>
    startTransition(async () => {
      const res = await submitFeedback({ message, sentiment, page: pathname });
      if (res.ok) {
        setStatus("sent");
        setMessage("");
        setTimeout(() => setOpen(false), 1400);
      } else {
        setStatus(res.error);
      }
    });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]" onClick={() => setOpen(false)}>
      <div
        role="dialog"
        aria-label="Send feedback"
        className="w-full max-w-md animate-pop-in rounded-2xl border border-border bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">What should we make better?</h2>
          <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 text-muted hover:bg-surface-2">
            <X className="size-4" />
          </button>
        </div>

        {status === "sent" ? (
          <p className="py-6 text-center text-sm">Thanks! Every note shapes what we build next. 🐦</p>
        ) : (
          <>
            <div className="mb-3 flex gap-2">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSentiment(m.value)}
                  className={clsx(
                    "flex flex-1 flex-col items-center gap-1 rounded-xl border py-2 text-xs transition-colors",
                    sentiment === m.value ? "border-accent bg-accent-soft text-accent-text" : "border-border text-muted hover:bg-surface-2",
                  )}
                >
                  <span className="text-xl">{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
            <textarea
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="An idea, an annoyance, a report you can never find…"
              className="w-full resize-none rounded-xl border border-border bg-bg p-3 text-sm outline-none focus:border-accent"
            />
            {status !== "idle" && <p className="mt-2 text-xs text-danger">{status}</p>}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted">Sent with this page: {pathname}</span>
              <button
                onClick={send}
                disabled={pending || !message.trim()}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:text-slate-950"
              >
                {pending ? "Sending…" : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
