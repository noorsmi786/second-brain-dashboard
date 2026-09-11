import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrainCircuit, Menu, X } from "lucide-react";
import { FileTree } from "@/components/FileTree";
import { ChatPanel } from "@/components/ChatPanel";
import { MarkdownView } from "@/components/MarkdownView";
import { Dashboard } from "@/components/Dashboard";
import { NavRail, type ViewKey } from "@/components/NavRail";
import { getFile, getFiles, type FileEntry } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Second Brain — Knowledge Base" },
      {
        name: "description",
        content:
          "A read-only AI research surface over your local markdown knowledge base. Browse your vault and chat with your notes.",
      },
      { property: "og:title", content: "Second Brain — Knowledge Base" },
      {
        property: "og:description",
        content:
          "A read-only AI research surface over your local markdown knowledge base. Browse your vault and chat with your notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    getFiles()
      .then(setFiles)
      .finally(() => setLoadingFiles(false));
  }, []);

  const openFile = async (name: string) => {
    setView("files");
    setActiveFile(name);
    setFileContent(null);
    setFileContent(await getFile(name));
  };

  const openWikiLink = (target: string) => {
    const match =
      files.find((f) => f.name.replace(/\.md$/, "").toLowerCase() === target.toLowerCase()) ??
      files.find((f) => f.name.toLowerCase().includes(target.toLowerCase()));
    if (match) void openFile(match.name);
  };

  const changeView = (next: ViewKey) => {
    setView(next);
    setMobileNavOpen(false);
    if (next !== "files") setActiveFile(null);
  };

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <NavRail view={view} onChange={changeView} className="hidden md:flex" />

      {view === "files" && (
        <FileTree
          files={files}
          loading={loadingFiles}
          activeFile={activeFile}
          onSelect={openFile}
          className="hidden lg:flex"
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="grid h-14 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-sidebar px-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 items-center justify-center gap-2">
            <BrainCircuit className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate text-sm font-semibold text-foreground">
              Second Brain
            </span>
          </div>
          <div className="h-9 w-9" aria-hidden="true" />
        </header>

        <div className="flex min-h-0 min-w-0 flex-1">
          {view === "dashboard" && (
            <section className="min-w-0 flex-1">
              <Dashboard onOpenFile={openFile} />
            </section>
          )}

          {view === "chat" && (
            <section className="flex min-w-0 flex-1 flex-col">
              <ChatPanel />
            </section>
          )}

          {view === "files" && (
            <>
              <div className="flex min-w-0 flex-1 lg:hidden">
                <FileTree
                  files={files}
                  loading={loadingFiles}
                  activeFile={activeFile}
                  onSelect={openFile}
                  className="w-full border-r-0"
                />
              </div>
              <section className="hidden min-w-0 flex-1 lg:block">
                {activeFile ? (
                  <MarkdownView
                    name={activeFile}
                    content={fileContent}
                    onClose={() => setActiveFile(null)}
                    onWikiLink={openWikiLink}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Select a note from the vault to read it here.
                    </p>
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                      read-only viewer
                    </p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          />
          <div className="relative h-full w-[min(84vw,18rem)] shadow-2xl">
            <NavRail view={view} onChange={changeView} className="w-full" />
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* On phones and tablets an open note becomes a focused reading surface */}
      {activeFile && (
        <div className="fixed inset-0 z-30 bg-background lg:hidden">
          <MarkdownView
            name={activeFile}
            content={fileContent}
            onClose={() => setActiveFile(null)}
            onWikiLink={openWikiLink}
          />
        </div>
      )}
    </div>
  );
}
