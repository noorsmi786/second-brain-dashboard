import { BrainCircuit, FolderTree, LayoutDashboard, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewKey = "dashboard" | "chat" | "files";

const ITEMS: { key: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "chat", label: "AI Chat", icon: MessageSquare },
  { key: "files", label: "File Browser", icon: FolderTree },
];

interface NavRailProps {
  view: ViewKey;
  onChange: (view: ViewKey) => void;
  className?: string;
}

export function NavRail({ view, onChange, className }: NavRailProps) {
  return (
    <nav
      className={cn(
        "flex h-full w-56 shrink-0 flex-col border-r border-border bg-sidebar",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15">
          <BrainCircuit className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">
            Second Brain
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            knowledge base
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-1 px-2 py-3">
        {ITEMS.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                active
                  ? "bg-sidebar-active text-primary"
                  : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-border px-4 py-3">
        <p className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/70">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          read-only · local vault
        </p>
      </div>
    </nav>
  );
}
