// THE RESEARCH SEAM.
//
// This is the single interface a web-research implementation plugs into. It mirrors
// the CreditIssuer chain seam (src/chain/credit-issuer.ts): the agent's act-loop
// depends ONLY on this interface, so swapping StubResearchProvider for an
// ApifyResearchProvider (real web scraping) requires no change to the qualify /
// score / proof-plan / decision logic.
//
// Research is what makes this "an agent that ACTS" rather than one that only reasons
// over a hand-fed record: it goes and gathers its OWN evidence about a regenerative
// project before scoring it, and those findings enrich the proof-plan's evidence
// narrative. Research ENRICHES the proof-plan; it does NOT alter the numeric score.

export interface ResearchFinding {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface ResearchResult {
  query: string;
  findings: ResearchFinding[];
  summary: string;
}

export interface ResearchProvider {
  research(args: {
    project: string;
    region?: string;
    topics?: string[];
  }): Promise<ResearchResult>;
}

// Build the web-search query from the project + region + topics. Shared by both the
// stub (for a realistic echoed query) and the live Apify provider (the real query
// sent to the Actor), so the displayed query and the executed query never drift.
export function buildResearchQuery(args: {
  project: string;
  region?: string;
  topics?: string[];
}): string {
  return [args.project, args.region, ...(args.topics ?? [])]
    .filter((s): s is string => Boolean(s && s.trim()))
    .join(' ')
    .trim();
}
