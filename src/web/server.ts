// Minimal, Render-deployable web wrapper around the agent pipeline.
//
//   npm run web   → starts an Express server on PORT (default 3000)
//   GET  /        → a single self-contained HTML page (inline CSS + JS, no build step)
//                   with a form (project + optional region + Run).
//   POST /run     → runs runAgent() and returns the full AgentRunResult as JSON.
//
// ─────────────────────────────────────────────────────────────────────────────
//  SECURITY BOUNDARY (load-bearing — DO NOT WEAKEN):
//
//  This is a PUBLIC web service. It MUST NOT sign live NEAR transactions on a
//  visitor's request, and MUST NOT touch any private key. Therefore the web path
//  NEVER instantiates NearCreditIssuer and NEVER reads ~/.near-credentials. The
//  on-chain step always runs through the default StubCreditIssuer (deterministic,
//  offline, key-free). This prevents key exposure and abuse/draining of the funded
//  testnet account.
//
//  The credit IS real and verifiable — it was demonstrated separately, off this
//  public form, against NEAR testnet. The UI links that verified tx prominently
//  (VERIFIED_ONCHAIN_TX_URL below).
//
//  Research uses the live Apify provider ONLY when APIFY_TOKEN is set in the
//  server-side environment (safe on Render); otherwise the offline StubResearchProvider.
// ─────────────────────────────────────────────────────────────────────────────

import express, { Request, Response } from 'express';
import { runAgent, RunOptions } from '../agent/run';
import { URBAN_HUB_FARMS } from '../demo/urban-hub-farms';
import { Opportunity } from '../types/opportunity';
import { ApifyResearchProvider } from '../research/apify-research';
// NOTE: NearCreditIssuer is intentionally NOT imported. The web path is key-free
// and always uses the default StubCreditIssuer (see SECURITY BOUNDARY above).

const PORT = Number(process.env.PORT) || 3000;

// The real, already-verified on-chain credit, demonstrated separately from this
// public form (NEAR testnet). Surfaced prominently in the UI.
const VERIFIED_ONCHAIN_TX_URL =
  'https://testnet.nearblocks.io/txns/E2pUh5m6NtLC4cPhbegxXXtQs15TuSfPa5taoZG16mXC';

// Build an Opportunity for the agent from a free-text project name + optional region.
// We start from the canonical Urban Hub Farms template (a real, fully-formed regen
// opportunity whose qualification / evidence / matrix data keep the pipeline valid
// and deterministic) and override only the visible identity — title + derived id —
// so the demo reflects the operator's input without inventing un-validated
// qualification data. The region flows through RunOptions.researchRegion.
function buildOpportunity(project: string, region?: string): Opportunity {
  const cleanProject = project.trim() || URBAN_HUB_FARMS.title;
  const slug =
    cleanProject
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'opportunity';

  return {
    ...URBAN_HUB_FARMS,
    opportunity_id: `web_${slug}`,
    title: cleanProject,
  };
}

// Pick the research provider from the server-side environment ONLY. APIFY_TOKEN is
// never read from the request body — visitors cannot supply credentials.
function pickResearcher() {
  if (process.env.APIFY_TOKEN?.trim()) {
    return new ApifyResearchProvider();
  }
  return undefined; // → runAgent defaults to StubResearchProvider (offline)
}

const app = express();
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.type('html').send(PAGE_HTML);
});

