// Ported from zentient-web4/03_app: proof-plan.schema.json + types/proof-plan.ts
// Extended with a doctrine `disclaimer` field — the proof-plan is honest about
// what it does and does not assert.

export interface EvidenceRequirement {
  evidence_type: string;
  required: boolean;
  hash_required?: boolean;
  notes?: string;
}

export interface SubmissionBundle {
  checklist: string[];
  min_count: number;
}

export interface ValidatorHandoffPreview {
  status: 'draft' | 'ready_for_validation';
  required_fields: string[];
}

// One regional-precedent / reference item the agent's web-research stage surfaced,
// recorded in the proof-plan to scope (NOT certify) the prior art the evidence must
// still independently establish.
export interface RegionalPrecedentEntry {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

// "Regional Precedent & Evidence Scan" — populated from the ResearchProvider's
// findings. This ENRICHES the proof-plan narrative/evidence; it does NOT change the
// numeric score or the evidence requirements. Absent when no research was run.
export interface RegionalPrecedentScan {
  query: string;
  summary: string;
  precedents: RegionalPrecedentEntry[];
}

export interface ProofPlan {
  proof_plan_id: string;
  opportunity_id: string;
  tier: 'tier_1' | 'tier_2';
  evidence_requirements: EvidenceRequirement[];
  submission_bundle: SubmissionBundle;
  validator_handoff_preview: ValidatorHandoffPreview;
  // Doctrine guardrail — every proof-plan MUST carry this string.
  disclaimer: string;
  // Optional web-research enrichment (see RegionalPrecedentScan). Does NOT affect
  // the score or the evidence requirements — narrative/evidence context only.
  regional_precedent_scan?: RegionalPrecedentScan;
}
