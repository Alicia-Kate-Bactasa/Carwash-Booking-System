const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

if (supabaseUrl && supabaseServiceKey && supabaseUrl.indexOf('YOUR_SUPABASE') === -1) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.warn('Supabase credentials not fully configured in environment. Auth middleware will run in fallback/development mode.');
}

module.exports = supabaseAdmin;
