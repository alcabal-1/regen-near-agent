// The agent's act-loop.
//
//   qualify(opportunity)
//     → if classification == "does_not_qualify_yet" return NO_ACTION
//   score(opportunity)
//   generateProofPlan(opportunity, tier)
//   creditAction(score, proofPlan, evidenceState)
//     → if ISSUE_CREDIT: safeProofPlanGate(...) then CreditIssuer.issueCredit(...)
//
// Pure orchestration: scoring, proof-plan, and decision logic live in their own
// modules; the chain is reached only through the CreditIssuer interface.

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
import { RequestedDecision } from '../types/validator-handoff';

export interface RunOptions {
  // Simulate all required evidence submitted + validator "approve" so the full
  // ISSUE_CREDIT + on-chain path is demoable.
  withEvidence?: boolean;
  // Override the chain implementation. Defaults to StubCreditIssuer.
  issuer?: CreditIssuer;
  // Optional explicit evidence state (overrides withEvidence derivation).
  evidenceState?: EvidenceState;
}

export interface AgentRunResult {
  opportunity: Opportunity;
  qualification: QualificationResult;
  score?: ResearchScore;
  proofPlan?: ProofPlan;
  proofPlanHash?: string;
  creditAction?: CreditActionResult;
  receipt?: CreditReceipt;
  // True when the loop short-circuited at the qualification gate.
  haltedAtQualification: boolean;
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

  // 1. Qualify.
  const qualification = qualify(opportunity);
  if (qualification.classification === 'does_not_qualify_yet') {
    return {
      opportunity,
      qualification,
      haltedAtQualification: true,
    };
  }

  // 2. Score.
  const score = scoreOpportunity(opportunity);

  // 3. Generate proof-plan.
  const proofPlan = generateProofPlan(opportunity);
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
    qualification,
    score,
    proofPlan,
    proofPlanHash: planHash,
    creditAction,
    receipt,
    haltedAtQualification: false,
  };
}
