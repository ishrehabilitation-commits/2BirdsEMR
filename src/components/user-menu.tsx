import { LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { getCurrentUserName } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function UserMenu() {
  const name = await getCurrentUserName();
  const initials = name
    .split(/[\s._-]+/)
    .map((w) => w[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-muted sm:inline">{name}</span>
      <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text">
        {initials}
      </span>
      {isSupabaseConfigured && (
        <form action={signOut}>
          <button aria-label="Sign out" title="Sign out" className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-text">
            <LogOut className="size-4" />
          </button>
        </form>
      )}
    </div>
  );
}
