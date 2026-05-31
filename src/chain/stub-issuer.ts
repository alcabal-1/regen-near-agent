// Deterministic, offline stand-in for a real chain. A NEAR testnet implementation
// lands separately behind the same CreditIssuer interface (see credit-issuer.ts).
//
// The receipt is fully deterministic so the demo is reproducible and so tests can
// assert on txHash without a network. txHash = sha256(proofPlanHash + opportunityId).

import { CreditIssuer, CreditReceipt } from './credit-issuer';
import { sha256 } from '../services/hash';

export class StubCreditIssuer implements CreditIssuer {
  async issueCredit(args: {
    opportunityId: string;
    proofPlanHash: string;
    amount: string;
  }): Promise<CreditReceipt> {
    const { opportunityId, proofPlanHash, amount } = args;
    const txHash = sha256(proofPlanHash + opportunityId);
    return {
      txHash,
      explorerUrl: `https://stub.local/tx/${txHash}`,
      network: 'stub',
      proofPlanHash,
      opportunityId,
      amount,
      // "proof of economic agency" — NOT a certified carbon offset. Testnet framing.
      display: `${amount} REGEN-CREDIT (proof of economic agency, testnet/stub) → tx ${txHash.slice(0, 16)}…`,
    };
  }
}
