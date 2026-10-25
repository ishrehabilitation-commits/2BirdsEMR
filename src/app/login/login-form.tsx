"use client";

import { useActionState, useState } from "react";
import { signIn, type AuthState } from "./actions";

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="mode" value={mode} />
      <input
        name="email"
        type="email"
        required
        placeholder="you@agency.com"
        autoComplete="email"
        className="h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm outline-none focus:border-accent"
      />
      <input
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="Password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        className="h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm outline-none focus:border-accent"
      />
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
      {state.message && <p className="text-xs text-success">{state.message}</p>}
      <button
        disabled={pending}
        className="h-11 w-full rounded-xl bg-accent text-sm font-medium text-white disabled:opacity-60 dark:text-slate-950"
      >
        {pending ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="w-full text-center text-xs text-muted hover:text-text"
      >
        {mode === "signin" ? "New here? Create an account" : "Have an account? Sign in"}
      </button>
    </form>
  );
}
