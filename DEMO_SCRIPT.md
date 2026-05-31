# Demo Script — The Nurturing Agent
### Food Resilience Co-Steward for Urban Hub Farms · NEAR AI / Applied Intelligence Hackathon ("Agents That Act")

**Target length:** ~2:00 · **Narration budget:** ~285 words at ~140 wpm · **Read aloud while screen-recording.**

**The demo arc:** hook the stakes → run the live loop → land on the *refusal* (the wow-moment) → cut to the real on-chain tx → close on the soul-line.

**The smart move:** run the **default** path live on camera — it is deterministic, offline, always green, and it ends in the agent **refusing to mint**. That refusal IS the product. Then cut to the **pre-loaded NEAR explorer tab** to prove the same agent *did* act on-chain when evidence authorized it. No risky live key-signing on camera.

---

## SHOT-BY-SHOT

| Time | WHAT TO SAY (verbatim) | WHAT TO SHOW ON SCREEN |
|---|---|---|
| **0:00–0:10** *(hook — the stakes)* | "San Francisco is about to lose tens of thousands of jobs to AI — and it still imports almost all its food. Urban Hub Farms turns empty walls into community food gardens. But who proves a regenerative project actually works — without just rubber-stamping it?" | **Tab 1 — DEVPOST.md** open, scrolled to the title + tagline ("…researches, labels every claim by its evidence, acts on NEAR, and *refuses* to overclaim"). Or a single title slide. |
| **0:10–0:22** *(meet the agent)* | "This is the Nurturing Agent. It owns its own NEAR account, it researches, it scores, it writes a proof-plan — and it acts on-chain. Watch it run the whole loop on Urban Hub Farms, live." | **Tab 2 — terminal**, clean/cleared. Type and run: `npm run demo` — keep the header banner visible (`▶ MODE: default … honest STAKE outcome`). |
| **0:22–0:38** *(research → score)* | "First it gathers its own evidence — real SF precedents: Rec & Parks community gardens, Urban Tilth, the AB-551 incentive zones. Then it scores the project across seven dimensions. Seventy-three. Shortlist. Notice — research informs the plan, but it never touches the score. Hunter is not the judge." | Scroll terminal through **STAGE 0** (5 findings) and **STAGE 2** (7-dim table → `WEIGHTED AVERAGE 73`, `SHORTLIST`). Let the 7-dim breakdown sit on screen ~3s. |
| **0:38–0:52** *(the proof-plan, not a certificate)* | "Then — and this is the heart of it — instead of a certificate, it writes a proof-plan: six pieces of evidence that would *graduate* each claim from plausible to proven. And it signs every plan with one line." | Scroll to **STAGE 3**: the 6 hashed evidence requirements, the `proof_plan_hash 113032a4…`, and stop on the **`── disclaimer ──`** line. Let the disclaimer sit on screen. |
| **0:52–1:12** *(the wow-moment — it REFUSES)* | "Now the act. The project scored well. The plan is ready. A normal 'AI certifier' mints right here. This one stops. The evidence isn't in yet — so it stakes the plan, registers it on-chain as pending, and issues *no credit*. It refuses to overclaim. That refusal is the product." | Scroll to **STAGE 4** (`decision  STAKE_PROOF_PLAN_ONLY`, the staked register entry) and **STAGE 5** — let the white text sit: *"No credit issued … the agent never self-certifies impact."* This is the screenshot of the whole demo. |
| **1:12–1:30** *(…but it CAN act — real on-chain proof)* | "But when the evidence *is* in and an independent validator approves — the agent acts for real. It signs its own NEAR transaction and anchors the proof-plan hash on testnet. Here's one it already sent. Real account, real transaction, on the public explorer." | **Cut to Tab 3 — pre-loaded NEAR explorer**: `https://testnet.nearblocks.io/txns/E2pUh5m6NtLC4cPhbegxXXtQs15TuSfPa5taoZG16mXC` — point at the tx status (Success) and the signer `regen-agent-1780248058.testnet`. Optionally hover the `add_message` args showing the REGEN-CREDIT + hash payload. |
| **1:30–1:42** *(one organ of a swarm)* | "And this is one organ. A Proofplan satellite today — Market-Research, Permitting, and Design-Build satellites next, all re-pointed at feeding cities. One organ acting; a whole swarm behind it." | **Tab 1 — DEVPOST.md**, scroll to **"One organ of a larger swarm"** (or the 4-satellite table). 2–3s, don't linger. |
| **1:42–2:00** *(close — the soul-line)* | "The hard part of regenerative finance was never *issuing* credits. It's *refusing* to. The agent acts where evidence authorizes action — and returns to human judgment where legitimacy isn't there yet. It does not make a claim stronger than the evidence allows. That's the Nurturing Agent. Thank you." | Back to **STAGE 5 refusal text** OR a closing slide with the two soul-lines + the tx hash + repo URL `github.com/alcabal-1/regen-near-agent`. Hold on the disclaimer line to end. |

---

## PRE-RECORD CHECKLIST

**Terminal**
- Font size **18–22pt**, max-width window, dark theme, high contrast. The 7-dim table and the STAGE banners must be legible at 1080p.
- `cd /home/alcabal/regen-near-agent` and run `npm run demo` **once before recording** to warm tsx (first run is slower) and confirm node_modules is present (it is).
- **Clear the scrollback** right before the take so the only thing on screen when you hit record is a clean prompt.
- Optional: pre-type `npm run demo` but don't press Enter until the camera's rolling.

**Tabs to have open (in this order)**
1. **DEVPOST.md** (title/tagline at top; "One organ of a larger swarm" section bookmarked for the 1:30 beat).
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
npm run demo            # DEFAULT path — the refuse-to-mint demo. Deterministic, offline, no token needed.
```
This is the path you record. It ALWAYS ends in `STAKE_PROOF_PLAN_ONLY` + "No credit issued" — that's the wow-moment, and it never depends on the network.

**The "it CAN act" proof = the pre-loaded explorer tab.** You are NOT signing a live tx on camera. The explorer tab is the evidence that the agent already did.

**Fallback if you'd rather show the ISSUE_CREDIT path in-terminal (optional, still offline/green):**
```bash
npm run demo -- --with-evidence    # simulates evidence + validator approve → ISSUE_CREDIT, prints a tx + 73.00 REGEN-CREDIT (STUB chain — explorerUrl is stub.local)
```
Use this only if the explorer is unreachable AND you didn't grab a screenshot. Say "stub chain" if you show it — don't imply stub.local is the real tx.

**Apify token fallback (research stage)**
- The default `npm run demo` uses the **stub research provider** — fully offline, deterministic, always green. **No APIFY_TOKEN needed.** This is already the recorded path, so you are covered by default.
- Do NOT run `npm run demo:research` on camera unless `APIFY_TOKEN` is set in `.env` and you've tested it — it makes a live network call and can hang or rate-limit. The stub findings (SF Rec & Parks, Urban Tilth, AB-551, EPA, USDA) are realistic and tell the same story.

**Timing discipline**
- The script is ~285 words — at a relaxed ~140 wpm that lands at ~2:00. If you're running long, cut the 1:30 "swarm" beat to one sentence; it's the most compressible.
- The two beats that must NOT be rushed: the **0:52–1:12 refusal** (Stage 4/5) and the **1:12–1:30 explorer** — those two are the whole submission.

**One-line framing if a judge asks "but does it actually act?"**
"Yes — the refusal and the mint are the same gate. When evidence is missing it stakes and stops; when a validator approves it signs its own NEAR tx and anchors the hash. The explorer tab is one it already sent."
