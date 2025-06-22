import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVER_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVER_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSql(sql: string) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      throw new Error(`SQL execution error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.warn('exec_sql function not available, trying alternative approach...');
    throw error;
  }
}

async function createTableDirectly(tableName: string, columns: string) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      console.log(`Table ${tableName} doesn't exist. You'll need to create it manually in the Supabase dashboard.`);
      console.log(`SQL for ${tableName}:`);
      console.log(`CREATE TABLE ${tableName} (${columns});`);
    } else if (error) {
      throw error;
    } else {
      console.log(`Table ${tableName} already exists`);
    }
  } catch (error) {
    console.error(`Error checking/creating table ${tableName}:`, error);
  }
}

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    const tableSchemas = {
      admins: `
          id BIGSERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      `,
      users: `
          id BIGSERIAL PRIMARY KEY,
          client_number VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone_number VARCHAR(50) NOT NULL,
          alt_number VARCHAR(50),
          address TEXT NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          verification_token VARCHAR(255),
          token_expiry TIMESTAMP WITH TIME ZONE,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          has_changes BOOLEAN DEFAULT FALSE
      `,
      user_security: `
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT UNIQUE REFERENCES admins(id) ON DELETE CASCADE,
          two_factor_enabled BOOLEAN DEFAULT FALSE,
          two_factor_secret VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      `
    };

    try {
      for (const [tableName, columns] of Object.entries(tableSchemas)) {
        await executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`);
        console.log(`Created ${tableName} table using exec_sql`);
      }
    } catch (error) {
      console.log('exec_sql not available, providing manual creation instructions...');
      
      for (const [tableName, columns] of Object.entries(tableSchemas)) {
        await createTableDirectly(tableName, columns);
      }
    }

    try {
      await executeSql(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);
      console.log('Created trigger function');

      await executeSql(`
        DROP TRIGGER IF EXISTS update_user_security_updated_at ON user_security;
        CREATE TRIGGER update_user_security_updated_at
            BEFORE UPDATE ON user_security
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_users_last_updated ON users;
        CREATE TRIGGER update_users_last_updated
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
      `);
      console.log('Created triggers');
    } catch (error) {
      console.log('Could not create triggers automatically. You may need to create them manually in the Supabase dashboard.');
    }

    console.log('Database setup completed!');
    console.log('\nIf tables were not created automatically, please run the following SQL in your Supabase SQL editor:');
    console.log('\n--- SQL to run manually ---');
    
    for (const [tableName, columns] of Object.entries(tableSchemas)) {
      console.log(`\n-- Create ${tableName} table`);
      console.log(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`);
    }

    console.log('\n-- Create trigger function');
    console.log(`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
    `);
    
    console.log('\n-- Create triggers');
    console.log(`
DROP TRIGGER IF EXISTS update_user_security_updated_at ON user_security;
CREATE TRIGGER update_user_security_updated_at
    BEFORE UPDATE ON user_security
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_last_updated ON users;
CREATE TRIGGER update_users_last_updated
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    `);
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    process.exit();
  }
}

setupDatabase(); 