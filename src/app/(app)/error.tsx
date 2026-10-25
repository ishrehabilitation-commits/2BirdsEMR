"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-24 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        {/* Production hides server error details; the digest matches the Vercel logs. */}
        {error.digest ? `Error reference ${error.digest}. Check the Vercel logs for details.` : error.message}
      </p>
      <button onClick={reset} className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white dark:text-slate-950">
        Try again
      </button>
    </div>
  );
}
