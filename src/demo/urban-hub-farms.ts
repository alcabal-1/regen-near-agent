import { Opportunity } from '../types/opportunity';

// The Urban Hub Farms example — a real Zentient Regen opportunity used as the
// hackathon demo subject. Evidence is NOT yet submitted, so the honest default
// outcome is STAKE_PROOF_PLAN_ONLY (run with --with-evidence to demo the full
// ISSUE_CREDIT path).
export const URBAN_HUB_FARMS: Opportunity = {
  opportunity_id: 'uhf_living_wall_01',
  title: 'Urban Hub Farms — community living-wall food gardens',
  tier: 'tier_2',
  track: 'workflow_milestone',
  normalized_activity_statement:
    'Convert under-used urban surfaces into community living-wall food gardens with shared harvest access and paid local maintenance roles.',
  qualification: {
    maslow_need: 'physiological',
    wheel_of_life_slice: 'physical_environment',
    regenerative_contribution: 'Local food production + urban greening + green jobs',
    classification: 'qualifies_with_source_check',
    notes:
      'Maslow(physiological=food) AND Wheel(physical_environment) both satisfied; continuity claim needs source check.',
  },
  evidence: {
    default_evidence_types: [
      'site_lease_or_permission',
      'before_after_photo',
      'host_attestation',
      'harvest_log',
      'worker_payroll_record',
      'soil_test',
    ],
  },
  matrix_refs: {
    matrix_activity_id: 'demo_001',
    primary_impact_category_id: 'cat_local_economy',
    secondary_impact_category_id: 'cat_social_cohesion',
    tie_flag: false,
  },
  // Scoring/ranking hints (do NOT affect qualification or recommendation).
  // Derived from the activity statement: paid local roles + shared community harvest.
  wellbeing_tags: ['contribution', 'community', 'care', 'connection'],
  monetization_paths: ['harvest_sales_margin', 'maintenance_service_fee', 'local_sponsor'],
};
