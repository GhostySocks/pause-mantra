/**
 * Pause Mantra — 15 Mantra Categories
 * These map to the mantra categories in the DB
 */

export const MANTRA_CATEGORIES = [
  'Abundance',
  'Self-Love',
  'Confidence',
  'Health',
  'Gratitude',
  'Focus',
  'Connection',
  'Success',
  'Peace',
  'Creativity',
  'Vitality',
  'Courage',
  'Purpose',
  'Manifestation',
  'Clarity',
] as const;

export type MantraCategory = (typeof MANTRA_CATEGORIES)[number];
