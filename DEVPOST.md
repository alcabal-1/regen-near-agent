# Nurturing Agent — Food Resilience Co-Steward for Urban Hub Farms

**Tagline:** An autonomous agent that helps a regenerative *food* project prove its impact honestly — it researches, labels every claim by its evidence, acts on NEAR, and *refuses* to overclaim.

> *"The agent does not make a regenerative claim stronger than the evidence allows."*

**Tracks:** Other (regenerative / food / climate) · NEAR AI · Apify · Tigris

---

## Inspiration

Food-as-medicine and regenerative-impact programs run on **certification** — a stamp that says "this works." Most of it is hand-waved, and now AI agents are racing to *automate* that stamp, which only automates the overclaim faster. The bottleneck was never speed — it's **trust**. So we built the opposite of a certifier: a *nurturing* agent honest enough to say *"I can't prove this yet — but here's exactly what would."*

## What it does

The Nurturing Agent is a co-steward for regenerative **food** projects. Given a project — our demo, **Urban Hub Farms**, a San Francisco community living-wall food-garden pilot — it:

1. **Researches it autonomously** (Apify) — gathers web evidence + regional precedents before reasoning.
2. **Qualifies + scores** it across 7 dimensions (impact, verifiability, monetization-readiness…).
3. **Writes a proof-plan** — labeling every claim **Provable / Plausible / Speculative / Not-yet-verifiable**. No certificate; honest claims + the exact evidence path that graduates each.
4. **Acts on NEAR** — issues a regenerative credit on testnet, the proof-plan's hash anchored on-chain, signed by the agent's own account.
5. **Refuses to mint** when the evidence isn't in — *"the agent acts where evidence authorizes action, and returns to human Mandate where legitimacy is not yet present."* That refusal is the product.

## One organ of a larger swarm

The Nurturing Agent is the first live organ of a 24/7 swarm — a **Proofplan** satellite today, with **Market-Research**, **Developer** (permits/zoning), and **EPC** (design/build) satellites on the roadmap, each re-pointing organs our system already runs at urban food. Today's demo is one organ breathing; the swarm is the vision.

## How we built it

- **NEAR — the act:** the agent owns its own funded testnet account and signs its own transactions (near-api-js v7, FastNEAR). The credit carries the proof-plan hash — cryptographically bound to a plan anyone can audit.
- **Apify — the research:** `apify/rag-web-browser` gathers evidence before the agent reasons. `hunter ≠ judge`: research is excluded from the score *and* the hash, so the credit-binding never drifts.
- **Chain-agnostic core:** the engine settled on Celo yesterday; re-planted on NEAR this morning behind a clean seam.
- **Integrity is code:** a SafeProofPlan gate refuses to mint unless the honesty disclaimer is present and the project qualifies — a 7-assertion harness proves it.

## Verifiable proof (not slideware)

- **Live on-chain credit** (proof-plan hash anchored, RPC-verified): https://testnet.nearblocks.io/txns/E2pUh5m6NtLC4cPhbegxXXtQs15TuSfPa5taoZG16mXC
- **The agent's own identity:** `regen-agent-1780248058.testnet`
- **Code:** https://github.com/alcabal-1/regen-near-agent

## Why food, why now

Urban Hub Farms grows food *for* a community — nurturing people through food. The same honest proof-plan engine that anchors a credit can measure what a food-as-health program actually moves — e.g. A1C, per cohort — **measuring**, never **claiming**. That's the bridge from a hackathon demo to real regenerative impact.

## Challenges

- NEAR's v7 SDK rewrite + deprecated RPC endpoints — most snippets are stale; we pinned the current path and verified every call against live RPC, not just an SDK no-error.
- Keeping the credit-binding stable while the agent researches freely — solved by hashing only the canonical proof-plan.

## What we learned

The hard part of agentic regenerative finance isn't *issuing* credits — it's *refusing* to. Trust is built from the refusals.

## What's next

- The 24/7 satellite swarm (Market / Developer / EPC) re-pointed at urban food.
- A real NEP-141 regenerative-credit token.
- Tigris as the evidence vault; confidential agent execution via NEAR AI Shade Agents.
- The same engine co-authoring funding applications — it already produces the fields.

**Built with:** NEAR · near-api-js · Apify (`rag-web-browser`) · TypeScript · Node.js
