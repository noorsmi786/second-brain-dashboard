import { useEffect, useState } from "react";
import { Activity, ArrowRight, CalendarDays, HelpCircle, ScrollText } from "lucide-react";
import {
  getFilesByFolder,
  getRecentActivity,
  type ActivityItem,
  type FileEntry,
} from "@/lib/api";

interface DashboardProps {
  onOpenFile: (name: string) => void;
}

const stripExt = (n: string) => n.replace(/\.md$/, "");

export function Dashboard({ onOpenFile }: DashboardProps) {
  const [digests, setDigests] = useState<FileEntry[]>([]);
  const [questions, setQuestions] = useState<FileEntry[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFilesByFolder("digests"),
      getFilesByFolder("questions"),
      getRecentActivity(),
    ])
      .then(([d, q, a]) => {
        setDigests(d);
        setQuestions(q);
        setActivity(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const latest = digests[0];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          overview
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
          Your brain, at a glance
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Everything below is retrieved from the markdown notes in your vault.
        </p>

        {loading ? (
          <div className="mt-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Latest digest */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-[0_0_40px_-18px_var(--glow)] lg:col-span-2">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium text-foreground">Latest digest</h2>
              </div>
              {latest ? (
                <>
                  <p className="mt-4 font-mono text-lg text-foreground">
                    {stripExt(latest.name)}
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Vector search tuning dominated this week&apos;s notes, with recurring
                    interest in hybrid ranking. Two follow-ups were suggested.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenFile(latest.name)}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-all hover:brightness-110"
                  >
                    Read digest
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No digests yet.</p>
              )}
            </section>

            {/* Recent activity */}
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium text-foreground">Recent activity</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                    <div className="min-w-0">
                      <p className="text-xs leading-relaxed text-foreground">{a.label}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                        {a.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Open questions */}
            <section className="rounded-xl border border-border bg-card p-5 lg:col-span-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium text-foreground">Open questions</h2>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">
                  unanswered by the AI
                </span>
              </div>
              <ul className="mt-4 divide-y divide-border">
                {questions.slice(0, 3).map((q) => (
                  <li key={q.name}>
                    <button
                      type="button"
                      onClick={() => onOpenFile(q.name)}
                      className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:text-primary"
                    >
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                      <span className="truncate font-mono text-xs text-foreground">
                        {stripExt(q.name)}
                      </span>
                      <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                    </button>
                  </li>
                ))}
                {questions.length === 0 && (
                  <li className="py-3 text-sm text-muted-foreground">
                    No open questions.
                  </li>
                )}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
