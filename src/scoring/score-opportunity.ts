// Ported from zentient-web4/03_app/src/scoring/score-opportunity.ts
// The per-dimension formulas are PRESERVED EXACTLY. The only adaptation is the
// input shape: the shipped code scored a flat `MatrixActivity`; here we score the
// nested `Opportunity` contract directly, deriving the same fields the formulas
// consumed (categories from matrix_refs, evidence from evidence.default_evidence_types,
// wellbeing_tags / monetization_paths from optional Opportunity fields).

import { Opportunity } from '../types/opportunity';
import {
  ResearchScore,
  CoreScores,
  ScoreRecommendation,
} from '../types/research-score';
import { weightedAverage, DEFAULT_WEIGHTS, THRESHOLDS } from './weights';

// The fields the scoring formulas need, projected off an Opportunity.
interface ScoringFacts {
  tier: Opportunity['tier'];
  track: Opportunity['track'];
  title: string;
  normalized_activity_statement: string;
  primary_impact_category_id: string;
  secondary_impact_category_id: string | null;
  maslow_need: string;
  default_evidence_types: string[];
  wellbeing_tags: string[];
  monetization_paths: string[];
}

function toFacts(o: Opportunity): ScoringFacts {
  return {
    tier: o.tier,
    track: o.track,
    title: o.title,
    normalized_activity_statement: o.normalized_activity_statement,
    primary_impact_category_id: o.matrix_refs.primary_impact_category_id,
    secondary_impact_category_id: o.matrix_refs.secondary_impact_category_id,
    maslow_need: o.qualification.maslow_need,
    default_evidence_types: o.evidence.default_evidence_types,
    wellbeing_tags: o.wellbeing_tags ?? [],
    monetization_paths: o.monetization_paths ?? [],
  };
}

// Base impact scores by impact category (public domain proxy scores)
const IMPACT_CATEGORY_SCORES: Record<string, number> = {
  cat_clean_energy_enablement: 80,
  cat_project_progress: 74,
  cat_social_cohesion: 72,
  cat_volunteer_support: 70,
  cat_civic_participation: 68,
  cat_public_realm_care: 65,
  cat_local_economy: 60,
  cat_admin_efficiency: 57,
};

function scoreImpact(a: ScoringFacts): number {
  const primary = IMPACT_CATEGORY_SCORES[a.primary_impact_category_id] ?? 58;
  const secondary = a.secondary_impact_category_id
    ? (IMPACT_CATEGORY_SCORES[a.secondary_impact_category_id] ?? 50) * 0.12
    : 0;
  return Math.min(100, Math.round(primary + secondary));
}

function scoreMonetizationReadiness(a: ScoringFacts): number {
  const paths = a.monetization_paths;
  let score = 35;
  score += paths.length * 8;
  if (paths.some((p) => p.includes('fee') || p.includes('margin'))) score += 15;
  if (paths.some((p) => p.includes('sponsor'))) score += 8;
  return Math.min(100, score);
}

function scoreAgenticFit(a: ScoringFacts): number {
  // Workflow milestones fit agentic automation better than micro_reward
  if (a.track === 'workflow_milestone') return 78;
  // micro_reward: score by evidence type count (more structured = higher fit)
  const count = a.default_evidence_types.length;
  return Math.min(62, 38 + count * 8);
}

function scorePropagation(a: ScoringFacts): number {
  let score = 44;
  const socialCats = new Set(['cat_social_cohesion', 'cat_civic_participation']);
  if (socialCats.has(a.primary_impact_category_id)) score += 22;
  if (
    a.secondary_impact_category_id &&
    socialCats.has(a.secondary_impact_category_id)
  )
    score += 10;
  const spreadTags = new Set([
    'connection',
    'belonging',
    'community',
    'trust',
    'social_bridge',
  ]);
  if (a.wellbeing_tags.some((t) => spreadTags.has(t))) score += 5;
  return Math.min(100, score);
}

function scoreExecutionEase(a: ScoringFacts): number {
  // tier_1 micro_reward is simpler to execute
  const base = a.tier === 'tier_1' ? 80 : 64;
  const count = a.default_evidence_types.length;
  // Each additional evidence type adds slight complexity
  return Math.max(50, base - (count - 2) * 3);
}

function scoreEvidenceFit(a: ScoringFacts): number {
  const count = a.default_evidence_types.length;
  let score = 52 + count * 8;
  // Common, unambiguous evidence types score better
  const clear = new Set([
    'photo',
    'receipt',
    'timestamp',
    'host_attestation',
    'before_after_photo',
  ]);
  const clearCount = a.default_evidence_types.filter((e) => clear.has(e)).length;
  score += clearCount * 4;
  return Math.min(100, score);
}

function scoreMissionAlignment(a: ScoringFacts): number {
  const maslowScores: Record<string, number> = {
    belonging: 82,
    esteem: 76,
    safety: 70,
    self_actualization: 86,
    physiological: 62,
  };
  const base = maslowScores[a.maslow_need] ?? 65;
  const regenTags = new Set(['service', 'purpose', 'contribution', 'care', 'connection']);
  const regenCount = a.wellbeing_tags.filter((t) => regenTags.has(t)).length;
  return Math.min(100, base + regenCount * 2);
}

export function computeCoreScores(o: Opportunity): CoreScores {
  const a = toFacts(o);
  return {
    impact: scoreImpact(a),
    monetization_readiness: scoreMonetizationReadiness(a),
    agentic_fit: scoreAgenticFit(a),
    propagation: scorePropagation(a),
    execution_ease: scoreExecutionEase(a),
    evidence_fit: scoreEvidenceFit(a),
    mission_alignment: scoreMissionAlignment(a),
  };
}

function deriveRecommendation(
  avgScore: number,
  thresholds: { allow: number; shortlist: number }
): ScoreRecommendation {
  if (avgScore >= thresholds.shortlist) return 'shortlist';
  if (avgScore >= thresholds.allow) return 'research_later';
  return 'reject';
}

function buildRationale(
  o: Opportunity,
  scores: CoreScores,
  recommendation: ScoreRecommendation
): string[] {
  const lines: string[] = [];
  const catLabel = o.matrix_refs.primary_impact_category_id
    .replace('cat_', '')
    .replace(/_/g, ' ');
  if (scores.impact >= 70) lines.push(`Strong ${catLabel} impact.`);
  if (scores.evidence_fit >= 70) lines.push('Clear, verifiable evidence path.');
  if (scores.monetization_readiness >= 60) lines.push('Good monetization readiness.');
  if (scores.execution_ease >= 75) lines.push('Low execution friction.');
  if (scores.mission_alignment >= 80)
    lines.push(`High mission alignment via ${o.qualification.maslow_need} need.`);
  if (recommendation === 'reject') lines.push('Average score below research threshold.');
  if (lines.length === 0) lines.push('Moderate fit across scored dimensions.');
  return lines;
}

export function scoreOpportunity(o: Opportunity): ResearchScore {
  const core = computeCoreScores(o);
  const avg = weightedAverage(core, DEFAULT_WEIGHTS);
  const recommendation = deriveRecommendation(avg, THRESHOLDS);

  return {
    opportunity_id: o.opportunity_id,
    core_scores: core,
    ranking_only_scores: {},
    recommendation,
    rationale: buildRationale(o, core, recommendation),
    avg,
  };
}
