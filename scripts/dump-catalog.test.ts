import { test } from 'vitest';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MOCK_CATALOG } from '../src/data/catalog';

// Generator (not a behavioural test): emits the mock catalog as JSON so the
// host app (materialpublicitar) can serve it from its own endpoint as the
// one-time seed. Re-run with `npm run dump:catalog` after editing mockData.
// Output is gitignored — the canonical copy lives in the Laravel repo.
test('dump catalog.json', () => {
  const out = resolve(process.cwd(), 'scripts/catalog.json');
  writeFileSync(out, JSON.stringify(MOCK_CATALOG, null, 2) + '\n');
});
