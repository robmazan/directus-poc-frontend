import { createDirectus, staticToken, rest, schemaDiff, schemaApply } from '@directus/sdk';
import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(__dirname, '../.env') });

const { DIRECTUS_URL, DIRECTUS_TOKEN } = process.env;

if (!DIRECTUS_URL) {
  console.error('Error: DIRECTUS_URL is not set in .env');
  process.exit(1);
}

if (!DIRECTUS_TOKEN) {
  console.error('Error: DIRECTUS_TOKEN is not set in .env');
  process.exit(1);
}

const schemaPath = resolve(__dirname, 'schema.json');
const schemaRaw = await readFile(schemaPath, 'utf-8');
const parsed = JSON.parse(schemaRaw);
// schema.json may be a raw snapshot or wrapped in a { data: ... } envelope
const snapshot = parsed.data ?? parsed;

const client = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest());

console.log(`Connecting to Directus at ${DIRECTUS_URL} …`);

const diff = await client.request(schemaDiff(snapshot, true));

if (!diff || !diff.diff || Object.values(diff.diff).every((v) => Array.isArray(v) && v.length === 0)) {
  console.log('Schema is already up to date.');
  process.exit(0);
}

await client.request(schemaApply(diff));
console.log('Schema applied successfully.');
