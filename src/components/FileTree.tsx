import { useState } from "react";
import {
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  BrainCircuit,
} from "lucide-react";
import type { FileEntry } from "@/lib/api";
import { cn } from "@/lib/utils";

const FOLDER_ORDER = ["Wiki", "Questions", "Digests"];

interface FileTreeProps {
  files: FileEntry[];
  loading: boolean;
  activeFile: string | null;
  onSelect: (name: string) => void;
  className?: string;
  onNavigate?: () => void;
}

export function FileTree({
  files,
  loading,
  activeFile,
  onSelect,
  className,
  onNavigate,
}: FileTreeProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const folders = FOLDER_ORDER.map((folder) => ({
    folder,
    files: files.filter((f) => f.folder === folder),
  }));

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar md:w-56 xl:w-64",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15">
          <BrainCircuit className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            File Browser
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            local vault
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {loading ? (
          <div className="space-y-2 px-2 pt-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-6 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : (
          folders.map(({ folder, files: folderFiles }) => (
            <div key={folder} className="mb-1">
              <button
                onClick={() => setOpen((o) => ({ ...o, [folder]: !o[folder] }))}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-sidebar-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-150",
                    open[folder] && "rotate-90",
                  )}
                />
                {open[folder] ? (
                  <FolderOpen className="h-3.5 w-3.5 text-primary/80" />
                ) : (
                  <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="font-mono">{folder}</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">
                  {folderFiles.length}
                </span>
              </button>

              {open[folder] && (
                <div className="ml-4 border-l border-border pl-2">
                  {folderFiles.map((file) => {
                    const active = activeFile === file.name;
                    return (
                      <button
                        key={file.name}
                         onClick={() => {
                           onSelect(file.name);
                           onNavigate?.();
                         }}
                        className={cn(
                          "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                          active
                            ? "bg-sidebar-active text-primary"
                            : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <FileText
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            active ? "text-primary" : "text-muted-foreground/70",
                          )}
                        />
                        <span className="truncate font-mono">
                          {file.name.replace(/\.md$/, "")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <p className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/70">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          read-only · local vault
        </p>
      </div>
    </aside>
  );
}
