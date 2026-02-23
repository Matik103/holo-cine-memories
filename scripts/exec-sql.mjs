import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { readFileSync } from 'fs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. source .env)');

const sql = readFileSync('supabase/fix-missing-objects.sql', 'utf8');
const supabase = createClient(url, key);

// Split SQL into individual statements
const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

for (const stmt of statements) {
  const trimmed = stmt.trim();
  if (!trimmed) continue;
  
  console.log('Executing:', trimmed.substring(0, 80) + '...');
  const { error } = await supabase.rpc('exec', { sql: trimmed });
  if (error) console.error('Error:', error);
}

console.log('Done!');
