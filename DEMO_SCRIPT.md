# Demo Script — The Nurturing Agent
### Food Resilience Co-Steward for Urban Hub Farms · NEAR AI / Applied Intelligence Hackathon ("Agents That Act")

**Target length:** ~2:00–2:20 · **Narration budget:** ~360 words at ~150–155 wpm · **Read aloud while screen-recording.** (Five tool-beats run long; a brisk-but-natural pace lands ~2:15. To hit a hard 2:00, take the two trims flagged under *Timing discipline*.)

**The demo arc:** hook the stakes → run the live autonomous tool-chain → land on the *refusal* (the wow-moment) → cut to the real on-chain tx → close on the soul-line.

**The smart move:** run **`npm run demo:sponsors`** live on camera. It chains five sponsor tools end-to-end — **Apify** (research) → **NEAR AI Cloud** (reasoning) → a **deterministic scorer + proof-plan** → **Tigris** (transparent ledger) — and ends in the agent **refusing to mint**. The model reasons; a deterministic gate decides — the AI is *not allowed* to self-certify. That refusal IS the product. Then cut to the **pre-loaded NEAR explorer tab** to prove the same agent *did* act on-chain when evidence authorized it. No risky live key-signing on camera — NEAR AI Cloud + Tigris are the only live calls, and both are fast and stable.

---

## SHOT-BY-SHOT

| Time | WHAT TO SAY (verbatim) | WHAT TO SHOW ON SCREEN |
|---|---|---|
| **0:00–0:10** *(hook — the stakes)* | "San Francisco is losing tens of thousands of jobs to AI — and still imports almost all its food. Urban Hub Farms turns empty walls into community food gardens. But who proves a regen project really works, without rubber-stamping it?" | **Tab 1 — DEVPOST.md** open, scrolled to the title + tagline ("…researches, labels every claim by its evidence, acts on NEAR, and *refuses* to overclaim"). Or a single title slide. |
| **0:10–0:22** *(meet the agent — name the chain)* | "This is the Nurturing Agent. Live on Urban Hub Farms, it autonomously chains five tools: Apify research, NEAR AI Cloud reasoning, a deterministic scorer and proof-plan, a Tigris audit ledger, and action on NEAR — all on its own account." | **Tab 2 — terminal**, clean/cleared. Type and run: `npm run demo:sponsors`. Keep the header banners visible (`▶ REASONING: NEAR AI Cloud  (real OpenAI-compatible inference via cloud.near.ai — needs NEAR_AI_API_KEY) · model reasons, gate decides` · `▶ LEDGER: Tigris`). |
| **0:22–0:36** *(research → score)* | "First it gathers its own evidence — real SF precedents: Rec & Parks gardens, Urban Tilth, the AB-551 zones. Then it scores across seven dimensions. Seventy-three — shortlist. Research informs the plan but never touches the score. Hunter is not the judge." | Scroll terminal through **STAGE 0** (5 findings) and **STAGE 2** (7-dim table → `WEIGHTED AVERAGE 73`, `SHORTLIST`). Let the 7-dim breakdown sit ~3s. |
| **0:36–0:48** *(the proof-plan, not a certificate)* | "Then — the heart of it — instead of a certificate it writes a proof-plan: the exact evidence that would *graduate* each claim from plausible to proven, and it signs the whole plan with one hash." | Scroll to **STAGE 3**: the hashed evidence requirements, `proof_plan_hash 113032a4…`, stop on the **`── disclaimer ──`** line. Let the disclaimer sit. |
| **0:48–1:02** *(the model reasons — but does NOT decide)* | "Now NEAR AI Cloud reads the research, score, and plan and explains its thinking in plain language. But watch this line: *reasoning by NEAR AI Cloud — decision by a deterministic gate.* The model explains; it is **not allowed** to certify itself. That's the whole point." | Scroll to **STAGE 3.5 — Reasoning (NEAR AI Cloud (anthropic/claude-haiku-4-5))**. Land on the closing line: `⚖ reasoning by NEAR AI Cloud (anthropic/claude-haiku-4-5) · decision by deterministic gate (the model does not self-certify)`. Hold ~3s — this is a key originality beat. |
| **1:02–1:18** *(the wow-moment — it REFUSES)* | "So the gate decides. Good score, plan ready — a normal 'AI certifier' mints right here. This one stops. The evidence isn't in, so it stakes the plan and issues *no credit*. It refuses to overclaim — and that refusal is the product." | Scroll through **STAGE 4** (`decision  STAKE_PROOF_PLAN_ONLY` → "No credit issued — required evidence not yet submitted/verified") into **STAGE 5** — let the white text sit: *"No credit issued … the agent never self-certifies impact."* This is the screenshot of the whole demo. |
| **1:18–1:28** *(Tigris — the auditable trail)* | "And every step — the plan and the no-mint decision — is written to a transparent Tigris ledger. It records refusals, not just mints — the same trail where each project's contributions get tracked." | Scroll to **STAGE 6 — Transparent ledger (Tigris)**: `proof-plan + decision persisted to Tigris → regen-near-agent-ledger/<id>/<timestamp>.json`. ~2–3s. |
| **1:28–1:42** *(…but it CAN act — real on-chain proof)* | "But when the evidence *is* in and a validator approves, it acts for real — signing its own NEAR transaction and anchoring the proof-plan hash on testnet. Here's one it already sent. Real account, real transaction, public explorer." | **Cut to Tab 3 — pre-loaded NEAR explorer**: `https://testnet.nearblocks.io/txns/E2pUh5m6NtLC4cPhbegxXXtQs15TuSfPa5taoZG16mXC` — point at status (Success) and signer `regen-agent-1780248058.testnet`. Optionally hover the `add_message` args (REGEN-CREDIT + hash payload). |
| **1:42–2:00** *(close — the soul-line)* | "Five tools, one autonomous loop. The hardest part of regenerative finance was never *issuing* credits — it's *refusing* to. It acts where evidence authorizes it, returns to human judgment where it doesn't, and never claims more than the evidence allows. That's the Nurturing Agent. Thank you." | Back to **STAGE 5 refusal text**, OR a closing slide with the two soul-lines + the tx hash + repo URL `github.com/alcabal-1/regen-near-agent`. Hold on the disclaimer line to end. |

