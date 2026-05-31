import { createHash } from 'crypto';
import { ProofPlan } from '../types/proof-plan';

export function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf-8').digest('hex');
}

/**
 * Canonical proof-plan hash. The on-chain credit is bound to THIS hash, so the
 * receipt is verifiably tied to the exact plan the agent emitted.
 */
export function proofPlanHash(proofPlan: ProofPlan): string {
  return sha256(JSON.stringify(proofPlan));
}
