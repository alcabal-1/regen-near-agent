// CLI entry + programmatic export.
//
//   npm run demo                                 → Urban Hub Farms, stub chain, stub research, honest STAKE outcome
//   npm run demo -- --with-evidence              → full ISSUE_CREDIT path (stub tx, stub research)
//   npm run demo:near -- --with-evidence         → full ISSUE_CREDIT path, REAL NEAR testnet tx
//   npm run demo:research -- --with-evidence      → REAL Apify web research + REAL NEAR tx (needs APIFY_TOKEN)
//
// Flags:
//   --near      swaps StubCreditIssuer  → NearCreditIssuer     (real on-chain anchor)
//   --research  swaps StubResearchProvider → ApifyResearchProvider (real web scraping, needs APIFY_TOKEN)
// Everything upstream of each seam is identical regardless of which flags are set.
//
// Also exports runAgent(opportunity, opts) for programmatic use.

import { runAgent, RunOptions, AgentRunResult } from './agent/run';
import { URBAN_HUB_FARMS } from './demo/urban-hub-farms';
import { CoreScores } from './types/research-score';
import { DEFAULT_WEIGHTS, THRESHOLDS } from './scoring/weights';
import { NearCreditIssuer } from './chain/near-issuer';
import { ApifyResearchProvider } from './research/apify-research';
import { buildMaEarthPackage, MaEarthPackage } from './maearth/maearth-package';

export { runAgent } from './agent/run';
export type { RunOptions, AgentRunResult } from './agent/run';
export { URBAN_HUB_FARMS } from './demo/urban-hub-farms';
// Grant-application package builder (MaEarth / Restor) — chain-free, programmatic use.
export { buildMaEarthPackage } from './maearth/maearth-package';
export type { MaEarthPackage } from './maearth/maearth-package';

// ── tiny console helpers ─────────────────────────────────────────────────────
const BAR =
  '════════════════════════════════════════════════════════════════════════════';
function header(stage: string, title: string): void {
  console.log('\n' + BAR);
  console.log(`  ${stage}  ${title}`);
  console.log(BAR);
}
function kv(key: string, value: string | number): void {
  console.log(`  ${key.padEnd(26)} ${value}`);
}
function bullet(s: string): void {
  console.log(`    • ${s}`);
}

const DIM_LABELS: Array<keyof CoreScores> = [
  'impact',
  'monetization_readiness',
  'agentic_fit',
  'propagation',
  'execution_ease',
  'evidence_fit',
  'mission_alignment',
];

function printScoreBreakdown(core: CoreScores, avg: number): void {
  console.log('  dimension                  score   weight   weighted');
  console.log('  ' + '-'.repeat(54));
  for (const dim of DIM_LABELS) {
    const w = DEFAULT_WEIGHTS[dim];
    const weighted = (core[dim] * w).toFixed(1);
    console.log(
      `  ${dim.padEnd(26)} ${String(core[dim]).padStart(3)}    ${w
        .toFixed(2)
        .padStart(5)}    ${weighted.padStart(6)}`
    );
  }
  console.log('  ' + '-'.repeat(54));
  kv('WEIGHTED AVERAGE', avg);
}

function printResearch(result: AgentRunResult): void {
  if (!result.research) return;
  const r = result.research;
  header('STAGE 0', 'Autonomous web research (the agent gathers its own evidence)');
  kv('query', r.query);
  kv('findings', `${r.findings.length} source${r.findings.length === 1 ? '' : 's'}`);
  if (r.findings.length) {
    console.log('  finding titles');
    r.findings.forEach((f) => bullet(f.title));
  }
  console.log('  summary');
  console.log(`    ${r.summary}`);
}