---

## PRE-RECORD CHECKLIST

**The five sponsor tools the take must show (name them in narration):**
1. **Apify** — autonomous web research (STAGE 0). *On camera this runs as the deterministic stub — say "research," not "live Apify," unless `APIFY_TOKEN` is set and tested.*
2. **NEAR AI Cloud** (`anthropic/claude-haiku-4-5`, via cloud.near.ai) — plain-language reasoning (STAGE 3.5). **Live on the take** (needs `NEAR_AI_API_KEY`).
3. **Deterministic scorer + proof-plan** — the 7-dim score + hashed plan + the gate that actually decides (STAGE 2–4). This is the "AI does not self-certify" core.
4. **Tigris** — transparent S3-compatible audit ledger (STAGE 6). **Live on the take** (needs `TIGRIS_BUCKET` + `AWS_*`).
5. **NEAR** — on-chain action, shown via the pre-loaded explorer tab (the agent's own signed tx).

**Terminal**
- Font size **18–22pt**, max-width window, dark theme, high contrast. The 7-dim table, the STAGE banners, and the `⚖` reasoning-doctrine line must be legible at 1080p.
- `cd /home/alcabal/regen-near-agent` and run `npm run demo:sponsors` **once before recording** to warm tsx (first run is slower), confirm node_modules is present, and confirm the NEAR AI Cloud + Tigris calls succeed (see env note below).
- **Clear the scrollback** right before the take so the only thing on screen when you hit record is a clean prompt.
- Optional: pre-type `npm run demo:sponsors` but don't press Enter until the camera's rolling.

**Env required for the `demo:sponsors` take** (set in `.env`):
- `NEAR_AI_API_KEY` — for live NEAR AI Cloud reasoning (STAGE 3.5), `anthropic/claude-haiku-4-5` via cloud.near.ai. *(Optional fallback: `GLM_API_KEY` with `npm run demo:glm` / `--glm` still works as the legacy reasoning path, but the recorded take uses NEAR AI Cloud.)*
- `TIGRIS_BUCKET` + `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` (+ `AWS_ENDPOINT_URL_S3` if your Tigris setup needs it) — for the live Tigris ledger write (STAGE 6).
- `APIFY_TOKEN` is **optional** — leave it unset and STAGE 0 uses the offline stub (this is the recommended camera path).
- **If NEAR AI Cloud or Tigris isn't configured at record time, fall back to `npm run demo`** — the key-free floor. Same arc and same refusal; STAGE 3.5 narrates with the stub reasoner (the `⚖ reasoning by stub · decision by deterministic gate` line still lands the doctrine point) and STAGE 6 writes to the local ledger. Adjust the 0:10 and 0:48/1:18 narration to drop the brand names if you go this route.

**Tabs to have open (in this order)**
1. **DEVPOST.md** (title/tagline at top; "One organ of a larger swarm" section bookmarked if you want it as a fallback beat).
2. **Terminal** at the repo root.
3. **NEAR explorer**, PRE-LOADED to the verified tx (see exact URL below) so it's already rendered — do NOT load it live on camera.

**Exact URL to pre-load (the real on-chain proof)**
```
https://testnet.nearblocks.io/txns/E2pUh5m6NtLC4cPhbegxXXtQs15TuSfPa5taoZG16mXC
```
- Agent identity to point at: `regen-agent-1780248058.testnet`
- Backup explorer if nearblocks testnet is flaky: `https://explorer.testnet.near.org/transactions/E2pUh5m6NtLC4cPhbegxXXtQs15TuSfPa5taoZG16mXC`
- **Take a screenshot of the loaded explorer page now** as an offline fallback in case the site is down at record time.

**The live command for the take**
```bash
npm run demo:sponsors   # Apify(stub) → NEAR AI Cloud(live) → scorer/proof-plan → Tigris(live) → refuse-to-mint. Runs --near-ai --tigris. Chain stays stub in-terminal.
```
This is the path you record. It ALWAYS ends in `STAKE_PROOF_PLAN_ONLY` + "No credit issued" — that's the wow-moment, and it never depends on the *chain* network. (The on-camera path does NOT sign a NEAR tx — the real one is the pre-loaded explorer tab.)

**The "it CAN act" proof = the pre-loaded explorer tab.** You are NOT signing a live tx on camera. The explorer tab is the evidence that the agent already did.

**Optional in-terminal mint path (still safe to show):**
```bash
npm run demo:sponsors -- --with-evidence   # NEAR AI Cloud + Tigris live, simulates evidence + validator approve → ISSUE_CREDIT, prints a tx + 73.00 REGEN-CREDIT (STUB chain — explorerUrl is stub.local)
```
Use this only if the explorer is unreachable AND you didn't grab a screenshot. Say "stub chain" if you show it — don't imply stub.local is the real tx.

**Timing discipline**
- The script is ~360 words — at a brisk-but-natural ~150–155 wpm it lands ~2:15–2:20 alongside the on-screen scrolling. To hit a hard **2:00**, make these two trims (they lose no load-bearing point): (1) cut the 0:22 research beat to "It gathers its own SF precedents, then scores across seven dimensions — seventy-three, shortlist. Hunter is not the judge." (2) cut the 1:18 Tigris beat to "Every step is written to a transparent Tigris ledger — refusals, not just mints."
- The three beats that must NOT be rushed: the **0:48 NEAR AI Cloud "reasons, gate decides"** line, the **1:02 refusal** (Stage 4/5), and the **1:28 explorer** — those land technical execution, originality, and "it actually acts." The five-tool naming at 0:10 and the close at 1:42 are the framing the judges score on "effective use of sponsor tools" — keep both intact.

**One-line framing if a judge asks "but does it actually act?"**
"Yes — the refusal and the mint are the same gate. NEAR AI Cloud reasons but never decides; when evidence is missing the gate stakes and stops, when a validator approves the agent signs its own NEAR tx and anchors the hash. The explorer tab is one it already sent."

**One-line framing if a judge asks "what does it do with sponsor tools?"**
"It autonomously orchestrates five: Apify researches, NEAR AI Cloud reasons, a deterministic scorer + proof-plan gate decides, Tigris keeps the audit trail, and NEAR is the on-chain action — the agent owns its own account and signs its own transactions."
