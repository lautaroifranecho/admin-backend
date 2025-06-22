import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

async function main() {
  const supabase = createClient(
    config.db.url,
    config.db.anonKey,
    {
      auth: {
        persistSession: false,
      },
    }
  );
  
  console.log('Setting up database...');
  
  const { error } = await supabase.rpc('setup_database');
  
  if (error) {
    console.error('Database setup failed!');
    console.error(error);
    process.exit(1);
  }
  
  console.log('Database setup completed!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Setup failed!');
  console.error(err);
  process.exit(1);
}); 