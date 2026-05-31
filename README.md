# regen-near-agent

**An autonomous agent that scores a regenerative project, emits a proof-plan, and ACTS on-chain by issuing a credit tied to the proof-plan hash.**

Built for a NEAR AI hackathon (theme: *Agents That Act*). It ports an existing, shipped Zentient Regen scoring pipeline into a clean standalone demo, with the on-chain credit action stubbed behind a single interface so a NEAR testnet implementation plugs straight in.

> **Proof-plans, not certification.** This agent does not certify impact. It produces a *proof plan* — a description of what must be verified before a regenerative claim should be trusted — and refuses to mint a credit until that plan is honored and an independent validator approves.

---

## What it does

Given a regenerative *Opportunity*, the agent runs an act-loop:

```
qualify(opportunity)
  → if "does_not_qualify_yet"  →  NO_ACTION (stop)
score(opportunity)             →  7-dimension weighted score + recommendation
generateProofPlan(opportunity) →  tier-aware evidence plan (+ honesty disclaimer)
decideCreditAction(...)        →  NO_ACTION | STAKE_PROOF_PLAN_ONLY | AWAIT_VALIDATION | ISSUE_CREDIT
  → if ISSUE_CREDIT:  safeProofPlanGate(...) then CreditIssuer.issueCredit(...)
```

The credit is bound to `sha256(JSON.stringify(proofPlan))`, so the on-chain receipt is verifiably tied to the exact plan the agent emitted.

### The 7 scoring dimensions (weights sum to 1.0)

| dimension | weight |
|---|---|
| impact | 0.20 |
| monetization_readiness | 0.15 |
| agentic_fit | 0.15 |
| propagation | 0.10 |
| execution_ease | 0.15 |
| evidence_fit | 0.15 |
| mission_alignment | 0.10 |

Recommendation: `avg ≥ 70` → **shortlist**, `avg ≥ 55` → **research_later**, else **reject**.

### Honest-credit framing (the integrity story, as real code)

- **Qualification gate** — an activity qualifies only if it satisfies a Maslow need **AND** a Wheel-of-Life slice **AND** a regenerative contribution. Otherwise `does_not_qualify_yet` → `NO_ACTION`.
- **Disclaimer on every proof-plan** — each plan carries: *"This agent does not certify impact. It produces a proof plan: what must be verified before a regenerative claim should be trusted."*
- **`safeProofPlanGate`** — ISSUE_CREDIT calls this first; it **throws** (no mint) unless the disclaimer is present and the activity has qualified.
- **No self-certification** — `STAKE_PROOF_PLAN_ONLY` and `AWAIT_VALIDATION` are the honest defaults. A credit is only issued after an independent validator returns `approve` (simulated here via a flag).
- **Testnet framing** — the credit is **"proof of economic agency"**, *not* a certified carbon offset.

---

## Run it

Requires Node 18+.

```bash
npm install
npm run demo                     # Urban Hub Farms — evidence not yet submitted → honest STAKE outcome
npm run demo -- --with-evidence  # simulate full evidence + validator approval → full ISSUE_CREDIT path (stub tx)
```

Both paths work. The default run is the honest one: Urban Hub Farms has no evidence submitted yet, so the agent stakes and registers the proof-plan and issues **no** credit. The `--with-evidence` flag simulates all required evidence submitted and a validator `approve`, exercising the mint gate and the (stubbed) on-chain credit receipt.

Programmatic use:

```ts
import { runAgent, URBAN_HUB_FARMS } from './src/index';

const result = await runAgent(URBAN_HUB_FARMS, { withEvidence: true });
console.log(result.receipt?.txHash);
```

---

## Chain

The on-chain action lives behind **one interface**. The whole act-loop depends only on this seam — swapping the stub for NEAR requires no change to scoring, proof-plan, or decision logic.

```ts
// src/chain/credit-issuer.ts
export interface CreditReceipt {
  txHash: string;
  explorerUrl: string;
  network: string;
  proofPlanHash: string;
  opportunityId: string;
  amount: string;
  display: string;
}

export interface CreditIssuer {
  issueCredit(args: {
    opportunityId: string;
    proofPlanHash: string;
    amount: string;
  }): Promise<CreditReceipt>;
}
```

This repo ships `StubCreditIssuer` (`src/chain/stub-issuer.ts`): a deterministic, offline stand-in. It returns `network: "stub"`, `explorerUrl: "https://stub.local/tx/<hash>"`, and `txHash = sha256(proofPlanHash + opportunityId)` so runs are reproducible.

### NEAR testnet implementation plugs in here

A `NearCreditIssuer implements CreditIssuer` lands separately. To fill the seam it must:

1. Hold/derive a NEAR testnet account + key (out of band; never committed — `.env` / `*.key` are gitignored).
2. In `issueCredit(...)`, submit a transaction to a regen-credit contract on NEAR testnet (e.g. a `mint`/`issue` call) carrying `opportunityId`, `proofPlanHash`, and `amount` (so the credit is on-chain-bound to the proof-plan hash).
3. Return a real `CreditReceipt`: `network: "near-testnet"`, the real `txHash`, and `explorerUrl: "https://testnet.nearblocks.io/txns/<txHash>"`.
4. Decide the on-chain denomination/units for `amount` (this demo uses dimensionless demo units).

Wire it by passing `{ issuer: new NearCreditIssuer(...) }` to `runAgent`. Nothing else changes.

---

## Source

The scoring weights, per-dimension formulas, thresholds, tier→evidence rules, and proof-plan assembly are ported from a shipped Zentient Regen pipeline (`zentient-web4/03_app`). The proxy scoring constants are public-domain placeholders. The qualification gate and the chain seam are implemented fresh for this demo.

## License

MIT — see [LICENSE](./LICENSE).
