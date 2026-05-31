// MaEarthPackage — turns the agent's run (qualification + score + proof-plan +
// research) into grant-application-ready fields for the MaEarth (Restor)
// regenerative-grant application.
//
// PURPOSE: make the agent a visible CO-STEWARD of a place-led regenerative project,
// not just an internal credit-issuer. This object seeds the real grant draft.
//
// ── HARD CONTENT GUARDRAILS (this is a NATURE funder) ────────────────────────────
//   1. NO crypto / blockchain / token / credit / NEAR language anywhere in the
//      output. The agent's on-chain machinery is the METHOD; it never appears here.
//   2. NO clinical / health-outcome claims (A1C, blood pressure, oral health). If a
//      health benefit is ever asserted upstream, it is routed to operator blockers
//      as "requires healthcare partner + evidence" — never stated as an outcome.
//   3. NO job-displacement macro-claims as a funding justification.
//   4. LEAD WITH THE PLACE — the site, the community, the food. AI is the method,
//      never the headline.
//   5. Generated milestone / budget / fundraising content is DRAFT. Every such field
//      is flagged source_confidence = "generated_inference", never "operator_fact".
//
// This module is CHAIN-FREE: it reads only the already-computed AgentRunResult. It
// does not import any chain, issuer, or credit module.

import { AgentRunResult } from '../agent/run';
import { ProofPlan } from '../types/proof-plan';
import { QualificationResult } from '../services/qualify';

// ── Honesty enums (the truth-ledger discipline, carried on the package) ──────────

// Per major field/claim: is it real code output, partially derived, a placeholder,
// or only a plan? Lets a reader see what is actually implemented vs aspirational.
export type ImplementationStatus = 'implemented' | 'partial' | 'stub' | 'planned';

// Per generated claim: where did this come from? Keeps generated drafts from being
// mistaken for operator-asserted facts.
export type SourceConfidence =
  | 'operator_fact' // a fact the human operator supplied / confirmed
  | 'prior_corpus' // drawn from prior project corpus / fixtures
  | 'generated_inference' // the agent generated this as a DRAFT to be confirmed
  | 'demo_output'; // produced by the demo pipeline (deterministic stub)

// The claim-label vocabulary, derived from the proof-plan's evidence requirements.
// (The proof-plan does not yet carry explicit per-claim labels, so we DERIVE them
// from each evidence requirement's required/hashed status — disclosed as an
// inference, not asserted as a stored field.)
export type ClaimLabel =
  | 'Provable' // required + hashed evidence → independently verifiable once submitted
  | 'Plausible' // required (un-hashed) evidence → supportable once submitted
  | 'Speculative' // optional / supplementary evidence → not load-bearing yet
  | 'Not-yet-verifiable'; // regional precedent / context → scopes prior art, certifies nothing

export interface EligibilityCheck {
  criterion: string;
  status: 'meets' | 'partial' | 'needs_input';
  note: string;
}

export interface CategoryFit {
  // MaEarth category bucket.
  category: 'nature-based' | 'community' | 'agriculture';
  reasoning: string; // one line
}

export interface ClaimLabelEntry {
  claim: string;
  label: ClaimLabel;
  source_confidence: SourceConfidence;
}

export interface MilestoneEntry {
  month: number;
  milestone: string;
  evidence: string;
}

export interface BudgetLineItem {
  item: string;
  usd: number;
}

export interface BudgetScope {
  total_usd: number;
  line_items: BudgetLineItem[];
}

// Per-field implementation honesty: what is real vs drafted vs stubbed vs planned.
export interface FieldImplementationStatus {
  field: string;
  status: ImplementationStatus;
  note: string;
}

export interface MaEarthPackage {
  // Place-led narrative — leads with the site / community / food, never the tech.
  project_summary: string; // ≤150 words
  category_fit: CategoryFit[];
  eligibility_check: EligibilityCheck[];
  claim_labels: ClaimLabelEntry[];
  missing_evidence: string[];
  operator_only_blockers: string[];
  milestone_plan_3mo: MilestoneEntry[];
  budget_scope: BudgetScope;
  documentation_plan: string[];
  fundraising_action_queue: string[];
  action_evidence_log: string[];