app.post('/run', async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as {
      project?: string;
      region?: string;
      withEvidence?: boolean;
    };
    const project = (body.project ?? '').toString();
    const region = body.region ? body.region.toString().trim() : undefined;

    const opportunity = buildOpportunity(project, region);

    const opts: RunOptions = {
      // Optional, operator-driven: simulate full evidence + validator approval so the
      // ISSUE_CREDIT branch is demoable. Default (false) → honest STAKE outcome.
      withEvidence: Boolean(body.withEvidence),
    };
    if (region) opts.researchRegion = region;
    const researcher = pickResearcher();
    if (researcher) opts.researcher = researcher;
    // opts.issuer is intentionally left unset → default StubCreditIssuer (key-free).

    const result = await runAgent(opportunity, opts);

    res.json({
      ok: true,
      researchMode: researcher ? 'apify-live' : 'stub-offline',
      chainMode: 'stub', // always stub on the public web path (security boundary)
      verifiedOnChainTxUrl: VERIFIED_ONCHAIN_TX_URL,
      result,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

// Only listen when run directly (so importing this module is side-effect-free).
if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `\n  Zentient Regen web demo listening on http://localhost:${PORT}\n` +
        `  research: ${process.env.APIFY_TOKEN?.trim() ? 'Apify (live)' : 'stub (offline)'}` +
        `   chain: stub (key-free — see SECURITY BOUNDARY in src/web/server.ts)\n`
    );
  });
}

export { app, buildOpportunity, VERIFIED_ONCHAIN_TX_URL };

