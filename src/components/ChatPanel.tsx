import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowUp,
  BrainCircuit,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";
import { askQuestion, MOCK_THREADS, type ChatMessage, type ChatThread } from "@/lib/api";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "How does ingestion work?",
  "Summarize my notes on vector search",
  "What chunking strategy am I using?",
  "What did I capture this week?",
];

export function ChatPanel() {
  const [threads, setThreads] = useState<ChatThread[]>(MOCK_THREADS);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [thinking]);

  const newChat = () => {
    setActiveThread(null);
    setMessages([]);
    setInput("");
  };

  const loadThread = (thread: ChatThread) => {
    setActiveThread(thread.id);
    setMessages(thread.messages);
    setInput("");
  };

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || thinking) return;

    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", content: question },
    ]);
    setInput("");
    setThinking(true);

    if (!activeThread) {
      const id = crypto.randomUUID();
      setActiveThread(id);
      setThreads((t) => [
        {
          id,
          title: question.length > 32 ? `${question.slice(0, 32)}…` : question,
          updated: "just now",
          messages: [],
        },
        ...t,
      ]);
    }

    try {
      const answer = await askQuestion(question);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: answer },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Couldn't reach the knowledge base backend. Is the local server running?",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const empty = messages.length === 0;

  return (
    <div className="flex h-full min-h-0">
      {/* chat history */}
      {historyOpen && (
        <div className="hidden w-56 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
          <div className="border-b border-border px-3 py-3">
            <button
              type="button"
              onClick={newChat}
              className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-3">
            <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
              chat history
            </p>
            {threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => loadThread(t)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition-colors",
                  activeThread === t.id
                    ? "bg-sidebar-active text-primary"
                    : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="min-w-0">
                  <span className="block truncate text-xs">{t.title}</span>
                  <span className="block font-mono text-[10px] text-muted-foreground/60">
                    {t.updated}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* header */}
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-3 py-3 sm:px-4">
          <button
            type="button"
            onClick={() => setHistoryOpen((o) => !o)}
            className="hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex"
            aria-label={historyOpen ? "Hide chat history" : "Show chat history"}
          >
            {historyOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <BrainCircuit className="h-4 w-4 shrink-0 text-primary md:hidden" />
            <span className="truncate text-sm font-medium text-foreground">
              Ask your brain
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={newChat}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
              aria-label="New chat"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">
              grounded in your notes
            </span>
          </div>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {empty ? (
            <div className="flex h-full flex-col items-center justify-center px-4 py-6 sm:px-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <BrainCircuit className="h-7 w-7 text-primary" />
              </div>
              <h1 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                Ask your second brain
              </h1>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Every answer is retrieved from the markdown notes in your vault.
              </p>
              <div className="mt-6 grid w-full max-w-md grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:mt-8">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border border-border bg-card px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:px-4 sm:py-3"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8">
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-br-md bg-secondary px-4 py-2.5 text-sm leading-relaxed text-secondary-foreground sm:max-w-[75%]">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15">
                      <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="md min-w-0 flex-1 text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ),
              )}
              {thinking && (
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15">
                    <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5 py-2">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="typing-dot h-1.5 w-1.5 rounded-full bg-primary"
                        style={{ animationDelay: `${i * 0.18}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* composer */}
        <div
          className={cn(
            "px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6",
            empty && "pt-2",
          )}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mx-auto max-w-3xl"
          >
            <div className="rounded-xl border border-input bg-card shadow-[0_0_40px_-10px_var(--glow)] transition-colors focus-within:border-primary/50 sm:rounded-2xl">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask a question about your notes…"
                rows={1}
                className="min-h-12 w-full resize-none bg-transparent px-4 pt-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 sm:min-h-15"
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <span className="hidden px-1 font-mono text-[10px] text-muted-foreground/60 sm:block">
                  Enter to send · Shift+Enter for newline
                </span>
                <button
                  type="submit"
                  disabled={!input.trim() || thinking}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100"
                  aria-label="Send message"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