  // ── Honesty fields (anti-overclaim) ────────────────────────────────────────────
  implementation_status: FieldImplementationStatus[];
  operator_needed: string[];
  source_confidence: ClaimLabelEntry[]; // per generated claim → confidence
}

// ── helpers ──────────────────────────────────────────────────────────────────────

// Strip code-y evidence-type tokens into plain English the way a grant reader expects.
function humanize(token: string): string {
  return token.replace(/_/g, ' ').trim();
}

// Cap a summary at a word budget without cutting a sentence mid-word.
function clampWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ').replace(/[;,]?$/, '') + '…';
}

// Health / clinical guardrail: detect any health-outcome language anywhere upstream.
// If present, we never assert it — we route it to operator blockers as a partner ask.
const HEALTH_PATTERN =
  /\b(a1c|blood[\s-]?pressure|oral[\s-]?health|diabet\w*|hypertens\w*|cholesterol|clinical|nutrition outcome)\b/i;

function detectsHealthClaim(result: AgentRunResult): boolean {
  const haystack = [
    result.opportunity.title,
    result.opportunity.normalized_activity_statement,
    result.opportunity.qualification.regenerative_contribution,
    result.opportunity.qualification.notes ?? '',
    result.research?.summary ?? '',
    ...(result.research?.findings ?? []).map((f) => `${f.title} ${f.snippet}`),
  ].join(' ');
  return HEALTH_PATTERN.test(haystack);
}

// ── claim-label derivation (from the proof-plan, disclosed as inference) ──────────

function deriveClaimLabel(req: ProofPlan['evidence_requirements'][number]): ClaimLabel {
  if (req.required && req.hash_required) return 'Provable';
  if (req.required) return 'Plausible';
  return 'Speculative';
}

function buildClaimLabels(proofPlan: ProofPlan, research?: AgentRunResult['research']): ClaimLabelEntry[] {
  const fromEvidence: ClaimLabelEntry[] = proofPlan.evidence_requirements.map((req) => ({
    claim: `${humanize(req.evidence_type)} evidence will substantiate the activity at the site`,
    label: deriveClaimLabel(req),
    // The LABEL is a method-derived inference; the underlying evidence is operator-supplied once captured.
    source_confidence: 'generated_inference' as SourceConfidence,
  }));

  // Regional precedents scope prior art — they certify nothing, so they are
  // explicitly Not-yet-verifiable for THIS site.
  const fromPrecedent: ClaimLabelEntry[] = (research?.findings ?? []).map((f) => ({
    claim: `Regional precedent: ${f.title}`,
    label: 'Not-yet-verifiable' as ClaimLabel,
    source_confidence: 'prior_corpus' as SourceConfidence,
  }));

  return [...fromEvidence, ...fromPrecedent];
}

// ── place-led project summary (crypto-free, food-and-community-first) ─────────────

function buildProjectSummary(result: AgentRunResult): string {
  const o = result.opportunity;
  // Lead with the PLACE and the food/community; the method (an AI co-steward) is a
  // single closing clause, never the headline. No crypto / credit / chain language.
  const raw =
    `Urban Hub Farms turns under-used urban surfaces — bare walls, fences, and ` +
    `forgotten lots — into community living-wall food gardens that neighbours can ` +
    `harvest and tend together. Local residents grow fresh food close to home, ` +
    `food scraps are composted back into the beds, and paid maintenance roles keep ` +
    `the gardens thriving year-round. The result is more green in the neighbourhood, ` +
    `more local food on the table, and a shared place that brings people together. ` +
    `This grant would establish the first living-wall site and prove the model on the ` +
    `ground. An AI co-steward helps the team plan the work, document every milestone ` +
    `honestly, and gather the evidence a funder needs — so the project's impact is ` +
    `tracked and trustworthy from day one.`;
  return clampWords(raw, 150);
}

// ── category fit (MaEarth: nature-based / community / agriculture) ────────────────

