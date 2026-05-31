// The credit decision. Decides what the agent should DO with a scored, proof-planned
// opportunity. The honest defaults (STAKE / AWAIT) come first; ISSUE_CREDIT is only
// reached after a validator "approve". The agent NEVER self-certifies approval.

import { Opportunity } from '../types/opportunity';
import { ResearchScore } from '../types/research-score';
import { ProofPlan } from '../types/proof-plan';
import { QualificationResult } from '../services/qualify';
import { RequestedDecision } from '../types/validator-handoff';

export type CreditDecision =
  | 'NO_ACTION'
  | 'STAKE_PROOF_PLAN_ONLY'
  | 'AWAIT_VALIDATION'
  | 'ISSUE_CREDIT';

export interface EvidenceState {
  // Which required evidence types have actually been submitted.
  submittedEvidenceTypes: string[];
  // The validator's decision, if a handoff has been reviewed. undefined = not yet reviewed.
  validatorDecision?: RequestedDecision;
}

// Register entry the agent emits when it stakes a proof-plan without minting.
// (Mirrors the RegenWeb4Opportunity "register, don't mint" pattern.)
export interface RegenWeb4Opportunity {
  kind: 'RegenWeb4Opportunity';
  opportunity_id: string;
  proof_plan_id: string;
  tier: ProofPlan['tier'];
  status: 'staked_awaiting_evidence';
  required_evidence_types: string[];
  missing_evidence_types: string[];
  recommendation: ResearchScore['recommendation'];
  note: string;
}

export interface CreditActionResult {
  decision: CreditDecision;
  reason: string;
  // Present for STAKE_PROOF_PLAN_ONLY.
  registerEntry?: RegenWeb4Opportunity;
  // Present for ISSUE_CREDIT — the amount to mint (demo units, as a string).
  amount?: string;
  // The required evidence types the plan demands, surfaced for transparency.
  requiredEvidenceTypes: string[];
  missingEvidenceTypes: string[];
}

export function baseCredit(tier: ProofPlan['tier']): number {
  return tier === 'tier_1' ? 10 : 100;
}

function requiredEvidenceTypes(proofPlan: ProofPlan): string[] {
  return proofPlan.evidence_requirements
    .filter((r) => r.required)
    .map((r) => r.evidence_type);
}

export function decideCreditAction(
  opportunity: Opportunity,
  qualification: QualificationResult,
  score: ResearchScore,
  proofPlan: ProofPlan,
  evidenceState: EvidenceState
): CreditActionResult {
  const required = requiredEvidenceTypes(proofPlan);
  const submitted = new Set(evidenceState.submittedEvidenceTypes);
  const missing = required.filter((et) => !submitted.has(et));

  const base = {
    requiredEvidenceTypes: required,
    missingEvidenceTypes: missing,
  };

  // 1. Did not qualify → no action.
  if (qualification.classification === 'does_not_qualify_yet') {
    return {
      decision: 'NO_ACTION',
      reason: 'Opportunity does not qualify yet (Maslow AND Wheel-of-Life AND regenerative not all satisfied).',
      ...base,
    };
  }

  // 2. Score says reject → no action.
  if (score.recommendation === 'reject') {
    return {
      decision: 'NO_ACTION',
      reason: `Score recommendation is "reject" (avg ${score.avg} below research threshold).`,
      ...base,
    };
  }

  // 3. Required evidence not all satisfied → stake the plan only, no credit.
  if (missing.length > 0) {
    const registerEntry: RegenWeb4Opportunity = {
      kind: 'RegenWeb4Opportunity',
      opportunity_id: opportunity.opportunity_id,
      proof_plan_id: proofPlan.proof_plan_id,
      tier: proofPlan.tier,
      status: 'staked_awaiting_evidence',
      required_evidence_types: required,
      missing_evidence_types: missing,
      recommendation: score.recommendation,
      note: 'Proof-plan staked and registered. No credit issued — required evidence not yet submitted/verified.',
    };
    return {
      decision: 'STAKE_PROOF_PLAN_ONLY',
      reason: `${missing.length} required evidence item(s) not yet submitted: ${missing.join(', ')}.`,
      registerEntry,
      ...base,
    };
  }

  // 4. Evidence complete but validator has not approved → await validation.
  if (evidenceState.validatorDecision !== 'approve') {
    const status =
      evidenceState.validatorDecision === undefined
        ? 'no validator decision yet'
        : `validator decision is "${evidenceState.validatorDecision}"`;
    return {
      decision: 'AWAIT_VALIDATION',
      reason: `All required evidence submitted, but ${status}. The agent does not self-certify approval.`,
      ...base,
    };
  }

  // 5. Qualified + not reject + evidence complete + validator approved → issue credit.
  const amount = (baseCredit(proofPlan.tier) * (score.avg / 100)).toFixed(2);
  return {
    decision: 'ISSUE_CREDIT',
    reason: `Validator approved. amount = baseCredit(${proofPlan.tier})=${baseCredit(
      proofPlan.tier
    )} × (avg ${score.avg}/100) = ${amount} demo units.`,
    amount,
    ...base,
  };
}
