// Deterministic, offline stand-in for real web research. The live Apify-powered
// implementation lands separately behind the same ResearchProvider interface
// (see apify-research.ts).
//
// The pipeline uses this by default so `npm run demo` runs fully offline and stays
// green. The findings are canned but realistic — SF / Bay Area urban-agriculture
// precedents, community-garden grant examples, and living-wall / food-forest
// references — the kind of regional precedent a web-research pass would surface for
// Urban Hub Farms, so the proof-plan's evidence-scan section is meaningful offline.

import {
  ResearchProvider,
  ResearchResult,
  ResearchFinding,
  buildResearchQuery,
} from './research-provider';

const URBAN_HUB_FARMS_FINDINGS: ResearchFinding[] = [
  {
    title: 'SF Recreation & Parks — Community Gardens Program',
    url: 'https://sfrecpark.org/770/Community-Gardens',
    snippet:
      'San Francisco operates 40+ community gardens on public land, with plot leases and shared maintenance — a direct municipal precedent for site-permission and host-attestation evidence on urban food-growing plots.',
    source: 'stub:precedent',
  },
  {
    title: 'Bay Area urban agriculture — Urban Tilth (Richmond, CA)',
    url: 'https://www.urbantilth.org/',
    snippet:
      'Urban Tilth cultivates North Richmond gardens and a 3-acre urban farm, paying local residents to grow food — an established Bay Area model for paid local maintenance roles and harvest logs as milestone evidence.',
    source: 'stub:precedent',
  },
  {
    title: 'CA Urban Agriculture Incentive Zones (AB 551)',
    url: 'https://www.cdfa.ca.gov/is/ffldrs/UrbanAgZones.html',
    snippet:
      'California AB 551 lets cities offer property-tax reductions to landowners who dedicate under-used parcels to urban agriculture for 5+ years — a continuity / site-permission lever directly relevant to converting under-used urban surfaces.',
    source: 'stub:grant',
  },
  {
    title: 'Green walls & food-producing living walls — research review',
    url: 'https://www.epa.gov/green-infrastructure/green-roofs-and-walls',
    snippet:
      'Living walls deliver stormwater capture, urban cooling, and air-quality benefits; food-producing variants add local harvest. Establishes the greening + green-jobs co-benefit basis for before/after-photo and soil-test evidence.',
    source: 'stub:reference',
  },
  {
    title: 'USDA People’s Garden / community food-forest grants',
    url: 'https://www.usda.gov/peoples-garden',
    snippet:
      'USDA supports community gardens and urban food forests with technical and grant assistance, including payroll-supported grower roles — a funding precedent for the paid-maintenance and worker-payroll evidence track.',
    source: 'stub:grant',
  },
];

export class StubResearchProvider implements ResearchProvider {
  async research(args: {
    project: string;
    region?: string;
    topics?: string[];
  }): Promise<ResearchResult> {
    const query = buildResearchQuery(args);
    const region = args.region ?? 'the project region';

    const summary =
      `Web-research scan for "${args.project}" (${region}) surfaced ${URBAN_HUB_FARMS_FINDINGS.length} ` +
      `regional precedents and funding references. Municipal community-garden programs and Bay Area urban ` +
      `farms (e.g. SF Rec & Parks, Urban Tilth) establish that site-permission, host-attestation, harvest-log, ` +
      `and paid-maintenance-payroll evidence are routinely produced for projects of this kind; state policy ` +
      `(AB 551 urban-ag incentive zones) and USDA / EPA programs corroborate the continuity, greening, and ` +
      `green-jobs co-benefits the activity claims. None of this certifies impact — it scopes the regional ` +
      `precedent the proof-plan's evidence must still independently establish.`;

    return { query, findings: URBAN_HUB_FARMS_FINDINGS, summary };
  }
}
