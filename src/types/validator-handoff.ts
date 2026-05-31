// Ported from zentient-web4/03_app: validator-handoff.schema.json + types/validator-handoff.ts

export interface SubmittedEvidence {
  evidence_type: string;
  ref: string;
  hash?: string;
  timestamp?: string;
}

export type RequestedDecision = 'approve' | 'reject' | 'needs_more_evidence';

export interface ValidatorHandoff {
  handoff_id: string;
  opportunity_id: string;
  proof_plan_id: string;
  submitted_evidence: SubmittedEvidence[];
  requested_decision: RequestedDecision;
  notes?: string;
}
