// REAL memory / ledger Ledger — Tigris-powered (S3-compatible object storage,
// hackathon sponsor integration).
//
// Same Ledger interface as the local fallback; swapping this in requires no change to
// the scoring / proof-plan / decision logic. This is the seam that makes the
// "transparent ledger" real: every run — credit issued OR (the honest default) refused
// — persists its full proof-plan + research + decision record to durable object
// storage, keyed by opportunity id + ISO timestamp, so the trail is auditable later.
//
// Transport: Tigris is S3-compatible, so we use the AWS SDK v3 S3 client pointed at the
// Tigris endpoint. Endpoint and bucket are fully env-configurable (TIGRIS_ENDPOINT,
// TIGRIS_BUCKET); credentials are the standard AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
// pair Tigris issues. Region is a formality for S3-compat ("auto").

import { Ledger, LedgerRecord, LedgerWriteResult, ledgerKey } from './ledger';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Sensible default — VERIFY against the sponsor's current docs / your console.
// (Global Tigris endpoint; fly.io-hosted accounts may use https://fly.storage.tigris.dev .)
const DEFAULT_ENDPOINT = 'https://t3.storage.dev';
const REGION = 'auto'; // S3-compat formality; Tigris is global.

function resolveEndpoint(): string {
  return process.env.TIGRIS_ENDPOINT?.trim() || DEFAULT_ENDPOINT;
}

function resolveBucket(): string {
  const bucket = process.env.TIGRIS_BUCKET?.trim();
  if (!bucket) {
    throw new Error(
      'TigrisLedger: TIGRIS_BUCKET is not set. The live ledger path is genuinely real — ' +
        'it will not silently fall back to local files. Set the bucket + AWS creds and re-run, e.g.:\n' +
        '  TIGRIS_BUCKET=my-bucket AWS_ACCESS_KEY_ID=… AWS_SECRET_ACCESS_KEY=… npm run demo:tigris\n' +
        'Create a bucket + keys at https://console.tigris.dev . ' +
        '(For the offline path, use the default LocalLedger — `npm run demo`.)'
    );
  }
  return bucket;
}

function resolveCredentials(): { accessKeyId: string; secretAccessKey: string } {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'TigrisLedger: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY are not set. The live ledger ' +
        'path will not silently fall back to local files. Create S3-compatible keys for your ' +
        'Tigris bucket at https://console.tigris.dev and export them. ' +
        '(For the offline path, use the default LocalLedger — `npm run demo`.)'
    );
  }
  return { accessKeyId, secretAccessKey };
}

export class TigrisLedger implements Ledger {
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly client: S3Client;

  constructor(opts: { bucket?: string; endpoint?: string } = {}) {
    this.bucket = opts.bucket ?? resolveBucket();
    this.endpoint = opts.endpoint ?? resolveEndpoint();
    this.client = new S3Client({
      region: REGION,
      endpoint: this.endpoint,
      // Tigris is virtual-host capable, but path-style is the safe default across
      // S3-compatible providers and bucket-name shapes.
      forcePathStyle: true,
      credentials: resolveCredentials(),
    });
  }

  async persist(record: LedgerRecord): Promise<LedgerWriteResult> {
    const key = ledgerKey(record.opportunity_id, record.recorded_at);
    const body = JSON.stringify(record, null, 2);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: 'application/json',
        })
      );
    } catch (e: any) {
      throw new Error(
        `TigrisLedger: failed to PUT ${this.bucket}/${key} to ${this.endpoint} ` +
          `(${e?.name ?? ''} ${e?.message ?? e}). Verify TIGRIS_BUCKET, TIGRIS_ENDPOINT, and ` +
          `AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY against https://console.tigris.dev .`
      );
    }

    return { key, location: this.bucket, backend: 'tigris' };
  }
}
