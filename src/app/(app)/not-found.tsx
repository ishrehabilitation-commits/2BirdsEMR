import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-xl font-semibold">We couldn&apos;t find that</h1>
      <p className="mt-2 text-sm text-muted">Press ⌘K and type what you&apos;re looking for.</p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-accent-text hover:underline">
        Back to Today
      </Link>
    </div>
  );
}