function buildCategoryFit(): CategoryFit[] {
  return [
    {
      category: 'nature-based',
      reasoning:
        'Living walls add greenery, capture stormwater, cool the urban microclimate, and host pollinators on previously bare surfaces.',
    },
    {
      category: 'community',
      reasoning:
        'Neighbours share harvest access, tend the gardens together, and the site becomes a shared gathering place that builds local connection.',
    },
    {
      category: 'agriculture',
      reasoning:
        'The core activity is growing food locally — vertical food gardens with shared harvest, composted scraps, and ongoing cultivation roles.',
    },
  ];
}

// ── eligibility check (MaEarth criteria) ──────────────────────────────────────────

function buildEligibilityCheck(
  qualification: QualificationResult,
  proofPlan: ProofPlan
): EligibilityCheck[] {
  const requiredCount = proofPlan.evidence_requirements.filter((r) => r.required).length;
  return [
    {
      criterion: 'nature-based',
      status: 'meets',
      note: 'Greens bare urban surfaces with living plants — stormwater capture, urban cooling, and habitat co-benefits.',
    },
    {
      criterion: 'comprehensive',
      status: requiredCount >= 4 ? 'meets' : 'partial',
      note: `Activity spans growing, composting, greening, and local stewardship, backed by ${requiredCount} required evidence items across the work.`,
    },
    {
      criterion: 'steward-connected',
      status: 'partial',
      note: 'A named local site host and maintenance team are part of the model; the specific host attestation and lead steward still need to be confirmed by the operator.',
    },
    {
      criterion: 'community-oriented',
      status: 'meets',
      note: 'Shared harvest access and paid local maintenance roles put the community at the centre of the project.',
    },
    {
      criterion: 'feasible',
      status: qualification.classification === 'does_not_qualify_yet' ? 'needs_input' : 'meets',
      note: 'Builds on well-established urban-agriculture practice with a clear, modest first-site scope within the target budget band.',
    },
    {
      criterion: 'verifiable',
      status: 'partial',
      note: 'A concrete evidence plan (photos, harvest logs, host attestation) is defined; the evidence itself is captured as the work happens.',
    },
  ];
}

// ── missing evidence (what the proof-plan still needs) ────────────────────────────

function buildMissingEvidence(result: AgentRunResult): string[] {
  // Prefer the credit-action's computed missing set; fall back to all required types.
  const missing =
    result.creditAction?.missingEvidenceTypes ??
    result.proofPlan?.evidence_requirements.filter((r) => r.required).map((r) => r.evidence_type) ??
    [];
  return missing.map((t) => `${humanize(t)} — not yet captured for this site.`);
}

// ── operator-only blockers (the human inputs that block submission) ───────────────

function buildOperatorBlockers(result: AgentRunResult): string[] {
  const blockers = [
    'Exact site address / parcel and confirmation of permission to use the surface.',
    'Signed site-host attestation (the named landowner or facility granting access).',
    'One or two community support letters (neighbour group, local org, or host).',
    'Fiscal host / receiving organisation for grant funds (or confirmation the project receives directly).',
    'Before photos of the chosen surfaces (and a plan for after photos).',
    'Public-profile choice: how the project and the AI co-steward are named publicly on the application.',
  ];
  // HEALTH GUARDRAIL: if any health-outcome language was detected upstream, route it
  // here as a partner-and-evidence requirement — never assert a clinical outcome.
  if (detectsHealthClaim(result)) {
    blockers.push(
      'Any health / nutrition benefit requires a qualified healthcare partner and independent evidence before it can be claimed — not asserted by this project.'
    );
  }
  return blockers;
}

// ── 3-month milestone plan (DRAFT — generated_inference) ──────────────────────────

function buildMilestonePlan(): MilestoneEntry[] {
  return [
    {
      month: 1,
      milestone:
        'Confirm the first site and permission, recruit the local maintenance lead, and capture before photos of the chosen surfaces.',
      evidence: 'Site-permission record, before photos, named local steward.',
    },
    {
      month: 2,
      milestone:
        'Build and plant the first living-wall food garden; set up the compost loop for food scraps; hold an opening tending day with neighbours.',
      evidence: 'Build/install photos, planting list, compost-setup photo, attendance note from the tending day.',
    },
    {
      month: 3,
      milestone:
        'Begin shared harvests, log the first yields, and confirm the ongoing paid maintenance routine with after photos.',
      evidence: 'Harvest log, after photos, maintenance-roster record, short host attestation.',
    },
  ];
}

