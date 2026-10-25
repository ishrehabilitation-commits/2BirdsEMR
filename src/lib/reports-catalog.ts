// Every report in one searchable list. Safe to import from client components
// (the command palette searches it). The math lives in reports.ts.

export type ReportCategory = "Orders" | "Documentation" | "Scheduling" | "Quality" | "Census";

export interface ReportMeta {
  slug: string;
  title: string;
  description: string;
  category: ReportCategory;
  /** Extra words people might type, including old WellSky-style names. */
  keywords: string[];
}

export const REPORTS: ReportMeta[] = [
  {
    slug: "unsigned-orders",
    title: "Unsigned orders aging",
    description: "Every order sent to a physician and not yet signed, oldest first.",
    category: "Orders",
    keywords: ["485", "plan of care", "signature", "outstanding orders", "order tracking"],
  },
  {
    slug: "physician-hotlist",
    title: "Physician hotlist",
    description: "Which doctors are sitting on the most unsigned orders, with phone and fax.",
    category: "Orders",
    keywords: ["hot list", "doctor", "md", "follow up", "call list"],
  },
  {
    slug: "notes-outstanding",
    title: "Notes not yet submitted",
    description: "Completed visits whose documentation is still a draft, not started, or returned.",
    category: "Documentation",
    keywords: ["late notes", "missing documentation", "incomplete", "returned", "qa"],
  },
  {
    slug: "audit-backlog",
    title: "Form audit backlog",
    description: "Open documentation audits by severity, form type and owner.",
    category: "Quality",
    keywords: ["form audit", "oasis", "qa", "review", "corrections", "compliance"],
  },
  {
    slug: "missed-visits",
    title: "Missed visits",
    description: "Visits marked missed in the last two weeks, so nothing slips through.",
    category: "Scheduling",
    keywords: ["missed visit notice", "mvn", "frequency", "no show"],
  },
  {
    slug: "visits-by-clinician",
    title: "Visits by clinician",
    description: "Completed, upcoming and missed visits per clinician for the current two-week window.",
    category: "Scheduling",
    keywords: ["productivity", "caseload", "therapist", "staff"],
  },
  {
    slug: "recerts-due",
    title: "Recerts and discharges due",
    description: "Active patients whose 60-day episode ends in the next 14 days.",
    category: "Census",
    keywords: ["recertification", "episode end", "eoe", "discharge planning", "60 day"],
  },
  {
    slug: "census-by-payer",
    title: "Census by payer",
    description: "How many patients are on each payer, split by status.",
    category: "Census",
    keywords: ["medicare", "medicaid", "insurance", "payer mix"],
  },
];

export const findReport = (slug: string) => REPORTS.find((r) => r.slug === slug);
