import ReactMarkdown from "react-markdown";
import { FileText, X } from "lucide-react";

interface MarkdownViewProps {
  name: string;
  content: string | null;
  onClose: () => void;
  onWikiLink?: (target: string) => void;
}

const WIKI_PREFIX = "#wikilink:";

/** Turn [[Some Note]] into a markdown link the renderer can intercept. */
function linkifyWikilinks(md: string) {
  return md.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_m, target: string, label?: string) =>
      `[${(label ?? target).trim()}](${WIKI_PREFIX}${encodeURIComponent(target.trim())})`,
  );
}

export function MarkdownView({ name, content, onClose, onWikiLink }: MarkdownViewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate font-mono text-xs text-foreground">{name}</span>
          <span className="hidden shrink-0 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
            read-only
          </span>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {content === null ? (
          <div className="space-y-3 px-8 py-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-muted"
                style={{ width: `${85 - i * 15}%` }}
              />
            ))}
          </div>
        ) : (
          <article className="md mx-auto max-w-2xl px-5 py-6 sm:px-8 sm:py-8">
            <ReactMarkdown
              components={{
                a: ({ href, children, ...props }) => {
                  if (href?.startsWith(WIKI_PREFIX)) {
                    const target = decodeURIComponent(href.slice(WIKI_PREFIX.length));
                    return (
                      <button
                        type="button"
                        onClick={() => onWikiLink?.(target)}
                        className="wikilink"
                      >
                        {children}
                      </button>
                    );
                  }
                  return (
                    <a href={href} {...props}>
                      {children}
                    </a>
                  );
                },
              }}
            >
              {linkifyWikilinks(content)}
            </ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
