import { processState } from "@/lib/process-state";

/**
 * "Content waiting for approval" = open pull requests labelled `content`
 * (opened by the scheduled content routine -- docs/ops/content-pipeline.md).
 * Read-only GitHub REST call; works unauthenticated for a public repo
 * (60 req/h is plenty with the 5-minute cache), or set GITHUB_READ_TOKEN
 * (fine-grained, read-only "Pull requests" on this repo) for a private one.
 * Failure is non-fatal: the dashboard falls back to a link.
 */

export interface ContentPr {
  number: number;
  title: string;
  url: string;
  createdAt: string;
  draft: boolean;
}

export type ContentPrResult = { ok: true; prs: ContentPr[] } | { ok: false; error: string };

export function contentRepo(): string {
  return process.env.CONTENT_REPO || "thong021196/manufacturing-os";
}

export function contentPrLabel(): string {
  return process.env.CONTENT_PR_LABEL || "content";
}

export function contentPrListUrl(): string {
  return `https://github.com/${contentRepo()}/pulls?q=${encodeURIComponent(`is:pr is:open label:${contentPrLabel()}`)}`;
}

const prCache = processState("contentPrCache", () => ({ value: null as { at: number; result: ContentPrResult } | null }));
const CACHE_MS = 5 * 60_000;

export async function fetchContentPrs(): Promise<ContentPrResult> {
  const cache = prCache.value;
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.result;
  let result: ContentPrResult;
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "manufacturing-os-admin",
    };
    if (process.env.GITHUB_READ_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_READ_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${contentRepo()}/pulls?state=open&per_page=50`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data = (await res.json()) as Array<{
      number: number;
      title: string;
      html_url: string;
      created_at: string;
      draft?: boolean;
      labels?: Array<{ name: string }>;
    }>;
    const label = contentPrLabel();
    result = {
      ok: true,
      prs: data
        .filter((pr) => pr.labels?.some((l) => l.name === label))
        .map((pr) => ({ number: pr.number, title: pr.title, url: pr.html_url, createdAt: pr.created_at, draft: Boolean(pr.draft) })),
    };
  } catch (error) {
    result = { ok: false, error: (error as Error).message };
  }
  prCache.value = { at: Date.now(), result };
  return result;
}
