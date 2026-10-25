import {
  CalendarDays,
  ClipboardCheck,
  FileSignature,
  LayoutDashboard,
  LineChart,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  /** Fits the mobile tab bar. */
  short: string;
  /** One plain-English line so nobody has to memorize where things live. */
  hint: string;
  icon: LucideIcon;
  keywords: string[];
}

export const NAV: NavItem[] = [
  { href: "/", label: "Today", short: "Today", hint: "Your dashboard: visits, orders and audits that need you", icon: LayoutDashboard, keywords: ["home", "dashboard"] },
  { href: "/patients", label: "Patients", short: "Patients", hint: "Find any patient and their chart", icon: Users, keywords: ["census", "chart", "client"] },
  { href: "/schedule", label: "Schedule", short: "Schedule", hint: "Visits for the week, by day", icon: CalendarDays, keywords: ["calendar", "visits", "agenda"] },
  { href: "/orders", label: "Orders & hotlist", short: "Orders", hint: "Unsigned physician orders, grouped by doctor", icon: FileSignature, keywords: ["physician hotlist", "485", "signatures", "doctor"] },
  { href: "/audits", label: "Form audits", short: "Audits", hint: "Documentation that needs a correction", icon: ClipboardCheck, keywords: ["qa", "oasis", "review", "compliance"] },
  { href: "/reports", label: "Reports", short: "Reports", hint: "Every report in one searchable place", icon: LineChart, keywords: ["analytics", "export"] },
];
