// Ported from zentient-web4/03_app/src/services/proof-plan-generator.ts
// Routes by tier to the matching proof-plan template.

import { Opportunity } from '../types/opportunity';
import { ProofPlan } from '../types/proof-plan';
import { buildTier1ProofPlan } from '../templates/tier1-micro-reward';
import { buildTier2ProofPlan } from '../templates/tier2-workflow';

export function generateProofPlan(opportunity: Opportunity): ProofPlan {
  if (opportunity.tier === 'tier_1') {
    return buildTier1ProofPlan(opportunity);
  }
  return buildTier2ProofPlan(opportunity);
}
