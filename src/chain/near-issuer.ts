// REAL on-chain CreditIssuer — anchors a regen credit on NEAR testnet.
//
// Same CreditIssuer interface as the stub; swapping this in requires no change to
// the scoring / proof-plan / decision logic. The on-chain action carries the
// proof-plan hash, so the receipt is verifiably tied to the exact plan the agent
// emitted ("proof of economic agency" — testnet framing, NOT a certified offset).
//
// Action: a `add_message` call to the public testnet guestbook contract
// (guestbook.near-examples.testnet) whose message embeds the opportunity id,
// proof-plan hash, and amount. The guestbook is a stable, always-available NEAR
// example contract — the cheapest path to a REAL, explorer-verifiable tx.
//
// ESM/CommonJS note: near-api-js v7 is ESM-only ("type": "module", no `require`
// export condition). This project is CommonJS. A static `import` would be
// down-leveled to `require()` and fail with ERR_PACKAGE_PATH_NOT_EXPORTED, so we
// load the SDK via a dynamic `import()` inside the method — tsx preserves that as
// a real ESM dynamic import. (Verified working against near-api-js 7.2.0.)

import { CreditIssuer, CreditReceipt } from './credit-issuer';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Defaults match the funded agent account created for this demo. Overridable by env.
const DEFAULT_ACCOUNT_ID = 'regen-agent-1780248058.testnet';
const RPC_URL = 'https://test.rpc.fastnear.com'; // FastNEAR testnet (*.near.org is deprecated)
const GUESTBOOK_CONTRACT = 'guestbook.near-examples.testnet';
const NETWORK = 'near-testnet';
const GAS_TGAS = '30'; // 30 TGas
const DEPOSIT_YOCTO = 1_000_000_000_000_000_000_000n; // 0.001 NEAR

function resolveAccountId(): string {
  return process.env.ACCOUNT_ID?.trim() || DEFAULT_ACCOUNT_ID;
}

function resolveCredsPath(accountId: string): string {
  if (process.env.NEAR_CREDS_PATH?.trim()) return process.env.NEAR_CREDS_PATH.trim();
  return join(homedir(), '.near-credentials', 'testnet', `${accountId}.json`);
}

function loadPrivateKey(credsPath: string): string {
  let raw: string;
  try {
    raw = readFileSync(credsPath, 'utf8');
  } catch (e: any) {
    throw new Error(
      `NearCreditIssuer: could not read NEAR credentials at ${credsPath} ` +
        `(${e?.code ?? e?.message ?? 'unknown error'}). ` +
        `Set NEAR_CREDS_PATH or create the key file.`
    );
  }
  const creds = JSON.parse(raw);
  const privateKey: string | undefined = creds.private_key || creds.secret_key;
  if (!privateKey) {
    throw new Error(
      `NearCreditIssuer: credentials at ${credsPath} have no "private_key"/"secret_key".`
    );
  }
  return privateKey;
}

export class NearCreditIssuer implements CreditIssuer {
  async issueCredit(args: {
    opportunityId: string;
    proofPlanHash: string;
    amount: string;
  }): Promise<CreditReceipt> {
    const { opportunityId, proofPlanHash, amount } = args;

    const accountId = resolveAccountId();
    const credsPath = resolveCredsPath(accountId);
    const privateKey = loadPrivateKey(credsPath);

    // ESM-only SDK loaded via dynamic import (see header note).
    // @ts-ignore — near-api-js v7 ships types only via its `exports` map, which the
    // project's legacy `moduleResolution: node` can't resolve at type-check time.
    // Runtime resolution (tsx) is unaffected; the import is cast to `any` anyway.
    const nearApi: any = await import('near-api-js');
    const { Account, JsonRpcProvider, actions, teraToGas } = nearApi;

    const provider = new JsonRpcProvider({ url: RPC_URL });
    const agent = new Account(accountId, provider, privateKey);

    const message = `REGEN-CREDIT|opp:${opportunityId}|hash:${proofPlanHash}|amount:${amount}`;

    const result: any = await agent.signAndSendTransaction({
      receiverId: GUESTBOOK_CONTRACT,
      actions: [
        actions.functionCall(
          'add_message',
          { text: message },
          teraToGas(GAS_TGAS),
          DEPOSIT_YOCTO
        ),
      ],
    });

    const txHash: string | undefined =
      result?.transaction?.hash || result?.transaction_outcome?.id;
    if (!txHash) {
      throw new Error(
        'NearCreditIssuer: transaction sent but no tx hash found on the response.'
      );
    }

    const explorerUrl = `https://testnet.nearblocks.io/txns/${txHash}`;

    return {
      txHash,
      explorerUrl,
      network: NETWORK,
      proofPlanHash,
      opportunityId,
      amount,
      display:
        `${amount} REGEN-CREDIT anchored on NEAR testnet — ` +
        `proof of economic agency (testnet), proof-plan ${proofPlanHash.slice(0, 10)}…`,
    };
  }
}
