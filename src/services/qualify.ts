// Qualification gate.
//
// No dedicated qualify*.ts existed in the shipped monorepo (the classification
// was derived inside idea-generator.ts). This implements the DOCUMENTED rule
// directly so the gate is real code, not an input pass-through:
//
//   An activity QUALIFIES iff it satisfies:
//     (1) a Maslow need        AND
//     (2) a Wheel-of-Life slice AND
//     (3) a regenerative contribution
//
//   classification:
//     - "does_not_qualify_yet"        if any of the three is missing
//     - "qualifies_with_source_check"  if all present but it carries an external
//                                       impact claim needing a source check
//     - "qualifies"                    otherwise
//
// Mirrors lens_rules.json qualification_lenses (maslow_wheel + wellbeing_alignment).

import {
  Opportunity,
  Qualification,
  QualificationClassification,
} from '../types/opportunity';

// Categories whose impact rests on external claims → source check before promotion.
// (Ported from idea-generator.ts SOURCE_CHECK_CATEGORIES.)
const SOURCE_CHECK_CATEGORIES = new Set([
  'cat_clean_energy_enablement',
  'cat_admin_efficiency',
]);

const VALID_MASLOW_NEEDS = new Set([
  'physiological',
  'safety',
  'belonging',
  'esteem',
  'self_actualization',
]);

export interface QualificationResult extends Qualification {
  // The three gate predicates, surfaced for transparent console output.
  satisfies_maslow: boolean;
  satisfies_wheel: boolean;
  satisfies_regenerative: boolean;
}

function hasText(s?: string): boolean {
  return typeof s === 'string' && s.trim().length > 0;
}

export function qualify(opportunity: Opportunity): QualificationResult {
  const q = opportunity.qualification;

  const satisfies_maslow =
    hasText(q.maslow_need) && VALID_MASLOW_NEEDS.has(q.maslow_need);
  const satisfies_wheel = hasText(q.wheel_of_life_slice);
  const satisfies_regenerative = hasText(q.regenerative_contribution);

  let classification: QualificationClassification;
  let notes = q.notes;

  if (!satisfies_maslow || !satisfies_wheel || !satisfies_regenerative) {
    classification = 'does_not_qualify_yet';
    const missing: string[] = [];
    if (!satisfies_maslow) missing.push('Maslow need');
    if (!satisfies_wheel) missing.push('Wheel-of-Life slice');
    if (!satisfies_regenerative) missing.push('regenerative contribution');
    notes = `Does not qualify yet — missing: ${missing.join(', ')}.`;
  } else if (
    SOURCE_CHECK_CATEGORIES.has(opportunity.matrix_refs.primary_impact_category_id) ||
    q.classification === 'qualifies_with_source_check'
  ) {
    classification = 'qualifies_with_source_check';
    notes =
      notes ??
      'External impact claim; source check recommended before promotion.';
  } else {
    classification = 'qualifies';
  }

  return {
    maslow_need: q.maslow_need,
    wheel_of_life_slice: q.wheel_of_life_slice,
    regenerative_contribution: q.regenerative_contribution,
    classification,
    notes,
    satisfies_maslow,
    satisfies_wheel,
    satisfies_regenerative,
  };
}
