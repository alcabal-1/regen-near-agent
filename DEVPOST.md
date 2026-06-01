# Nurturing Agent — Food Resilience Co-Steward for Urban Hub Farms

**Tagline:** An autonomous agent that helps a regenerative *food* project prove its impact honestly — it researches, reasons, labels every claim by its evidence, acts on NEAR, and *refuses* to overclaim.

> *"The agent does not make a regenerative claim stronger than the evidence allows."*
> *"It acts where evidence authorizes action, and returns to human Mandate where legitimacy is not yet present."*

**Tracks:** Other (regenerative / food / climate) · NEAR AI · Apify · Tigris · NEAR AI Cloud

### ▶ Try it live

- **Live demo:** https://regen-near-agent.onrender.com
- **Repo:** https://github.com/alcabal-1/regen-near-agent
- **Real on-chain action (NEAR testnet tx):** https://testnet.nearblocks.io/txns/E2pUh5m6NtLC4cPhbegxXXtQs15TuSfPa5taoZG16mXC — signer `regen-agent-1780248058.testnet`

---

## What it does

The Nurturing Agent is a co-steward for regenerative **food** projects. It doesn't just answer questions — it **acts on context**: given a project (our demo, **Urban Hub Farms**, a San Francisco community living-wall food-garden pilot) it researches the web for itself, scores the project, writes an honest proof-plan, and either issues an on-chain credit *or refuses to* — end to end, on its own account.

The refusal is not a failure mode. It **is** the product: an agent honest enough to say *"I can't prove this yet — but here's exactly what would."* Every regenerative-impact program runs on **certification** — a stamp that says "this works" — and AI is now racing to *automate* that stamp, which only automates the overclaim faster. We built the opposite: **proof-plans, not certification.**

## How it works — the autonomous chain

The agent chains reasoning and tools into one unattended act-loop. Each link is **live**, not stubbed:

1. **Apify — autonomous web research.** The agent goes to the live web and gathers its *own* evidence first (`apify/rag-web-browser`), pulling real San Francisco / Bay Area sources (SF Rec & Parks Community Gardens, Urban Tilth, CA Urban-Ag Incentive Zones / AB 551, EPA living-wall research, USDA People's Garden grants) as a regional-precedent scan. `hunter ≠ judge`: research enriches the proof-plan narrative but is excluded from the numeric score *and* the on-chain hash, so the credit-binding never drifts with whatever the web returns.
2. **Deterministic 7-dimension scorer.** A weighted score (impact, verifiability, monetization-readiness, agentic-fit, propagation, execution-ease, mission-alignment) with a fixed recommendation threshold. Pure code, no model in the loop.
3. **Proof-plan + refuse-to-mint gate — the authority.** The agent writes a proof-plan labeling every claim by its evidence, then a deterministic `safeProofPlanGate` decides issue-or-refuse. This gate is the **sole** authority on minting. When the evidence isn't in, it *refuses* and stakes the plan instead.
4. **NEAR AI Cloud — reasoning that explains but never decides.** NEAR AI Cloud (`anthropic/claude-haiku-4-5`, served via the OpenAI-compatible gateway at cloud.near.ai) reads the research, the score, and the plan and narrates them in plain language — so the run reads as reasoning, not a dump of numbers. By design it runs **after** the gate has already fired: its output is display-only and is never parsed back into the issue/refuse boolean. **The model never self-certifies impact** — `hunter ≠ judge` at the reasoning layer too.
5. **Tigris — transparent ledger.** Every decision — credit issued **or** (the honest default) refused — persists its full proof-plan + research + decision to S3-compatible object storage, keyed by project + timestamp. The trail records the *no-mints*, not just the mints.
6. **NEAR — the on-chain action.** When evidence is submitted and a validator approves, the agent signs its **own** NEAR testnet transaction (it owns and funds its own account) and anchors the proof-plan hash on-chain — cryptographically binding the credit to a plan anyone can audit. Real, verified tx: `E2pUh5m6NtLC4cPhbegxXXtQs15TuSfPa5taoZG16mXC`.

## Sponsor tools used

NEAR shows up across **two distinct sponsor surfaces** — its inference cloud *and* its L1 — so the agent uses NEAR at both the reasoning layer and the on-chain action layer:

- **NEAR AI Cloud** — the reasoning layer: `anthropic/claude-haiku-4-5` served via NEAR's OpenAI-compatible inference gateway at cloud.near.ai. Explains the research, score, and plan in plain language. Reasons, never decides.
- **NEAR Protocol** — the on-chain action: the agent owns its own funded testnet account and signs its own transactions, anchoring the proof-plan hash on-chain.
- **Apify** — autonomous web research: `apify/rag-web-browser` gathers the agent's own evidence from the live web before it reasons.
- **Tigris** — the transparent ledger: S3-compatible storage persisting every decision, including refusals.
- **Render** — live hosting: the public web demo runs the full pipeline, key-free.

> Honesty note: the public web demo and the in-terminal run exercise the full chain with a **stub** chain-issuer (no private key is ever held by the hosted service); the **real** NEAR transaction was signed separately by the agent's own account and is the verifiable one linked above.

## One organ of a larger swarm

The Nurturing Agent is the first live organ of a 24/7 swarm — a **Proofplan** satellite today, with **Market-Research**, **Developer** (permits/zoning), and **EPC** (design/build) satellites on the roadmap, each re-pointing organs our system already runs at urban food. Today's demo is one organ breathing; the swarm is the vision.

## Verifiable proof (not slideware)

- **Live on-chain credit** (proof-plan hash anchored, RPC-verified): https://testnet.nearblocks.io/txns/E2pUh5m6NtLC4cPhbegxXXtQs15TuSfPa5taoZG16mXC
- **The agent's own identity:** `regen-agent-1780248058.testnet`
- **Live demo:** https://regen-near-agent.onrender.com
- **Code:** https://github.com/alcabal-1/regen-near-agent

## Why food, why now

Urban Hub Farms grows food *for* a community — nurturing people through food. The same honest proof-plan engine that anchors a credit can **measure** what a food-as-health program actually moves — e.g. A1C, per cohort — **measuring**, never **claiming**. That's the bridge from a hackathon demo to real regenerative impact.

## Challenges

- NEAR's v7 SDK rewrite + deprecated RPC endpoints — most snippets are stale; we pinned the current path and verified every call against live RPC, not just an SDK no-error.
- Keeping the credit-binding stable while the agent researches freely — solved by hashing only the canonical proof-plan, so the live web can't move the on-chain hash.
- Keeping a reasoning model in the loop without letting it certify — solved structurally: the deterministic gate fires *before* NEAR AI Cloud ever speaks.

## What we learned

The hard part of agentic regenerative finance isn't *issuing* credits — it's *refusing* to. Trust is built from the refusals.

## What's next

- The 24/7 satellite swarm (Market / Developer / EPC) re-pointed at urban food.
- A real NEP-141 regenerative-credit token (today's credit is a proof-of-economic-agency action, not a token).
- Tigris as the full evidence vault; confidential agent execution via NEAR AI Shade Agents.
- The same engine co-authoring funding applications — it already produces the fields.

**Built with:** NEAR · near-api-js · Apify (`rag-web-browser`) · NEAR AI Cloud (cloud.near.ai · claude-haiku-4-5) · Tigris (S3) · Render · TypeScript · Node.js
