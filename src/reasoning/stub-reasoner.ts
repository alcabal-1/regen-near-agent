// Deterministic, offline stand-in for a real reasoning LLM. The live GLM-powered
// implementation lands separately behind the same Reasoner interface (see
// glm-reasoner.ts).
//
// The pipeline uses this by default so `npm run demo` runs fully offline and stays
// green — no GLM_API_KEY needed. The text is templated from the actual run data
// (research findings, score dimensions, proof-plan evidence) so the offline narration
// is faithful to the run, just not model-authored.
//
// DOCTRINE: this narrates; it does NOT decide. Nothing here touches the issue/refuse
// boolean — the deterministic gate owns that.

import { Reasoner } from './reasoner';
import { ResearchResult } from '../research/research-provider';
import { ResearchScore, CoreScores } from '../types/research-score';
import { ProofPlan } from '../types/proof-plan';

// The score dimensions, lowest-first helper picks the strongest/weakest for narration.
function topDims(core: CoreScores, n: number, highest: boolean): string[] {
  return (Object.entries(core) as Array<[keyof CoreScores, number]>)
    .sort((a, b) => (highest ? b[1] - a[1] : a[1] - b[1]))
    .slice(0, n)
    .map(([dim, v]) => `${String(dim).replace(/_/g, ' ')} (${v})`);
}

export class StubReasoner implements Reasoner {
  async interpretResearch(research: ResearchResult): Promise<string> {
    const top = research.findings.slice(0, 2).map((f) => f.title);
    const lead = top.length
      ? `Strongest regional signals: ${top.join('; ')}.`
      : 'No regional precedents surfaced this pass.';
    return (
      `The research pass returned ${research.findings.length} source` +
      `${research.findings.length === 1 ? '' : 's'} of regional precedent. ${lead} ` +
      `This scopes the prior art the evidence must still independently establish — it ` +
      `does not certify impact.`
    );
  }

  async explainScore(score: ResearchScore): Promise<string> {
    const strong = topDims(score.core_scores, 2, true);
    const weak = topDims(score.core_scores, 1, false);
    return (
      `Weighted average ${score.avg} → recommendation "${score.recommendation}". ` +
      `Carried mostly by ${strong.join(' and ')}; held back by ${weak.join('')}. ` +
      `The number comes from the deterministic scorer — this is the read, not a re-score.`
    );
  }

  async narrateProofPlan(proofPlan: ProofPlan): Promise<string> {
    const required = proofPlan.evidence_requirements
      .filter((r) => r.required)
      .map((r) => r.evidence_type);
    return (
      `The ${proofPlan.tier} proof-plan asks for ${required.length} required evidence ` +
      `item${required.length === 1 ? '' : 's'} (${required.slice(0, 3).join(', ')}` +
      `${required.length > 3 ? ', …' : ''}) before any claim is trusted. It describes ` +
      `what must be verified — it is not a certification, and the mint stays gated.`
    );
  }
}