// ── The page. Self-contained: inline CSS + JS, no separate build step. ──────────
// Intentionally clean-but-minimal — a later Studio pass restyles. The client JS
// posts to /run and renders the AgentRunResult into readable sections:
//   research → qualification → 7-dim score (+breakdown) → proof-plan (claim labels
//   + regional precedent scan) → credit decision (STAKE or ISSUE).
const PAGE_HTML = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Zentient Regen — proof-plans, not promises</title>
<style>
  :root {
    --bg: #0f1411; --panel: #161d18; --panel2: #1d2620; --line: #2b352d;
    --ink: #e8efe9; --muted: #9bb0a1; --accent: #4caf7e; --accent2: #7fd6a6;
    --warn: #e3b95b; --good: #5bd693; --chip: #223129;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--ink);
    font: 15px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .wrap { max-width: 880px; margin: 0 auto; padding: 32px 20px 80px; }
  header h1 { font-size: 26px; margin: 0 0 6px; letter-spacing: -0.01em; }
  header .sub { color: var(--muted); margin: 0 0 4px; }
  a { color: var(--accent2); }
  .banner {
    margin: 18px 0 24px; padding: 12px 14px; border: 1px solid var(--line);
    border-left: 3px solid var(--good); border-radius: 8px; background: var(--panel);
    font-size: 13.5px; color: var(--muted);
  }
  .banner strong { color: var(--ink); }
  form {
    display: grid; gap: 12px; padding: 18px; border: 1px solid var(--line);
    border-radius: 10px; background: var(--panel);
  }
  label { font-size: 13px; color: var(--muted); display: block; margin-bottom: 5px; }
  input[type=text] {
    width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--line);
    background: var(--panel2); color: var(--ink); font-size: 15px;
  }
  input[type=text]:focus { outline: none; border-color: var(--accent); }
  .row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .row > div { flex: 1 1 240px; }
  .check { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 13px; }
  button {
    padding: 10px 20px; border-radius: 8px; border: 1px solid var(--accent);
    background: var(--accent); color: #06210f; font-weight: 600; font-size: 15px;
    cursor: pointer;
  }
  button:disabled { opacity: 0.55; cursor: progress; }
  .out { margin-top: 26px; display: grid; gap: 16px; }
  .card {
    border: 1px solid var(--line); border-radius: 10px; background: var(--panel);
    overflow: hidden;
  }
  .card h2 {
    margin: 0; padding: 12px 16px; font-size: 13px; letter-spacing: 0.04em;
    text-transform: uppercase; color: var(--accent2); background: var(--panel2);
    border-bottom: 1px solid var(--line);
  }
  .card .body { padding: 14px 16px; }
  .kv { display: grid; grid-template-columns: 200px 1fr; gap: 4px 14px; font-size: 14px; }
  .kv dt { color: var(--muted); }
  .kv dd { margin: 0; }
  ul { margin: 8px 0 0; padding-left: 20px; }
  li { margin: 3px 0; }
  .chip {
    display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 12px;
    background: var(--chip); border: 1px solid var(--line); color: var(--accent2);
    margin: 2px 4px 2px 0;
  }
  .pill {
    display: inline-block; padding: 4px 12px; border-radius: 999px; font-weight: 600;
    font-size: 13px;
  }
  .pill.stake { background: #2a2410; color: var(--warn); border: 1px solid #4a3f1c; }
  .pill.issue { background: #102a1b; color: var(--good); border: 1px solid #1f4a32; }
  .pill.none { background: #2a1212; color: #e38b8b; border: 1px solid #4a1f1f; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--line); }
  th { color: var(--muted); font-weight: 600; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .muted { color: var(--muted); }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; word-break: break-all; }
  .disclaimer { font-style: italic; color: var(--muted); border-left: 2px solid var(--line); padding-left: 12px; margin-top: 10px; }
  .err { border-color: #5a2020; }
  .err h2 { color: #e38b8b; background: #2a1212; }
  details summary { cursor: pointer; color: var(--muted); font-size: 13px; }
  pre { white-space: pre-wrap; word-break: break-word; font-size: 12px; color: var(--muted); }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Zentient Regen — proof-plans, not promises</h1>
    <p class="sub">An autonomous agent that researches a regenerative project, scores it across 7 dimensions, emits a <strong>proof-plan</strong> (what must be verified — not a certification), and decides whether to stake the plan or issue a credit.</p>
  </header>

  <div class="banner">
    <strong>The credit is real and on-chain.</strong> To keep this public demo key-free and safe, the form below runs the full pipeline with a <em>stub</em> chain step — it never signs a live transaction or touches a private key. The on-chain credit was demonstrated separately and is verifiable here:
    <a href="${VERIFIED_ONCHAIN_TX_URL}" target="_blank" rel="noopener">verified on-chain credit — NEAR testnet ↗</a>
  </div>

  <form id="f">
    <div class="row">
      <div>
        <label for="project">Project</label>
        <input type="text" id="project" name="project" value="Urban Hub Farms" placeholder="e.g. Urban Hub Farms" />
      </div>
      <div>
        <label for="region">Region <span class="muted">(optional)</span></label>
        <input type="text" id="region" name="region" value="San Francisco Bay Area" placeholder="e.g. San Francisco Bay Area" />
      </div>
    </div>
    <div class="row">
      <label class="check"><input type="checkbox" id="withEvidence" /> Simulate full evidence + validator approval (demos the ISSUE-credit branch; default is the honest STAKE outcome)</label>
    </div>
    <div><button type="submit" id="run">Run</button></div>
  </form>

  <div class="out" id="out"></div>
</div>

<script>
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const DIM_LABELS = ['impact','monetization_readiness','agentic_fit','propagation','execution_ease','evidence_fit','mission_alignment'];

function card(title, inner, cls) {
  return '<div class="card ' + (cls||'') + '"><h2>' + esc(title) + '</h2><div class="body">' + inner + '</div></div>';
}
function kv(pairs) {
  return '<dl class="kv">' + pairs.map(([k,v]) => '<dt>' + esc(k) + '</dt><dd>' + v + '</dd>').join('') + '</dl>';
}

function renderResearch(r) {
  if (!r) return '';
  const titles = (r.findings||[]).map(f =>
    '<li>' + (f.url ? '<a href="'+esc(f.url)+'" target="_blank" rel="noopener">'+esc(f.title)+'</a>' : esc(f.title)) +
    (f.source ? ' <span class="muted">('+esc(f.source)+')</span>' : '') + '</li>').join('');
  return card('Stage 0 · Autonomous web research',
    kv([['query', '<span class="mono">'+esc(r.query)+'</span>'], ['findings', esc((r.findings||[]).length) + ' source(s)']]) +
    (titles ? '<ul>'+titles+'</ul>' : '') +
    '<p class="muted">'+esc(r.summary)+'</p>');
}

function renderQualification(q) {
  const yn = (b) => b ? '✓' : '✗';
  return card('Stage 1 · Qualification gate',
    kv([
      ['Maslow need', esc(q.maslow_need) + '  ' + yn(q.satisfies_maslow)],
      ['Wheel-of-Life slice', esc(q.wheel_of_life_slice) + '  ' + yn(q.satisfies_wheel)],
      ['regenerative', yn(q.satisfies_regenerative) + '  <span class="muted">('+esc(q.regenerative_contribution)+')</span>'],
      ['classification', '<strong>'+esc((q.classification||'').toUpperCase())+'</strong>'],
    ]) + (q.notes ? '<p class="muted">'+esc(q.notes)+'</p>' : ''));
}

function renderScore(s) {
  if (!s) return '';
  const rows = DIM_LABELS.map(d => {
    const sc = s.core_scores ? s.core_scores[d] : undefined;
    return '<tr><td>'+esc(d)+'</td><td class="num">'+esc(sc)+'</td></tr>';
  }).join('');
  const rationale = (s.rationale||[]).map(x => '<li>'+esc(x)+'</li>').join('');
  return card('Stage 2 · 7-dimension research score',
    kv([
      ['weighted average', '<strong>'+esc(s.avg)+'</strong>'],
      ['recommendation', '<span class="chip">'+esc((s.recommendation||'').toUpperCase())+'</span>'],
    ]) +
    '<table><thead><tr><th>dimension</th><th class="num">score</th></tr></thead><tbody>'+rows+'</tbody></table>' +
    (rationale ? '<ul>'+rationale+'</ul>' : ''));
}

function renderProofPlan(pp, hash) {
  if (!pp) return '';
  // Claim labels = the proof-plan's evidence requirements (what must be verified).
  const reqs = (pp.evidence_requirements||[]).map(r =>
    '<li>' + esc(r.evidence_type) + ' <span class="chip">' + (r.required ? 'REQUIRED' : 'optional') +
    (r.hash_required ? ' · hashed' : '') + '</span></li>').join('');

  let scanHtml = '';
  const scan = pp.regional_precedent_scan;
  if (scan) {
    const items = (scan.precedents||[]).map(p =>
      '<li>' + (p.url ? '<a href="'+esc(p.url)+'" target="_blank" rel="noopener">'+esc(p.title)+'</a>' : esc(p.title)) +
      (p.snippet ? '<br><span class="muted">'+esc(p.snippet)+'</span>' : '') + '</li>').join('');
    scanHtml = '<h3 style="margin:14px 0 4px;font-size:13px;color:var(--muted)">Regional Precedent &amp; Evidence Scan</h3>' +
      (items ? '<ul>'+items+'</ul>' : '') +
      '<p class="muted">'+esc(scan.summary)+'</p>';
  }

  return card('Stage 3 · Proof-plan (what must be verified — NOT a certification)',
    kv([
      ['proof_plan_id', '<span class="mono">'+esc(pp.proof_plan_id)+'</span>'],
      ['handoff status', esc(pp.validator_handoff_preview ? pp.validator_handoff_preview.status : '')],
      ['min evidence count', esc(pp.submission_bundle ? pp.submission_bundle.min_count : '')],
      ['proof_plan_hash', '<span class="mono">'+esc(hash)+'</span>'],
    ]) +
    '<h3 style="margin:14px 0 4px;font-size:13px;color:var(--muted)">Evidence requirements (claim labels)</h3>' +
    '<ul>'+reqs+'</ul>' +
    scanHtml +
    '<p class="disclaimer">'+esc(pp.disclaimer)+'</p>');
}

function renderDecision(ca, receipt, verifiedUrl) {
  if (!ca) return '';
  const d = ca.decision || '';
  const cls = d === 'ISSUE_CREDIT' ? 'issue' : d.startsWith('STAKE') ? 'stake' : (d === 'NO_ACTION' ? 'none' : 'stake');
  let inner = '<p><span class="pill '+cls+'">'+esc(d)+'</span></p>' +
    kv([['reason', esc(ca.reason)]]);
  if ((ca.requiredEvidenceTypes||[]).length) {
    inner += kv([
      ['required evidence', (ca.requiredEvidenceTypes||[]).map(e=>'<span class="chip">'+esc(e)+'</span>').join('')],
      ['missing evidence', (ca.missingEvidenceTypes||[]).length ? (ca.missingEvidenceTypes).map(e=>'<span class="chip">'+esc(e)+'</span>').join('') : '<span class="muted">(none)</span>'],
    ]);
  }
  if (receipt) {
    inner += '<h3 style="margin:14px 0 4px;font-size:13px;color:var(--muted)">Credit receipt (stub chain on this public demo)</h3>' +
      kv([
        ['network', esc(receipt.network)],
        ['amount', esc(receipt.amount) + ' REGEN-CREDIT (demo units)'],
        ['proofPlanHash', '<span class="mono">'+esc(receipt.proofPlanHash)+'</span>'],
        ['txHash', '<span class="mono">'+esc(receipt.txHash)+'</span>'],
      ]) +
      '<p class="muted">'+esc(receipt.display)+'</p>' +
      '<p class="muted">This receipt is from the key-free stub chain. The <strong>real</strong> on-chain credit is verifiable here: <a href="'+esc(verifiedUrl)+'" target="_blank" rel="noopener">NEAR testnet ↗</a></p>';
  } else {
    inner += '<p class="muted">No credit minted — this is the honest default. The agent staked/registered the proof-plan and awaits evidence + an independent validator approval before any mint. It never self-certifies impact.</p>';
  }
  return card('Stage 4 · Credit decision', inner, cls === 'issue' ? '' : '');
}

$('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('run');
  const out = $('out');
  btn.disabled = true; btn.textContent = 'Running…';
  out.innerHTML = '<p class="muted">Running the agent pipeline…</p>';
  try {
    const resp = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: $('project').value,
        region: $('region').value,
        withEvidence: $('withEvidence').checked,
      }),
    });
    const data = await resp.json();
    if (!data.ok) {
      out.innerHTML = card('Error', '<pre>'+esc(data.error)+'</pre>', 'err');
      return;
    }
    const r = data.result;
    const head = card('Run', kv([
      ['title', esc(r.opportunity ? r.opportunity.title : '')],
      ['tier / track', esc(r.opportunity ? (r.opportunity.tier + ' / ' + r.opportunity.track) : '')],
      ['research mode', esc(data.researchMode)],
      ['chain mode', esc(data.chainMode) + ' <span class="muted">(public demo never signs live; key-free)</span>'],
    ]));
    let html = head + renderResearch(r.research) + renderQualification(r.qualification);
    if (r.haltedAtQualification) {
      html += card('Decision', '<p><span class="pill none">NO_ACTION</span></p><p class="muted">The opportunity does not qualify yet. The agent takes no action.</p>');
    } else {
      html += renderScore(r.score) + renderProofPlan(r.proofPlan, r.proofPlanHash) +
        renderDecision(r.creditAction, r.receipt, data.verifiedOnChainTxUrl);
    }
    html += '<details><summary>Raw JSON</summary><pre>'+esc(JSON.stringify(data, null, 2))+'</pre></details>';
    out.innerHTML = html;
  } catch (err) {
    out.innerHTML = card('Error', '<pre>'+esc(err && err.message ? err.message : String(err))+'</pre>', 'err');
  } finally {
    btn.disabled = false; btn.textContent = 'Run';
  }
});
</script>
</body>
</html>`;
