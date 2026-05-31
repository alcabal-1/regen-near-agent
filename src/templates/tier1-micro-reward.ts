// Ported from zentient-web4/03_app/src/templates/tier1-micro-reward.ts
// Tier 1 micro_reward proof plan template.
// First min(2, N) evidence types are required; the rest are optional. status 'draft'.

import { Opportunity } from '../types/opportunity';
import { ProofPlan, EvidenceRequirement } from '../types/proof-plan';
import { PROOF_PLAN_DISCLAIMER } from '../services/doctrine';

export function buildTier1ProofPlan(opportunity: Opportunity): ProofPlan {
  const evidenceTypes = opportunity.evidence.default_evidence_types;
  const minCount = Math.min(2, evidenceTypes.length);

  const requirements: EvidenceRequirement[] = evidenceTypes.map((et, i) => ({
    evidence_type: et,
    required: i < minCount, // First N types required (N = minCount)
    hash_required: false,
    notes:
      i === 0
        ? 'Primary proof of participation.'
        : i < minCount
        ? 'Required supporting evidence.'
        : 'Supplementary evidence (recommended but optional).',
  }));

  const checklist = [
    'Complete the activity as described in the opportunity statement.',
    ...evidenceTypes.map((et) => `Capture: ${et.replace(/_/g, ' ')}.`),
    `Submit at least ${minCount} required evidence item${minCount > 1 ? 's' : ''}.`,
  ];

  return {
    proof_plan_id: `pp_${opportunity.opportunity_id}`,
    opportunity_id: opportunity.opportunity_id,
    tier: 'tier_1',
    evidence_requirements: requirements,
    submission_bundle: {
      checklist,
      min_count: minCount,
    },
    validator_handoff_preview: {
      status: 'draft',
      required_fields: ['opportunity_id', 'proof_plan_id', 'submitted_evidence'],
    },
    disclaimer: PROOF_PLAN_DISCLAIMER,
  };
}
