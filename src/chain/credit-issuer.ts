// THE CHAIN SEAM.
//
// This is the single interface a NEAR (or any chain) implementation plugs into.
// The agent's act-loop depends ONLY on this interface — swapping StubCreditIssuer
// for a NearCreditIssuer requires no change to the scoring / proof-plan / decision
// logic. The credit is bound to the proof-plan hash, so the on-chain receipt is
// verifiably tied to the exact plan the agent emitted.

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
