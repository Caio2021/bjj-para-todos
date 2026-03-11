import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

const sql = readFileSync(join(__dir, 'migrations', 'triggers-rls.sql'), 'utf8');

const client = new pg.Client({
  connectionString: 'postgresql://postgres:53LtdWlP4bjNeMwv@db.dhgnfqqtwnbebikkaoyo.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

await client.connect();
console.log('Conectado ao Supabase...');

try {
  await client.query(sql);
  console.log('✔ Triggers e RLS aplicados com sucesso!');
} catch (err) {
  console.error('Erro:', err.message);
} finally {
  await client.end();
}
