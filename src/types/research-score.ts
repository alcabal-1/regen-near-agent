// Ported from zentient-web4/03_app: research-score.schema.json + types/research-score.ts

export interface CoreScores {
  impact: number;
  monetization_readiness: number;
  agentic_fit: number;
  propagation: number;
  execution_ease: number;
  evidence_fit: number;
  mission_alignment: number;
}

export interface RankingOnlyScores {
  emotion_fit?: number;
  ikigai_fit?: number;
}

export type ScoreRecommendation = 'reject' | 'research_later' | 'shortlist';

export interface ResearchScore {
  opportunity_id: string;
  core_scores: CoreScores;
  ranking_only_scores: RankingOnlyScores;
  recommendation: ScoreRecommendation;
  rationale: string[];
  // Convenience: the weighted average the recommendation was derived from.
  avg: number;
}
