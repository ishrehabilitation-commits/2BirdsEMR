import { Suspense } from "react";
import { CommandPalette } from "@/components/command-palette";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { Sidebar } from "@/components/sidebar";
import { SearchButton } from "@/components/topbar";
import { UserMenu } from "@/components/user-menu";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {!isSupabaseConfigured && (
          <div className="bg-accent-soft px-4 py-1.5 text-center text-xs font-medium text-accent-text">
            Demo mode · every patient, doctor and clinician here is fictional
          </div>
        )}
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-bg/85 px-4 py-3 backdrop-blur md:px-8">
          <SearchButton />
          <div className="ml-auto">
            <Suspense fallback={<div className="skeleton size-9 rounded-full" />}>
              <UserMenu />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-24 md:px-8 md:pb-10">{children}</main>
      </div>
      <CommandPalette />
      <FeedbackDialog />
    </div>
  );
}
