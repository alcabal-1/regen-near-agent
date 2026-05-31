// Doctrine guardrails — these ARE the demo's integrity story, implemented as real code.
//
// CSOS regen doctrine: "proof-plans, not certification." The agent never
// self-certifies impact. It emits a plan describing what must be verified before
// a regenerative claim should be trusted, and refuses to mint a credit unless the
// plan carries the disclaimer and the activity has actually qualified.

import { ProofPlan } from '../types/proof-plan';
import { QualificationResult } from './qualify';

export const PROOF_PLAN_DISCLAIMER =
  'This agent does not certify impact. It produces a proof plan: what must be ' +
  'verified before a regenerative claim should be trusted.';

/**
 * The mint gate. ISSUE_CREDIT MUST call this first. No credit is minted without
 * passing it.
 *
 * Throws unless BOTH hold:
 *   - the proof-plan carries the canonical disclaimer string, AND
 *   - the activity's qualification is not "does_not_qualify_yet".
 */
export function safeProofPlanGate(
  proofPlan: ProofPlan,
  qualification: QualificationResult
): void {
  if (proofPlan.disclaimer !== PROOF_PLAN_DISCLAIMER) {
    throw new Error(
      'safeProofPlanGate: proof-plan is missing the required honesty disclaimer. ' +
        'Refusing to issue credit.'
    );
  }
  if (qualification.classification === 'does_not_qualify_yet') {
    throw new Error(
      'safeProofPlanGate: activity does not qualify yet (Maslow AND Wheel-of-Life ' +
        'AND regenerative not all satisfied). Refusing to issue credit.'
    );
  }
}
