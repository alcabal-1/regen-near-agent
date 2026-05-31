// Deterministic, offline stand-in for a real object-storage ledger. The live
// Tigris-powered implementation lands separately behind the same Ledger interface
// (see tigris-ledger.ts).
//
// The pipeline uses this by default so `npm run demo` runs fully offline and stays
// green — no cloud credentials needed. It writes the same JSON record the Tigris
// backend would store, to a local `./.ledger/` directory (gitignored), keyed
// identically (<opportunity-id>/<iso-timestamp>.json). The audit trail is real and
// inspectable; it just lives on disk instead of in a bucket.

import { Ledger, LedgerRecord, LedgerWriteResult, ledgerKey } from './ledger';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

// Default local trail directory (override with LEDGER_DIR). Gitignored.
const DEFAULT_LEDGER_DIR = '.ledger';

export class LocalLedger implements Ledger {
  private readonly baseDir: string;

  constructor(opts: { baseDir?: string } = {}) {
    this.baseDir = resolve(
      opts.baseDir ?? process.env.LEDGER_DIR?.trim() ?? DEFAULT_LEDGER_DIR
    );
  }

  async persist(record: LedgerRecord): Promise<LedgerWriteResult> {
    const key = ledgerKey(record.opportunity_id, record.recorded_at);
    const fullPath = join(this.baseDir, key);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, JSON.stringify(record, null, 2), 'utf8');
    return { key, location: fullPath, backend: 'local' };
  }
}
