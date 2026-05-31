import { createHash } from 'crypto';
import { ProofPlan } from '../types/proof-plan';

export function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf-8').digest('hex');
}

/**
 * Canonical proof-plan hash. The on-chain credit is bound to THIS hash, so the
 * receipt is verifiably tied to the exact plan the agent emitted.
 *
 * The optional `regional_precedent_scan` (web-research enrichment) is EXCLUDED from
 * the canonical hash: the credit binds to *what must be verified* — the evidence
 * plan — which research narrative does not change. This keeps the hash identical
 * whether research ran (stub or live Apify) or not, so the on-chain binding is
 * stable and reproducible regardless of research provider.
 */
export function proofPlanHash(proofPlan: ProofPlan): string {
  const { regional_precedent_scan, ...canonical } = proofPlan;
  return sha256(JSON.stringify(canonical));
}
