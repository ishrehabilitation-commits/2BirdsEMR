import { Database, ExternalLink, FlaskConical } from "lucide-react";
import { Card, PageHeader } from "@/components/ui/card";

export const metadata = { title: "Finish setup" };

const REPO = "https://github.com/ishrehabilitation-commits/2BirdsEMR/blob/main";

const steps = [
  {
    title: "Open the Supabase SQL Editor",
    body: "Supabase dashboard → your project → SQL Editor → New query.",
    href: "https://supabase.com/dashboard/project/_/sql/new",
  },
  {
    title: "Create the tables",
    body: "Copy the whole migration file, paste it into the editor and click Run.",
    href: `${REPO}/supabase/migrations/20261025000000_initial_schema.sql`,
  },
  {
    title: "Load the fictional demo agency",
    body: "Run seed.sql the same way. It also adds any account you already created to the demo agency.",
    href: `${REPO}/supabase/seed.sql`,
  },
  { title: "Come back and refresh", body: "Your dashboard fills in with the demo patients, orders and audits." },
];

/** Shown when Supabase is connected but its tables don't exist yet. */
export default function SetupPage() {
  return (
    <>
      <PageHeader
        title="Almost there: set up the database"
        description="Supabase is connected, but its tables haven't been created yet. It's a one-time, two-paste job, easiest from a computer."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <header className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Database className="size-4 text-accent-text" aria-hidden />
            <h2 className="text-sm font-semibold">Set up Supabase</h2>
          </header>
          <ol className="divide-y divide-border">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4 px-5 py-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{s.title}</div>
                  <p className="mt-0.5 text-sm text-muted">{s.body}</p>
                  {s.href && (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent-text hover:underline"
                    >
                      Open <ExternalLink className="size-3" aria-hidden />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="h-fit">
          <header className="flex items-center gap-2 border-b border-border px-5 py-4">
            <FlaskConical className="size-4 text-accent-text" aria-hidden />
            <h2 className="text-sm font-semibold">Just want the demo?</h2>
          </header>
          <div className="space-y-2 px-5 py-4 text-sm text-muted">
            <p>Switch back to built-in fake data with no database or login:</p>
            <p>
              In Vercel, open <span className="font-medium text-text">Settings → Environment Variables</span>, add{" "}
              <code className="rounded bg-surface-2 px-1 py-0.5 text-xs text-text">NEXT_PUBLIC_DEMO_MODE</code> with the value{" "}
              <code className="rounded bg-surface-2 px-1 py-0.5 text-xs text-text">true</code>, then redeploy.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
