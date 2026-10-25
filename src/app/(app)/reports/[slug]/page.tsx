import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PinButton } from "@/components/pin-button";
import { Card, PageHeader, Skeleton } from "@/components/ui/card";
import { getDataset } from "@/lib/data";
import { runReport } from "@/lib/reports";
import { findReport, REPORTS } from "@/lib/reports-catalog";
import { todayISO } from "@/lib/time";
import { ExportButton } from "./export-button";
import { ReportTableView } from "./report-table";

export function generateStaticParams() {
  return REPORTS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/reports/[slug]">) {
  const { slug } = await params;
  return { title: findReport(slug)?.title ?? "Report" };
}

export default async function ReportPage({ params }: PageProps<"/reports/[slug]">) {
  const { slug } = await params;
  const meta = findReport(slug);
  if (!meta) notFound();

  return (
    <>
      <Link href="/reports" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft className="size-4" aria-hidden /> All reports
      </Link>
      <PageHeader title={meta.title} description={meta.description} actions={<PinButton slug={slug} withLabel />} />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Report slug={slug} />
      </Suspense>
    </>
  );
}

async function Report({ slug }: { slug: string }) {
  const table = runReport(slug, await getDataset(), todayISO());
  if (!table) notFound();
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <p className="text-sm text-muted">{table.summary}</p>
        <ExportButton table={table} filename={slug} />
      </div>
      <ReportTableView table={table} />
    </Card>
  );
}
