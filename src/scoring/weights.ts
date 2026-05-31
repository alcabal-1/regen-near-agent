// Ported VERBATIM from zentient-web4/03_app/src/scoring/weights.ts
// Weights are load-bearing — do not change them without re-running validation.

export interface ScoringWeights {
  impact: number;
  monetization_readiness: number;
  agentic_fit: number;
  propagation: number;
  execution_ease: number;
  evidence_fit: number;
  mission_alignment: number;
}

// Weights must sum to 1.0
export const DEFAULT_WEIGHTS: ScoringWeights = {
  impact: 0.2,
  monetization_readiness: 0.15,
  agentic_fit: 0.15,
  propagation: 0.1,
  execution_ease: 0.15,
  evidence_fit: 0.15,
  mission_alignment: 0.1,
};

// Recommendation thresholds (build-spec authoritative: shortlist 70 / allow 55).
// The shipped monorepo lens_rules.json used 60/40; this demo uses the spec values.
export const THRESHOLDS = { allow: 55, shortlist: 70 };

export function weightedAverage(
  scores: Record<keyof ScoringWeights, number>,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  let total = 0;
  let weightSum = 0;
  for (const key of Object.keys(weights) as Array<keyof ScoringWeights>) {
    total += scores[key] * weights[key];
    weightSum += weights[key];
  }
  return Math.round(total / weightSum);
}
