const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

const isConfigured = Boolean(supabaseUrl && publishableKey && secretKey);
const hasPartialConfiguration = Boolean(supabaseUrl || publishableKey || secretKey);

if (secretKey && (secretKey.includes('replace_with_') || secretKey.includes('your_'))) {
  throw new Error('SUPABASE_SECRET_KEY must be a real rotated server credential.');
}

const supabase = isConfigured
  ? createClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

const supabaseAuth = supabaseUrl && publishableKey
  ? createClient(supabaseUrl, publishableKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

async function testSupabaseConnection() {
  if (!supabase) {
    return {
      configured: false,
      ready: false,
      reason: hasPartialConfiguration ? 'incomplete_environment' : 'missing_environment',
    };
  }
  const { error } = await supabase.from('roles').select('name').limit(1);
  if (error) return { configured: true, ready: false, reason: error.message };
  return { configured: true, ready: true };
}

module.exports = {
  supabase,
  supabaseAuth,
  isConfigured,
  hasPartialConfiguration,
  testSupabaseConnection,
};
