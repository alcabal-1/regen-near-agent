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

export interface ProofPlan {
  proof_plan_id: string;
  opportunity_id: string;
  tier: 'tier_1' | 'tier_2';
  evidence_requirements: EvidenceRequirement[];
  submission_bundle: SubmissionBundle;
  validator_handoff_preview: ValidatorHandoffPreview;
  // Doctrine guardrail — every proof-plan MUST carry this string.
  disclaimer: string;
}
