#!/usr/bin/env node
/**
 * Pause Mantra — Mantra Generation Pipeline (OFFL-05)
 *
 * Usage: node scripts/generate-mantras.js [--category <name>] [--count <n>]
 *
 * For alpha: loads seed mantras from assets/mantras.json
 * For production: calls Claude API to batch-generate mantras
 *
 * TODO: Integrate Anthropic Claude API (claude-sonnet-4-6) for bulk generation
 *       - Takes category + count as args
 *       - Outputs validated JSON
 *       - Idempotent — skips already-existing mantra IDs
 *       - Run before each release to refresh the library
 */

const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  'Abundance', 'Self-Love', 'Confidence', 'Health', 'Gratitude',
  'Focus', 'Connection', 'Success', 'Peace', 'Creativity',
  'Vitality', 'Courage', 'Purpose', 'Manifestation', 'Clarity',
];

const MANTRAS_PATH = path.join(__dirname, '..', 'assets', 'mantras.json');

function validateMantras(mantras) {
  const errors = [];
  const ids = new Set();

  for (const m of mantras) {
    if (!m.id || !m.text || !m.category) {
      errors.push(`Missing field in mantra: ${JSON.stringify(m)}`);
    }
    if (ids.has(m.id)) {
      errors.push(`Duplicate ID: ${m.id}`);
    }
    ids.add(m.id);
    if (!CATEGORIES.includes(m.category)) {
      errors.push(`Invalid category "${m.category}" in mantra ${m.id}`);
    }
    if (m.text.includes('will ') || m.text.includes("won't") || m.text.includes('not ')) {
      errors.push(`Mantra ${m.id} may contain negation or future tense: "${m.text}"`);
    }
  }

  return errors;
}

function main() {
  console.log('Pause Mantra — Mantra Validation');
  console.log('================================\n');

  if (!fs.existsSync(MANTRAS_PATH)) {
    console.error(`Error: ${MANTRAS_PATH} not found. Run seed generation first.`);
    process.exit(1);
  }

  const mantras = JSON.parse(fs.readFileSync(MANTRAS_PATH, 'utf-8'));
  console.log(`Loaded ${mantras.length} mantras from ${MANTRAS_PATH}`);

  // Count by category
  const counts = {};
  for (const m of mantras) {
    counts[m.category] = (counts[m.category] || 0) + 1;
  }

  console.log('\nCategory breakdown:');
  for (const cat of CATEGORIES) {
    console.log(`  ${cat}: ${counts[cat] || 0}`);
  }

  const errors = validateMantras(mantras);
  if (errors.length > 0) {
    console.error(`\n${errors.length} validation error(s):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log(`\n✅ All ${mantras.length} mantras valid across ${Object.keys(counts).length} categories.`);
}

main();
