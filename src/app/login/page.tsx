import { Bird } from "lucide-react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  if (!isSupabaseConfigured) redirect("/");

  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-white dark:text-slate-950">
            <Bird className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="font-semibold">2Birds</h1>
            <p className="text-xs text-muted">Fictional demo data only. Never enter real patient info.</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
