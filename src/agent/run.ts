// The agent's act-loop.
//
//   research(project)                ← the agent gathers its OWN evidence FIRST
//   qualify(opportunity)
//     → if classification == "does_not_qualify_yet" return NO_ACTION
//   score(opportunity)
//   generateProofPlan(opportunity, research)   ← research enriches the proof-plan
//   creditAction(score, proofPlan, evidenceState)
//     → if ISSUE_CREDIT: safeProofPlanGate(...) then CreditIssuer.issueCredit(...)
//
// Pure orchestration: research, scoring, proof-plan, and decision logic live in their
// own modules; the chain is reached only through the CreditIssuer interface, and the
// web is reached only through the ResearchProvider interface. Research ENRICHES the
// proof-plan narrative; it does NOT alter the numeric score.

import { Opportunity } from '../types/opportunity';
import { ResearchScore } from '../types/research-score';
import { ProofPlan } from '../types/proof-plan';
import { qualify, QualificationResult } from '../services/qualify';
import { scoreOpportunity } from '../scoring/score-opportunity';
import { generateProofPlan } from '../services/proof-plan-generator';
import { proofPlanHash } from '../services/hash';
import { safeProofPlanGate } from '../services/doctrine';
import {
  decideCreditAction,
  CreditActionResult,
  EvidenceState,
} from './credit-action';
import { CreditIssuer, CreditReceipt } from '../chain/credit-issuer';
import { StubCreditIssuer } from '../chain/stub-issuer';
import { ResearchProvider, ResearchResult } from '../research/research-provider';
import { StubResearchProvider } from '../research/stub-research';
import { RequestedDecision } from '../types/validator-handoff';

export interface RunOptions {
  // Simulate all required evidence submitted + validator "approve" so the full
  // ISSUE_CREDIT + on-chain path is demoable.
  withEvidence?: boolean;
  // Override the chain implementation. Defaults to StubCreditIssuer.
  issuer?: CreditIssuer;
  // Override the web-research implementation. Defaults to StubResearchProvider
  // (offline, deterministic). Pass an ApifyResearchProvider for the live web path.
  researcher?: ResearchProvider;
  // Optional explicit research topics for the query (project comes from the
  // opportunity title). Defaults to a regen-oriented topic set.
  researchTopics?: string[];
  // Optional region hint for the research query. Defaults to the demo subject's
  // locale ("San Francisco Bay Area").
  researchRegion?: string;
  // Optional explicit evidence state (overrides withEvidence derivation).
  evidenceState?: EvidenceState;
}

export interface AgentRunResult {
  opportunity: Opportunity;
  // The web-research the agent gathered for itself BEFORE scoring (acts-not-reasons).
  research?: ResearchResult;
  qualification: QualificationResult;
  score?: ResearchScore;
  proofPlan?: ProofPlan;
  proofPlanHash?: string;
  creditAction?: CreditActionResult;
  receipt?: CreditReceipt;
  // True when the loop short-circuited at the qualification gate.
  haltedAtQualification: boolean;
}

// Default regen-oriented research topics, used when the caller doesn't specify any.
const DEFAULT_RESEARCH_TOPICS = [
  'urban agriculture',
  'community garden',
  'regenerative',
];
// Default region hint for the demo subject (Urban Hub Farms is an SF Bay Area project).
const DEFAULT_RESEARCH_REGION = 'San Francisco Bay Area';

// Derive a clean project name for the research query from the opportunity title
// (strip a trailing "— …" descriptor so the query leads with the project name).
function projectNameFor(opportunity: Opportunity): string {
  return opportunity.title.split(/\s+[—–-]\s+/)[0].trim() || opportunity.title;
}

function buildEvidenceState(
  opportunity: Opportunity,
  proofPlan: ProofPlan,
  opts: RunOptions
): EvidenceState {
  if (opts.evidenceState) return opts.evidenceState;

  if (opts.withEvidence) {
    // Simulate every required evidence type submitted + validator approval.
    const submitted = proofPlan.evidence_requirements
      .filter((r) => r.required)
      .map((r) => r.evidence_type);
    const validatorDecision: RequestedDecision = 'approve';
    return { submittedEvidenceTypes: submitted, validatorDecision };
  }

  // Honest default: nothing submitted yet, no validator decision.
  return { submittedEvidenceTypes: [], validatorDecision: undefined };
}

export async function runAgent(
  opportunity: Opportunity,
  opts: RunOptions = {}
): Promise<AgentRunResult> {
  const issuer = opts.issuer ?? new StubCreditIssuer();
  const researcher = opts.researcher ?? new StubResearchProvider();

  // 0. RESEARCH FIRST — the agent gathers its own evidence about the project before
  //    judging it. Findings enrich the proof-plan; they do NOT change the score.
  const research = await researcher.research({
    project: projectNameFor(opportunity),
    region: opts.researchRegion ?? DEFAULT_RESEARCH_REGION,
    topics: opts.researchTopics ?? DEFAULT_RESEARCH_TOPICS,
  });

  // 1. Qualify.
  const qualification = qualify(opportunity);
  if (qualification.classification === 'does_not_qualify_yet') {
    return {
      opportunity,
      research,
      qualification,
      haltedAtQualification: true,
    };
  }

  // 2. Score (research does NOT feed the scorer — the tested formulas are untouched).
  const score = scoreOpportunity(opportunity);

  // 3. Generate proof-plan, enriched with the research as a regional-precedent scan.
  const proofPlan = generateProofPlan(opportunity, research);
  const planHash = proofPlanHash(proofPlan);

  // 4. Decide credit action.
  const evidenceState = buildEvidenceState(opportunity, proofPlan, opts);
  const creditAction = decideCreditAction(
    opportunity,
    qualification,
    score,
    proofPlan,
    evidenceState
  );

  let receipt: CreditReceipt | undefined;

  // 5. Act on-chain only on ISSUE_CREDIT — and only after passing the mint gate.
  if (creditAction.decision === 'ISSUE_CREDIT') {
    safeProofPlanGate(proofPlan, qualification); // throws → no mint
    receipt = await issuer.issueCredit({
      opportunityId: opportunity.opportunity_id,
      proofPlanHash: planHash,
      amount: creditAction.amount!,
    });
  }

  return {
    opportunity,
    research,
    qualification,
    score,
    proofPlan,
    proofPlanHash: planHash,
    creditAction,
    receipt,
    haltedAtQualification: false,
  };
}
