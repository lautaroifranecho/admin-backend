import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVER_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const COMPANY_NAME = process.env.COMPANY_NAME || 'YourApp';

async function setup2FA(email: string) {
  try {
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, email')
      .eq('email', email)
      .single();

    if (adminError || !admin) {
      throw new Error(`Admin with email ${email} not found.`);
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(admin.email, COMPANY_NAME, secret);

    const { error: securityError } = await supabase
      .from('user_security')
      .upsert({
        user_id: admin.id,
        two_factor_secret: secret,
        two_factor_enabled: true,
      }, { onConflict: 'user_id' });

    if (securityError) {
      throw new Error('Failed to save 2FA secret to the database.');
    }

    console.log(`2FA has been enabled for ${admin.email}.`);
    console.log('Scan the QR code below with your authenticator app (e.g., Google Authenticator, Authy).\n');

    qrcode.toString(otpauth, { type: 'terminal' }, (err: Error | null | undefined, url: string) => {
      if (err) throw err;
      console.log(url);
      console.log(`\nAlternatively, you can manually enter this secret key: ${secret}`);
      process.exit(0);
    });

  } catch (error) {
    console.error('Error setting up 2FA:', error);
    process.exit(1);
  }
}

const emailArg = process.argv[2];
if (!emailArg) {
  console.error('Please provide an admin email address.');
  process.exit(1);
}

setup2FA(emailArg); 