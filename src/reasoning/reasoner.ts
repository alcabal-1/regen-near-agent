// THE REASONING SEAM.
//
// This is the single interface a reasoning-LLM implementation plugs into. It mirrors
// the ResearchProvider seam (src/research/research-provider.ts) and the CreditIssuer
// chain seam (src/chain/credit-issuer.ts): the agent's act-loop depends ONLY on this
// interface, so swapping StubReasoner for a GlmReasoner (real Z.ai / Zhipu GLM calls)
// requires no change to the qualify / score / proof-plan / decision logic.
//
// DOCTRINE GUARDRAIL (load-bearing): the reasoner REASONS AND EXPLAINS — it does NOT
// decide. The deterministic credit gate (src/agent/credit-action.ts + the mint gate
// in src/services/doctrine.ts) stays the SOLE authority on whether a credit is issued.
// The reasoner narrates what the agent found and why the score/plan look the way they
// do; its words never feed the issue/refuse boolean. The model does not self-certify.

import { ResearchResult } from '../research/research-provider';
import { ResearchScore } from '../types/research-score';
import { ProofPlan } from '../types/proof-plan';

export interface Reasoner {
  // A short natural-language synthesis of what the research stage surfaced.
  interpretResearch(research: ResearchResult): Promise<string>;
  // A human rationale for the 7-dimension score (explains, does NOT re-score).
  explainScore(score: ResearchScore): Promise<string>;
  // A plain-language summary of the proof-plan (what must still be verified).
  narrateProofPlan(proofPlan: ProofPlan): Promise<string>;
}