function printResult(result: AgentRunResult): void {
  const { opportunity: o } = result;

  header('AGENT', 'Zentient Regen — autonomous scoring + on-chain credit agent');
  kv('opportunity_id', o.opportunity_id);
  kv('title', o.title);
  kv('tier / track', `${o.tier} / ${o.track}`);
  console.log(`  statement\n    "${o.normalized_activity_statement}"`);

  // ── Stage 0: Autonomous research (acts-not-reasons) ─────────────────────────
  printResearch(result);

  // ── Stage 1: Qualification ──────────────────────────────────────────────────
  header('STAGE 1', 'Qualification gate (Maslow ∧ Wheel-of-Life ∧ regenerative)');
  const q = result.qualification;
  kv('Maslow need', `${q.maslow_need}  ${q.satisfies_maslow ? '✓' : '✗'}`);
  kv('Wheel-of-Life slice', `${q.wheel_of_life_slice}  ${q.satisfies_wheel ? '✓' : '✗'}`);
  kv(
    'regenerative',
    `${q.satisfies_regenerative ? '✓' : '✗'}  (${q.regenerative_contribution})`
  );
  kv('→ classification', q.classification.toUpperCase());
  if (q.notes) console.log(`  notes\n    ${q.notes}`);

  if (result.haltedAtQualification) {
    header('DECISION', 'NO_ACTION');
    console.log('  The opportunity does not qualify yet. The agent takes no action.');
    return;
  }

  // ── Stage 2: 7-dimension score ──────────────────────────────────────────────
  header('STAGE 2', '7-dimension research score');
  printScoreBreakdown(result.score!.core_scores, result.score!.avg);
  kv(
    'recommendation',
    `${result.score!.recommendation.toUpperCase()}  ` +
      `(shortlist≥${THRESHOLDS.shortlist}, research_later≥${THRESHOLDS.allow}, else reject)`
  );
  console.log('  rationale');
  result.score!.rationale.forEach(bullet);

  // ── Stage 3: Proof-plan ─────────────────────────────────────────────────────
  header('STAGE 3', 'Proof-plan (what must be verified — NOT a certification)');
  const pp = result.proofPlan!;
  kv('proof_plan_id', pp.proof_plan_id);
  kv('handoff status', pp.validator_handoff_preview.status);
  kv('min evidence count', pp.submission_bundle.min_count);
  console.log('  evidence requirements');
  pp.evidence_requirements.forEach((r) =>
    bullet(
      `${r.evidence_type}  [${r.required ? 'REQUIRED' : 'optional'}${
        r.hash_required ? ', hashed' : ''
      }]`
    )
  );
  if (pp.regional_precedent_scan) {
    const scan = pp.regional_precedent_scan;
    console.log('  ── Regional Precedent & Evidence Scan (from web research) ──');
    kv('  scan query', scan.query);
    scan.precedents.forEach((p) => {
      bullet(`${p.title}${p.url ? `  <${p.url}>` : ''}`);
    });
    console.log(`    scope: ${scan.summary}`);
  }
  kv('proof_plan_hash', result.proofPlanHash!);
  console.log('  ── disclaimer ──');
  console.log(`    "${pp.disclaimer}"`);

  // ── Stage 4: Credit decision ────────────────────────────────────────────────
  header('STAGE 4', 'Credit decision (honest defaults; no self-certification)');
  const ca = result.creditAction!;
  kv('decision', ca.decision);
  console.log(`  reason\n    ${ca.reason}`);
  if (ca.requiredEvidenceTypes.length) {
    kv('required evidence', ca.requiredEvidenceTypes.join(', '));
    kv(
      'missing evidence',
      ca.missingEvidenceTypes.length ? ca.missingEvidenceTypes.join(', ') : '(none)'
    );
  }
  if (ca.registerEntry) {
    console.log('  RegenWeb4Opportunity register entry (staked, NOT minted):');
    console.log(
      JSON.stringify(ca.registerEntry, null, 2)
        .split('\n')
        .map((l) => '    ' + l)
        .join('\n')
    );
  }

  // ── Stage 5: On-chain credit receipt ────────────────────────────────────────
  header('STAGE 5', 'On-chain credit action (stub chain — NEAR plugs in here)');
  if (result.receipt) {
    const r = result.receipt;
    kv('network', r.network);
    kv('amount', `${r.amount} REGEN-CREDIT (demo units)`);
    kv('proofPlanHash', r.proofPlanHash);
    kv('txHash', r.txHash);
    kv('explorerUrl', r.explorerUrl);
    console.log(`  display\n    ${r.display}`);
    console.log(
      '\n  NOTE: testnet/stub framing — this is "proof of economic agency",\n' +
        '  NOT a certified carbon offset.'
    );
  } else {
    console.log('  No credit issued. (Outcome: ' + ca.decision + '.)');
    console.log(
      '  The agent staked/registered the proof-plan and is awaiting evidence\n' +
        '  and an independent validator approval before any mint. This is the\n' +
        '  honest default — the agent never self-certifies impact.'
    );
  }

  console.log('\n' + BAR + '\n');
}

