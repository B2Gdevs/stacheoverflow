import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const headersList = await headers();
  
  // Log cookies for debugging
  const allCookies = cookieStore.getAll();
  console.log('🔐 Server Supabase: Available cookies:', allCookies.map(c => c.name));
  
  // Get authorization header if present (client sends access token)
  const authHeader = headersList.get('authorization');
  console.log('🔐 Server Supabase: Authorization header:', authHeader ? 'present' : 'missing');

  // Build cookie string for Supabase
  const cookieString = allCookies.map(c => `${c.name}=${c.value}`).join('; ');
  
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: 'pkce',
        storage: {
          getItem: () => null, // No storage on server
          setItem: () => {}, // No-op on server
          removeItem: () => {}, // No-op on server
        },
      },
      global: {
        headers: {
          // Forward all cookies to Supabase
          Cookie: cookieString,
          // Also forward authorization header if present (this is the key!)
          ...(authHeader && { Authorization: authHeader }),
        },
      },
    }
  );
  
  return client;
}

