// Ported from zentient-web4/03_app/src/services/proof-plan-generator.ts
// Routes by tier to the matching proof-plan template, then optionally attaches the
// "Regional Precedent & Evidence Scan" from the agent's web-research stage.

import { Opportunity } from '../types/opportunity';
import { ProofPlan } from '../types/proof-plan';
import { ResearchResult } from '../research/research-provider';
import { buildTier1ProofPlan } from '../templates/tier1-micro-reward';
import { buildTier2ProofPlan } from '../templates/tier2-workflow';

// `research` enriches the proof-plan's narrative/evidence with regional precedent.
// It does NOT change the tier, the evidence requirements, or the score — and it is
// excluded from the canonical proof-plan hash (see services/hash.ts).
export function generateProofPlan(
  opportunity: Opportunity,
  research?: ResearchResult
): ProofPlan {
  const plan =
    opportunity.tier === 'tier_1'
      ? buildTier1ProofPlan(opportunity)
      : buildTier2ProofPlan(opportunity);

  if (research) {
    plan.regional_precedent_scan = {
      query: research.query,
      summary: research.summary,
      precedents: research.findings.map((f) => ({
        title: f.title,
        url: f.url,
        snippet: f.snippet,
        source: f.source,
      })),
    };
  }

  return plan;
}
