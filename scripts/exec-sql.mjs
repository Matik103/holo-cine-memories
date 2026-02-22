import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { readFileSync } from 'fs';

const sql = readFileSync('supabase/fix-missing-objects.sql', 'utf8');
const supabase = createClient(
  'https://vkeurtlppyytdhyknqpx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZXVydGxwcHl5dGRoeWtucXB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTc4MDM0MSwiZXhwIjoyMDg3MzU2MzQxfQ.yCqle0QHeqCSnimQssxPTdIaaVFHy3OAkomgxt2G4Jc'
);

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