// ── MaEarth grant-package pretty-printer ─────────────────────────────────────────
function printMaEarthPackage(pkg: MaEarthPackage): void {
  header('MA EARTH', 'Grant-application package (Restor) — place-led, nature-funder-safe, honesty-flagged');

  console.log('  PROJECT SUMMARY (place-led)');
  console.log(`    ${pkg.project_summary}`);

  console.log('\n  CATEGORY FIT');
  pkg.category_fit.forEach((c) => bullet(`${c.category}: ${c.reasoning}`));

  console.log('\n  ELIGIBILITY CHECK');
  pkg.eligibility_check.forEach((e) =>
    bullet(`${e.criterion.padEnd(20)} [${e.status}]  ${e.note}`)
  );

  console.log('\n  CLAIM LABELS (derived from the proof-plan)');
  pkg.claim_labels.forEach((c) =>
    bullet(`[${c.label}] (${c.source_confidence})  ${c.claim}`)
  );

  console.log('\n  MISSING EVIDENCE');
  pkg.missing_evidence.forEach(bullet);

  console.log('\n  OPERATOR-ONLY BLOCKERS');
  pkg.operator_only_blockers.forEach(bullet);

  console.log('\n  3-MONTH MILESTONE PLAN (DRAFT)');
  pkg.milestone_plan_3mo.forEach((m) => {
    bullet(`Month ${m.month}: ${m.milestone}`);
    console.log(`        evidence → ${m.evidence}`);
  });

  console.log('\n  BUDGET SCOPE (target ~$2,000 band — DRAFT)');
  pkg.budget_scope.line_items.forEach((li) =>
    console.log(`    • $${String(li.usd).padStart(5)}  ${li.item}`)
  );
  kv('  TOTAL', `$${pkg.budget_scope.total_usd}`);

  console.log('\n  DOCUMENTATION PLAN');
  pkg.documentation_plan.forEach(bullet);

  console.log('\n  FUNDRAISING ACTION QUEUE (community supporters)');
  pkg.fundraising_action_queue.forEach(bullet);

  console.log('\n  ACTION EVIDENCE LOG (what the agent did)');
  pkg.action_evidence_log.forEach(bullet);

  console.log('\n  ── HONESTY FIELDS (anti-overclaim) ──');
  console.log('  implementation_status (per field)');
  pkg.implementation_status.forEach((f) =>
    bullet(`${f.field.padEnd(24)} [${f.status}]  ${f.note}`)
  );
  console.log('  operator_needed (hard human inputs blocking submission)');
  pkg.operator_needed.forEach(bullet);
  console.log('  source_confidence (per generated claim)');
  pkg.source_confidence.forEach((c) =>
    bullet(`[${c.source_confidence}]  ${c.claim}`)
  );

  console.log('\n' + BAR + '\n');
}

async function main(): Promise<void> {
  const withEvidence = process.argv.includes('--with-evidence');
  const useNear = process.argv.includes('--near');
  const useResearch = process.argv.includes('--research');
  const useMaEarth = process.argv.includes('--maearth');
  const opts: RunOptions = { withEvidence };
  if (useNear) opts.issuer = new NearCreditIssuer();
  if (useResearch) opts.researcher = new ApifyResearchProvider();

  console.log(
    withEvidence
      ? '\n▶ MODE: --with-evidence  (simulating full evidence + validator approval → ISSUE_CREDIT path)'
      : '\n▶ MODE: default  (Urban Hub Farms, evidence not yet submitted → honest STAKE outcome)'
  );
  if (useMaEarth) {
    console.log(
      '▶ MA EARTH: building grant-application package (place-led, nature-funder-safe, honesty-flagged)'
    );
  }
  console.log(
    useResearch
      ? '▶ RESEARCH: Apify web scraping  (real apify/rag-web-browser run — needs APIFY_TOKEN)'
      : '▶ RESEARCH: stub  (deterministic offline regional-precedent findings)'
  );
  console.log(
    useNear
      ? '▶ CHAIN: NEAR testnet  (real signAndSendTransaction via FastNEAR — explorer-verifiable)'
      : '▶ CHAIN: stub  (deterministic offline receipt)'
  );

  const result = await runAgent(URBAN_HUB_FARMS, opts);
  printResult(result);

  // MaEarth grant package — chain-free, derived from the run above. Attached to the
  // result (so programmatic callers can read result.maEarthPackage) and pretty-printed.
  if (useMaEarth && !result.haltedAtQualification) {
    const pkg = buildMaEarthPackage(result);
    result.maEarthPackage = pkg;
    printMaEarthPackage(pkg);
  }
}

// Run only when invoked directly (so importing this module for runAgent is side-effect-free).
if (require.main === module) {
  main().catch((err) => {
    console.error('Agent run failed:', err);
    process.exit(1);
  });
}
