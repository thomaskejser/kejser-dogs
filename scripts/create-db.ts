import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadSql, openDuckDb } from 'duckdb-access';

const path = process.argv[2] ?? 'data/dogs.duckdb';

if (existsSync(path)) {
	console.error(`${path} already exists; delete it first to recreate the database`);
	process.exit(1);
}

mkdirSync(dirname(path), { recursive: true });
const db = openDuckDb({ path });
await db.exec(await loadSql('db/schema.sql'));
await db.close();
console.log(`Created ${path}`);
