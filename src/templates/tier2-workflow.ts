// Ported from zentient-web4/03_app/src/templates/tier2-workflow.ts
// Tier 2 workflow_milestone proof plan template.
// ALL evidence types required AND each must be hashed. status 'ready_for_validation'.

import { Opportunity } from '../types/opportunity';
import { ProofPlan, EvidenceRequirement } from '../types/proof-plan';
import { PROOF_PLAN_DISCLAIMER } from '../services/doctrine';

export function buildTier2ProofPlan(opportunity: Opportunity): ProofPlan {
  const evidenceTypes = opportunity.evidence.default_evidence_types;

  const requirements: EvidenceRequirement[] = evidenceTypes.map((et, i) => ({
    evidence_type: et,
    required: true, // All evidence types required for Tier 2 workflow milestones
    hash_required: true, // Each evidence item must be hashed for the audit trail
    notes:
      i === 0
        ? 'Primary milestone record.'
        : 'Required for audit trail completeness.',
  }));

  const checklist = [
    'Confirm milestone completion with responsible party.',
    ...evidenceTypes.map((et) => `Capture and hash: ${et.replace(/_/g, ' ')}.`),
    'Assemble complete submission bundle.',
    'Submit all required evidence items for validator review.',
  ];

  return {
    proof_plan_id: `pp_${opportunity.opportunity_id}`,
    opportunity_id: opportunity.opportunity_id,
    tier: 'tier_2',
    evidence_requirements: requirements,
    submission_bundle: {
      checklist,
      min_count: evidenceTypes.length,
    },
    validator_handoff_preview: {
      status: 'ready_for_validation',
      required_fields: [
        'opportunity_id',
        'proof_plan_id',
        'submitted_evidence',
        'requested_decision',
      ],
    },
    disclaimer: PROOF_PLAN_DISCLAIMER,
  };
}
