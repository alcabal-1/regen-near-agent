// Ported from zentient-web4/03_app: opportunity.schema.json + types/opportunity.ts
// The Opportunity is the agent's primary input contract.

export type OpportunityTier = 'tier_1' | 'tier_2';
export type OpportunityTrack = 'micro_reward' | 'workflow_milestone';

export type QualificationClassification =
  | 'qualifies'
  | 'qualifies_with_source_check'
  | 'does_not_qualify_yet';

export interface Qualification {
  maslow_need: string;
  wheel_of_life_slice: string;
  regenerative_contribution: string;
  classification: QualificationClassification;
  notes?: string;
}

export interface Evidence {
  default_evidence_types: string[];
}

export interface MatrixRefs {
  matrix_activity_id: string;
  primary_impact_category_id: string;
  secondary_impact_category_id: string | null;
  tie_flag?: boolean;
}

export interface Opportunity {
  opportunity_id: string;
  title: string;
  tier: OpportunityTier;
  track: OpportunityTrack;
  normalized_activity_statement: string;
  qualification: Qualification;
  evidence: Evidence;
  matrix_refs: MatrixRefs;
  // Optional ranking/scoring hints (do NOT affect qualification or recommendation).
  wellbeing_tags?: string[];
  monetization_paths?: string[];
}
