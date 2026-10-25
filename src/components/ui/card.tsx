import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

export function Card({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={clsx("min-w-0 rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  href,
  action,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action ??
        (href && (
          <Link href={href} className="shrink-0 text-xs font-medium text-accent-text hover:underline">
            View all
          </Link>
        ))}
    </header>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-5 py-10 text-center text-sm text-muted">{children}</p>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton", className)} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
