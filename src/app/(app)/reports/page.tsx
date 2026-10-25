import { PageHeader } from "@/components/ui/card";
import { ReportCatalog } from "./report-catalog";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Every report in one place, in plain English. Search by what you need, pin the ones you use, export any of them to CSV."
      />
      <ReportCatalog />
    </>
  );
}