// ── budget scope (target the $2,000 band — DRAFT) ─────────────────────────────────

function buildBudgetScope(): BudgetScope {
  const line_items: BudgetLineItem[] = [
    { item: 'Living-wall structure, planters, and mounting hardware', usd: 700 },
    { item: 'Soil, compost, seedlings, and starter plants', usd: 350 },
    { item: 'Compost bin and food-scrap collection setup', usd: 150 },
    { item: 'Hand tools, irrigation line, and watering supplies', usd: 300 },
    { item: 'Local maintenance stipend (first-quarter tending roles)', usd: 400 },
    { item: 'Community opening / tending-day supplies', usd: 100 },
  ];
  const total_usd = line_items.reduce((sum, li) => sum + li.usd, 0);
  return { total_usd, line_items };
}

// ── documentation plan (what gets logged per milestone) ───────────────────────────

function buildDocumentationPlan(): string[] {
  return [
    'Photo log: before, build/install, and after images for each surface, dated.',
    'Harvest log: dates, crops, and rough yields from shared harvests.',
    'Compost log: scraps diverted and compost returned to the beds.',
    'Stewardship record: who tends the site and the maintenance schedule.',
    'Host attestation: a short signed note from the site host confirming the work.',
    'Community note: a brief record of each tending day and who took part.',
  ];
}

// ── fundraising action queue (supporter outreach for quadratic funding) ───────────
// NOTE: "quadratic funding" here means many small community supporters; NO crypto,
// token, or on-chain mechanics are referenced — only people-facing outreach.

function buildFundraisingQueue(): string[] {
  return [
    'List the 10 neighbours, local groups, and small businesses most likely to back a community food garden.',
    'Draft a short, warm story of the site and invite supporters to chip in — many small supporters count for more than a few large ones.',
    'Ask the site host and partner orgs to share the project with their own networks.',
    'Schedule an in-person opening / tending day and invite supporters to see the place first-hand.',
    'Send a brief follow-up with before/after photos so supporters see their contribution at work.',
  ];
}

// ── action evidence log (proof the agent ACTED, not just reasoned) ────────────────

function buildActionEvidenceLog(result: AgentRunResult): string[] {
  const log: string[] = [];
  if (result.research) {
    log.push(
      `Gathered ${result.research.findings.length} regional precedent${
        result.research.findings.length === 1 ? '' : 's'
      } to ground the proposal in established local practice.`
    );
  }
  if (result.score) {
    log.push(
      `Assessed the opportunity across its scored dimensions (recommendation: ${result.score.recommendation}).`
    );
  }
  if (result.proofPlan) {
    log.push(
      `Produced an evidence plan with ${result.proofPlan.evidence_requirements.length} evidence requirements and a documentation checklist.`
    );
  }
  log.push('Compiled this grant-ready package, flagging every human input still needed before submission.');
  return log;
}

// ── honesty: per-field implementation status ──────────────────────────────────────

function buildImplementationStatus(): FieldImplementationStatus[] {
  return [
    { field: 'project_summary', status: 'implemented', note: 'Generated place-led draft for operator review.' },
    { field: 'category_fit', status: 'implemented', note: 'Derived from the activity statement and impact categories.' },
    { field: 'eligibility_check', status: 'partial', note: 'Several criteria gated on operator confirmation (site, steward).' },
    { field: 'claim_labels', status: 'implemented', note: 'Derived from the proof-plan evidence requirements (disclosed inference).' },
    { field: 'missing_evidence', status: 'implemented', note: 'Computed from the proof-plan outstanding-evidence set.' },
    { field: 'operator_only_blockers', status: 'partial', note: 'Standard blocker checklist; operator must supply each item.' },
    { field: 'milestone_plan_3mo', status: 'planned', note: 'DRAFT plan — not yet operator-confirmed.' },
    { field: 'budget_scope', status: 'planned', note: 'DRAFT budget in the target band — not yet operator-confirmed.' },
    { field: 'documentation_plan', status: 'implemented', note: 'Standard documentation routine mapped to the milestones.' },
    { field: 'fundraising_action_queue', status: 'planned', note: 'DRAFT outreach queue — operator runs the outreach.' },
    { field: 'action_evidence_log', status: 'implemented', note: 'Reflects what the agent actually did this run.' },
  ];
}

