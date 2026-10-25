"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-24 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{error.message}</p>
      <button onClick={reset} className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white dark:text-slate-950">
        Try again
      </button>
    </div>
  );
}
