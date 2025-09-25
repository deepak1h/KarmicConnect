// server/lib/supabaseAdminClient.ts

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // <-- The secret key!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL and Service Key are required for the admin client.");
}

// This client BYPASSES all RLS and Storage policies
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // This tells the client to act as a service_role, not a user
    autoRefreshToken: false,
    persistSession: false
  }
});