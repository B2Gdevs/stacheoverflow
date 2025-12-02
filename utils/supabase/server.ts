import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const headersList = await headers();
  
  // Get authorization header if present (client sends access token)
  const authHeader = headersList.get('authorization');

  // Build cookie string for Supabase - include all cookies
  const allCookies = cookieStore.getAll();
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
          getItem: (key: string) => {
            // Try to get from cookies - Supabase uses specific cookie names
            const supabaseCookies = allCookies.filter(c => 
              c.name.includes('sb-') || c.name.includes('supabase')
            );
            // Look for access token cookie
            const accessTokenCookie = cookieStore.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`);
            return accessTokenCookie?.value || null;
          },
          setItem: () => {}, // No-op on server
          removeItem: () => {}, // No-op on server
        },
      },
      global: {
        headers: {
          // Forward all cookies to Supabase
          Cookie: cookieString,
          // Also forward authorization header if present
          ...(authHeader && { Authorization: authHeader }),
        },
      },
    }
  );
  
  return client;
}