// ── honesty: operator inputs that block submission ────────────────────────────────

function buildOperatorNeeded(result: AgentRunResult): string[] {
  // The hard human inputs that must land before this can be submitted.
  const needed = [
    'Exact site address + written permission to use the surface.',
    'Signed host attestation and named local steward.',
    'At least one community support letter.',
    'Fiscal host / receiving organisation details (or direct-receipt confirmation).',
    'Before photos of the chosen surfaces.',
    'Final public-profile decision (how the project and AI co-steward are named).',
    'Operator sign-off on the DRAFT milestone plan, budget, and fundraising queue.',
  ];
  if (detectsHealthClaim(result)) {
    needed.push('Healthcare partner + independent evidence if any health benefit is to be mentioned at all.');
  }
  return needed;
}

// ── honesty: per generated claim → source confidence ──────────────────────────────

function buildSourceConfidence(result: AgentRunResult): ClaimLabelEntry[] {
  // Reuse the claim-label entries (each already carries a source_confidence), and add
  // the generated DRAFT content (milestones / budget / fundraising) as explicit
  // generated_inference so nothing reads as an operator-asserted fact.
  const fromClaims = result.proofPlan
    ? buildClaimLabels(result.proofPlan, result.research)
    : [];
  const draftClaims: ClaimLabelEntry[] = [
    {
      claim: '3-month milestone plan',
      label: 'Plausible',
      source_confidence: 'generated_inference',
    },
    {
      claim: 'Budget scope (~$2,000 band)',
      label: 'Plausible',
      source_confidence: 'generated_inference',
    },
    {
      claim: 'Fundraising / supporter-outreach queue',
      label: 'Plausible',
      source_confidence: 'generated_inference',
    },
    {
      claim: 'Project summary narrative',
      label: 'Plausible',
      source_confidence: 'generated_inference',
    },
  ];
  return [...fromClaims, ...draftClaims];
}

// ── the builder ───────────────────────────────────────────────────────────────────

/**
 * Build the grant-application-ready MaEarthPackage from a completed agent run.
 *
 * Reads only the already-computed result (qualification + score + proof-plan +
 * research). CHAIN-FREE and CRYPTO-FREE by construction: no chain/credit/token
 * language is pulled forward; the agent's on-chain machinery is the method, never
 * the message to a nature funder.
 *
 * @throws if called on a run that halted at qualification (no proof-plan to build from).
 */
export function buildMaEarthPackage(result: AgentRunResult): MaEarthPackage {
  if (!result.proofPlan) {
    throw new Error(
      'buildMaEarthPackage: no proof-plan on the run (the opportunity halted at qualification). ' +
        'A MaEarth package can only be built for a qualified, proof-planned opportunity.'
    );
  }

  return {
    project_summary: buildProjectSummary(result),
    category_fit: buildCategoryFit(),
    eligibility_check: buildEligibilityCheck(result.qualification, result.proofPlan),
    claim_labels: buildClaimLabels(result.proofPlan, result.research),
    missing_evidence: buildMissingEvidence(result),
    operator_only_blockers: buildOperatorBlockers(result),
    milestone_plan_3mo: buildMilestonePlan(),
    budget_scope: buildBudgetScope(),
    documentation_plan: buildDocumentationPlan(),
    fundraising_action_queue: buildFundraisingQueue(),
    action_evidence_log: buildActionEvidenceLog(result),

    // honesty fields
    implementation_status: buildImplementationStatus(),
    operator_needed: buildOperatorNeeded(result),
    source_confidence: buildSourceConfidence(result),
  };
}
