// REAL reasoning-LLM Reasoner — GLM-powered (Z.ai / Zhipu, hackathon sponsor integration).
//
// Same Reasoner interface as the stub; swapping this in requires no change to the
// qualify / score / proof-plan / decision logic. This is the seam that gives the agent
// a voice: it interprets the research it gathered, explains the 7-dimension score in
// plain language, and narrates the proof-plan — so the run reads as reasoning, not just
// a dump of numbers.
//
// DOCTRINE GUARDRAIL (load-bearing): GLM REASONS AND EXPLAINS — it does NOT decide.
// The deterministic credit gate (src/agent/credit-action.ts + src/services/doctrine.ts)
// stays the SOLE authority on issue/refuse. Nothing GLM returns is parsed into a
// boolean or fed back into the decision; its output is display-only narration. The
// model does not self-certify impact.
//
// Transport: GLM exposes an OpenAI-compatible /chat/completions endpoint. We use a
// minimal fetch-based client (Node 22 has global fetch) pointed at GLM_BASE_URL — no
// SDK dependency, and the endpoint/model are fully env-configurable so a docs change
// on the sponsor side is a .env edit, not a code edit.

import { Reasoner } from './reasoner';
import { ResearchResult } from '../research/research-provider';
import { ResearchScore } from '../types/research-score';
import { ProofPlan } from '../types/proof-plan';

// Sensible defaults — VERIFY endpoint/model against the sponsor's current docs.
// (Z.ai international gateway; mainland is https://open.bigmodel.cn/api/paas/v4 .)
const DEFAULT_BASE_URL = 'https://api.z.ai/api/paas/v4';
const DEFAULT_MODEL = 'glm-4-flash';
const REQUEST_TIMEOUT_MS = 20_000;
// Keep outputs short — the demo prints them inline.
const MAX_TOKENS = 220;

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

// The slice of the OpenAI-compatible response we read (every field defensive).
interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

function resolveApiKey(): string {
  const key = process.env.GLM_API_KEY?.trim();
  if (!key) {
    throw new Error(
      'GlmReasoner: GLM_API_KEY is not set. The live reasoning path is genuinely real — ' +
        'it will not silently fall back to canned text. Set a key and re-run, e.g.:\n' +
        '  GLM_API_KEY=xxx npm run demo:glm\n' +
        'Get a key at https://z.ai (or https://open.bigmodel.cn ) and verify the endpoint/' +
        'model against the sponsor docs. (For the offline path, use the default StubReasoner — `npm run demo`.)'
    );
  }
  return key;
}

function resolveBaseUrl(): string {
  return (process.env.GLM_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

function resolveModel(): string {
  return process.env.GLM_MODEL?.trim() || DEFAULT_MODEL;
}

// The shared house instruction — keeps every reply short AND re-states the boundary,
// so even a maximally-eager model can't drift into "I decide whether to mint".
const SYSTEM_PROMPT =
  'You are the reasoning voice of an autonomous regenerative-finance agent. You ' +
  'interpret and explain in plain language. You DO NOT decide whether a credit is ' +
  'issued — a separate deterministic gate owns that, and you must never claim or imply ' +
  'the mint/refuse outcome. Never certify impact. Reply in 2-3 short sentences, no lists.';

export class GlmReasoner implements Reasoner {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(opts: { baseUrl?: string; model?: string; apiKey?: string } = {}) {
    // apiKey opt lets a caller point this OpenAI-compatible client at another
    // sponsor gateway (e.g. NEAR AI Cloud) without the GLM_API_KEY env.
    this.apiKey = opts.apiKey?.trim() || resolveApiKey();
    this.baseUrl = (opts.baseUrl ?? resolveBaseUrl()).replace(/\/+$/, '');
    this.model = opts.model ?? resolveModel();
  }

  // One short chat-completion round. Errors surface (no silent fallback on the live path).
  private async chat(userPrompt: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.4,
          max_tokens: MAX_TOKENS,
        }),
        signal: controller.signal,
      });
    } catch (e: any) {
      throw new Error(
        `GlmReasoner: request to ${this.baseUrl}/chat/completions failed ` +
          `(${e?.name === 'AbortError' ? `timeout after ${REQUEST_TIMEOUT_MS}ms` : e?.message ?? e}). ` +
          `Check GLM_BASE_URL / network. It will not fall back to canned text on the live path.`
      );
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(
        `GlmReasoner: GLM API returned ${res.status} ${res.statusText} from ${this.baseUrl}. ` +
          `Verify GLM_API_KEY, GLM_MODEL ("${this.model}"), and GLM_BASE_URL against the sponsor docs. ` +
          (body ? `Response: ${body.slice(0, 300)}` : '')
      );
    }

    const data = (await res.json()) as ChatCompletionResponse;
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error(
        `GlmReasoner: GLM returned no message content (model "${this.model}"). ` +
          `Cannot synthesize reasoning.`
      );
    }
    return text.replace(/\s+/g, ' ').trim();
  }

  async interpretResearch(research: ResearchResult): Promise<string> {
    const titles = research.findings
      .slice(0, 5)
      .map((f, i) => `${i + 1}. ${f.title} — ${f.snippet}`)
      .join('\n');
    return this.chat(
      `Research query: "${research.query}".\n` +
        `Findings (${research.findings.length}):\n${titles || '(none)'}\n\n` +
        `In 2-3 sentences, synthesize what this regional precedent tells the agent. ` +
        `Make clear it scopes prior art and does NOT certify impact.`
    );
  }

  async explainScore(score: ResearchScore): Promise<string> {
    const dims = (Object.entries(score.core_scores) as Array<[string, number]>)
      .map(([d, v]) => `${d}=${v}`)
      .join(', ');
    return this.chat(
      `7-dimension score (deterministic, already computed): ${dims}. ` +
        `Weighted average ${score.avg}. Recommendation "${score.recommendation}".\n\n` +
        `In 2-3 sentences, explain in plain language WHY the profile lands here — which ` +
        `dimensions carry it and which hold it back. Do not re-score; do not state any ` +
        `mint/refuse outcome (a separate gate decides that).`
    );
  }

  async narrateProofPlan(proofPlan: ProofPlan): Promise<string> {
    const required = proofPlan.evidence_requirements
      .filter((r) => r.required)
      .map((r) => r.evidence_type)
      .join(', ');
    return this.chat(
      `Proof-plan tier: ${proofPlan.tier}. Required evidence: ${required || '(none)'}. ` +
        `Disclaimer: "${proofPlan.disclaimer}".\n\n` +
        `In 2-3 sentences, summarize for a non-expert what this plan asks to be verified ` +
        `before any regenerative claim is trusted. Stress it is a plan, not a certification.`
    );
  }
}
