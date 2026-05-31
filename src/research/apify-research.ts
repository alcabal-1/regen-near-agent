// REAL web-research ResearchProvider — Apify-powered (hackathon sponsor integration).
//
// Same ResearchProvider interface as the stub; swapping this in requires no change to
// the qualify / score / proof-plan / decision logic. This is the seam that makes the
// agent ACT: it goes out to the live web, gathers its OWN evidence about a
// regenerative project, and feeds the findings into the proof-plan's evidence scan.
//
// Actor choice: apify/rag-web-browser — purpose-built for AI-agent / RAG web research.
// Given a `query`, it performs a web search AND fetches the top results, returning
// clean, LLM-ready content (markdown + page metadata) per result. That is exactly the
// "agent gathers evidence for itself" shape we want, in one Actor call. If that Actor
// is unavailable for an account, FALLBACK_ACTOR_ID (apify/google-search-scraper) is a
// drop-in alternative whose organic-result items we map the same way.
//
// ESM/CommonJS note: unlike near-api-js v7 (ESM-only — see src/chain/near-issuer.ts),
// apify-client v2 is a DUAL package. Its exports map carries a `require` condition to a
// CommonJS build (dist/index.js) and ships `.d.ts` types that resolve under this
// project's `moduleResolution: node`. Verified: a plain static `import` both typechecks
// and loads via require() here — so no dynamic-import / @ts-ignore dance is needed.

import {
  ResearchProvider,
  ResearchResult,
  ResearchFinding,
  buildResearchQuery,
} from './research-provider';
import { ApifyClient } from 'apify-client';

// Purpose-built AI-agent web-research Actor (search + fetch → clean markdown per result).
const RAG_WEB_BROWSER_ACTOR_ID = 'apify/rag-web-browser';
// Drop-in fallback if rag-web-browser is unavailable for the account.
const FALLBACK_ACTOR_ID = 'apify/google-search-scraper';
const MAX_RESULTS = 6;

// One dataset item from rag-web-browser (and, loosely, google-search-scraper).
// The Actors return slightly different shapes, so every field is optional and we
// read defensively below.
interface ApifyWebItem {
  // rag-web-browser nests page facts under `metadata`, plus a `markdown`/`text` body.
  metadata?: { title?: string; url?: string; description?: string };
  markdown?: string;
  text?: string;
  // google-search-scraper organic-result fields (flat).
  title?: string;
  url?: string;
  description?: string;
  snippet?: string;
}

function resolveToken(): string {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) {
    throw new Error(
      'ApifyResearchProvider: APIFY_TOKEN is not set. The live research path is genuinely ' +
        'real — it will not silently fall back to canned data. Set a token and re-run, e.g.:\n' +
        '  APIFY_TOKEN=apify_api_xxx npm run demo:research -- --with-evidence\n' +
        'Get a token at https://console.apify.com/account/integrations . ' +
        '(For the offline path, use the default StubResearchProvider — `npm run demo`.)'
    );
  }
  return token;
}

// Trim/normalize a content body into a one-line snippet.
function toSnippet(item: ApifyWebItem): string {
  const raw =
    item.snippet ||
    item.metadata?.description ||
    item.description ||
    item.markdown ||
    item.text ||
    '';
  return raw.replace(/\s+/g, ' ').trim().slice(0, 280);
}

function mapItemsToFindings(items: ApifyWebItem[]): ResearchFinding[] {
  return items
    .map((item): ResearchFinding => {
      const url = item.metadata?.url || item.url || '';
      const title =
        item.metadata?.title || item.title || (url ? url : 'Untitled result');
      return { title, url, snippet: toSnippet(item), source: 'apify:rag-web-browser' };
    })
    .filter((f) => f.url || f.snippet)
    .slice(0, MAX_RESULTS);
}

function synthesizeSummary(
  project: string,
  region: string | undefined,
  findings: ResearchFinding[]
): string {
  const where = region ? ` (${region})` : '';
  if (findings.length === 0) {
    return (
      `Live web-research scan for "${project}"${where} returned no usable results. ` +
      `The proof-plan's evidence requirements stand unchanged — research enriches the ` +
      `narrative; it does not gate or alter the score.`
    );
  }
  const titles = findings
    .slice(0, 3)
    .map((f) => f.title)
    .join('; ');
  return (
    `Live web-research scan for "${project}"${where} via Apify (apify/rag-web-browser) ` +
    `surfaced ${findings.length} source${findings.length === 1 ? '' : 's'} of regional ` +
    `precedent and reference, including: ${titles}. These scope the prior art and funding ` +
    `landscape the proof-plan's evidence must still independently establish — the agent ` +
    `gathered this evidence itself, but it does NOT certify impact and does NOT change the ` +
    `numeric score.`
  );
}

export class ApifyResearchProvider implements ResearchProvider {
  private readonly actorId: string;

  constructor(opts: { actorId?: string } = {}) {
    this.actorId = opts.actorId ?? RAG_WEB_BROWSER_ACTOR_ID;
  }

  async research(args: {
    project: string;
    region?: string;
    topics?: string[];
  }): Promise<ResearchResult> {
    const token = resolveToken();
    const query = buildResearchQuery(args);

    const client = new ApifyClient({ token });

    // rag-web-browser takes `query` + `maxResults`. google-search-scraper takes
    // `queries` + `maxPagesPerQuery`; we pass both keys so either Actor reads what it
    // needs (extra keys are ignored by the Actor's input schema).
    const input = {
      query,
      maxResults: MAX_RESULTS,
      queries: query,
      maxPagesPerQuery: 1,
      resultsPerPage: MAX_RESULTS,
    };

    const run = await client.actor(this.actorId).call(input);
    if (!run?.defaultDatasetId) {
      throw new Error(
        `ApifyResearchProvider: Actor "${this.actorId}" run did not return a defaultDatasetId ` +
          `(status: ${run?.status ?? 'unknown'}). Cannot read research results.`
      );
    }

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const findings = mapItemsToFindings(items as ApifyWebItem[]);
    const summary = synthesizeSummary(args.project, args.region, findings);

    return { query, findings, summary };
  }
}
