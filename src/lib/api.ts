/**
 * API layer for the Second Brain backend.
 *
 * Everything below is MOCKED with dummy data for now.
 * To wire up the real backend, replace each mock body with the marked
 * fetch() call against http://127.0.0.1:8083 — the shapes already match.
 */

export const API_BASE = "http://127.0.0.1:8083";

export interface FileEntry {
  name: string;
  folder: string; // e.g. "Wiki" | "Questions" | "Digests"
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_FILES: FileEntry[] = [
  { folder: "Wiki", name: "Architecture Overview.md" },
  { folder: "Wiki", name: "Vector Search Notes.md" },
  { folder: "Wiki", name: "Embedding Models.md" },
  { folder: "Questions", name: "How does ingestion work.md" },
  { folder: "Questions", name: "Chunking strategy tradeoffs.md" },
  { folder: "Digests", name: "2026-09-10 Daily Digest.md" },
  { folder: "Digests", name: "2026-09-09 Daily Digest.md" },
];

const MOCK_CONTENT: Record<string, string> = {
  "Architecture Overview.md": `# Architecture Overview

The Second Brain pipeline has three stages:

1. **Ingestion** — markdown files are watched on disk and parsed.
2. **Chunking** — documents are split into ~512 token chunks with 15% overlap.
3. **Indexing** — chunks are embedded and stored in a local vector index.

\`\`\`ts
const pipeline = createPipeline({
  watch: "~/brain",
  chunkSize: 512,
  overlap: 0.15,
});
\`\`\`

> The index is rebuilt incrementally — only changed files are re-embedded.

See also [[Vector Search Notes]].`,
  "Vector Search Notes.md": `# Vector Search Notes

Similarity search uses **cosine distance** over normalized embeddings.

- Top-k defaults to \`k = 8\`
- A reranker pass improves precision on ambiguous queries
- Metadata filters (folder, date) are applied *before* vector search

## Open questions

- Should digests be excluded from wiki search?
- Hybrid BM25 + vector ranking?`,
  "Embedding Models.md": `# Embedding Models

| Model | Dims | Notes |
| --- | --- | --- |
| bge-small | 384 | Fast, good enough for notes |
| nomic-embed | 768 | Better recall on code |

Currently running **bge-small** locally. Latency is ~12ms per chunk on CPU.`,
  "How does ingestion work.md": `# How does ingestion work?

**Q:** How does ingestion work?

**A:** A file watcher monitors the vault directory. On change, the file is
hashed; if the hash differs from the indexed version, the document is
re-parsed, re-chunked, and its vectors are replaced atomically.

Deleted files are tombstoned and purged on the next compaction run.`,
  "Chunking strategy tradeoffs.md": `# Chunking strategy tradeoffs

**Q:** Fixed-size vs. semantic chunking?

**A:** Fixed-size chunking is simple and predictable, but can split ideas
mid-paragraph. Semantic chunking preserves coherence at the cost of
irregular chunk sizes and slower indexing.

Current setup: fixed-size with 15% overlap — the pragmatic middle ground.`,
  "2026-09-10 Daily Digest.md": `# Daily Digest — 2026-09-10

## Added

- 3 new wiki notes on retrieval
- 2 questions answered

## Themes

- Vector search tuning dominated today's notes
- Recurring interest in **hybrid ranking**

## Suggested follow-ups

1. Write up reranker comparison
2. Revisit chunk overlap experiment`,
  "2026-09-09 Daily Digest.md": `# Daily Digest — 2026-09-09

## Added

- Architecture overview drafted
- Embedding model benchmark notes

## Themes

- Initial pipeline scaffolding
- Local-first constraints confirmed`,
};

const MOCK_ANSWERS = [
  "Based on your notes, the pipeline embeds ~512 token chunks with 15% overlap and stores them in a local vector index. Cosine similarity with `k = 8` is used for retrieval, followed by a reranker pass on ambiguous queries.",
  "Your wiki mentions two candidate embedding models: **bge-small** (384 dims, currently in use) and **nomic-embed** (768 dims, better code recall). The 2026-09-10 digest suggests writing up a reranker comparison next.",
  "According to the ingestion notes, a file watcher hashes changed files and re-indexes them atomically. Deleted files are tombstoned until the next compaction run.",
  "The chunking tradeoffs note concludes that fixed-size chunking with 15% overlap is the pragmatic middle ground — semantic chunking preserves coherence but slows indexing.",
];

/** GET http://127.0.0.1:8083/api/files */
export async function getFiles(): Promise<FileEntry[]> {
  // REAL: return (await fetch(`${API_BASE}/api/files`)).json();
  await delay(250);
  return MOCK_FILES;
}

/** GET http://127.0.0.1:8083/api/files?folder=digests|questions|wiki */
export async function getFilesByFolder(
  folder: "wiki" | "questions" | "digests",
): Promise<FileEntry[]> {
  // REAL: return (await fetch(`${API_BASE}/api/files?folder=${folder}`)).json();
  await delay(250);
  return MOCK_FILES.filter((f) => f.folder.toLowerCase() === folder);
}

export interface ActivityItem {
  id: string;
  label: string;
  detail: string;
}

/** Dummy recent activity feed */
export async function getRecentActivity(): Promise<ActivityItem[]> {
  await delay(200);
  return [
    { id: "a1", label: "5 new wiki pages added this week", detail: "Wiki" },
    { id: "a2", label: "2 questions answered", detail: "Questions" },
    { id: "a3", label: "1 weekly digest generated", detail: "Digests" },
    { id: "a4", label: "312 chunks re-embedded", detail: "Index" },
  ];
}

export interface ChatThread {
  id: string;
  title: string;
  updated: string;
  messages: ChatMessage[];
}

/** Dummy chat history */
export const MOCK_THREADS: ChatThread[] = [
  {
    id: "t1",
    title: "Mars Rover Budget",
    updated: "2h ago",
    messages: [
      { id: "t1-1", role: "user", content: "What did I note about the Mars rover budget?" },
      {
        id: "t1-2",
        role: "assistant",
        content:
          "Your notes put the rover programme at **$2.4B** across three phases, with the largest slice (48%) going to instrumentation. A follow-up question in `Questions/` is still open about launch-window contingency costs.",
      },
    ],
  },
  {
    id: "t2",
    title: "VPS Setup Query",
    updated: "yesterday",
    messages: [
      { id: "t2-1", role: "user", content: "How did I set up the VPS for the index?" },
      {
        id: "t2-2",
        role: "assistant",
        content:
          "A single 4 vCPU / 8GB box runs the watcher and the vector index. Notes mention `bge-small` on CPU at ~12ms per chunk, so no GPU was provisioned.",
      },
    ],
  },
  {
    id: "t3",
    title: "Chunking tradeoffs",
    updated: "3 days ago",
    messages: [
      { id: "t3-1", role: "user", content: "Fixed-size or semantic chunking?" },
      {
        id: "t3-2",
        role: "assistant",
        content:
          "Your notes settle on fixed-size chunking with 15% overlap as the pragmatic middle ground — semantic chunking keeps ideas intact but slows indexing.",
      },
    ],
  },
  {
    id: "t4",
    title: "Reranker comparison",
    updated: "last week",
    messages: [
      { id: "t4-1", role: "user", content: "Which reranker should I try next?" },
      {
        id: "t4-2",
        role: "assistant",
        content:
          "The 2026-09-10 digest suggests writing up a reranker comparison; no reranker benchmark exists in the vault yet.",
      },
    ],
  },
];

/** GET http://127.0.0.1:8083/api/file?name=FILENAME */
export async function getFile(name: string): Promise<string> {
  // REAL: return (await fetch(`${API_BASE}/api/file?name=${encodeURIComponent(name)}`)).text();
  await delay(200);
  return MOCK_CONTENT[name] ?? `# ${name}\n\n(empty)`;
}

/** POST http://127.0.0.1:8083/api/ask  —  body: { "question": string } */
export async function askQuestion(question: string): Promise<string> {
  // REAL:
  // const res = await fetch(`${API_BASE}/api/ask`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ question }),
  // });
  // return (await res.json()).answer;
  await delay(900 + Math.random() * 700);
  void question;
  return MOCK_ANSWERS[Math.floor(Math.random() * MOCK_ANSWERS.length)] ?? MOCK_ANSWERS[0]!;
}
