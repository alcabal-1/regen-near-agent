// THE LEDGER SEAM.
//
// This is the single interface a memory / audit-trail implementation plugs into. It
// mirrors the CreditIssuer chain seam (src/chain/credit-issuer.ts) and the
// ResearchProvider seam: the agent's act-loop depends ONLY on this interface, so
// swapping LocalLedger for a TigrisLedger (real S3-compatible object storage)
// requires no change to the scoring / proof-plan / decision logic.
//
// The ledger persists an AUDITABLE TRAIL of what the agent did: the proof-plan, the
// research artifact, and the FINAL credit/refusal record — whether the agent issued a
// credit or (the honest default) refused to mint. Persisting the refusal too is the
// point: the "transparent ledger" must record the no-mint outcomes, not just the mints.

import { ProofPlan } from '../types/proof-plan';
import { ResearchResult } from '../research/research-provider';
import { CreditActionResult } from '../agent/credit-action';
import { CreditReceipt } from '../chain/credit-issuer';

// One auditable record — everything the agent produced for one opportunity, decision
// included. Serialized to a single JSON object, keyed by opportunity id + ISO timestamp.
export interface LedgerRecord {
  opportunity_id: string;
  recorded_at: string; // ISO timestamp
  decision: CreditActionResult['decision'];
  proof_plan_hash: string;
  proof_plan: ProofPlan;
  research?: ResearchResult;
  credit_action: CreditActionResult;
  // Present only when a credit was actually issued (ISSUE_CREDIT). Absent on refusal.
  receipt?: CreditReceipt;
}

// What a persist returns — enough to print a verifiable "where it landed" line.
export interface LedgerWriteResult {
  // The object key the record was stored under (opportunity-id/timestamp.json).
  key: string;
  // Human-facing location: bucket name (Tigris) or local path (fallback).
  location: string;
  // Which backend wrote it, for honest display.
  backend: 'tigris' | 'local';
}

export interface Ledger {
  persist(record: LedgerRecord): Promise<LedgerWriteResult>;
}

// Build the canonical object key: <opportunity-id>/<iso-timestamp>.json. Colons in the
// ISO timestamp are replaced so the key is safe as both an S3 key and a filename.
export function ledgerKey(opportunityId: string, recordedAt: string): string {
  const safeTs = recordedAt.replace(/[:.]/g, '-');
  return `${opportunityId}/${safeTs}.json`;
}
