'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔐 Auth callback - Starting');
        console.log('🔐 Full URL:', window.location.href);
        console.log('🔐 Hash:', window.location.hash);
        console.log('🔐 Search params:', window.location.search);
        
        // Get the redirect destination
        const next = searchParams?.get('next') || '/dashboard';
        console.log('🔐 Redirect destination:', next);
        
        // Check if we have tokens in the hash (PKCE flow)
        const hash = window.location.hash.substring(1);
        console.log('🔐 Hash fragment:', hash ? 'present' : 'missing');
        
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const error = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');
          
          console.log('🔐 Hash params:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            error,
            errorDescription,
          });
          
          // Handle OAuth errors from hash
          if (error) {
            console.error('🔐 OAuth error in hash:', error, errorDescription);
            setError(errorDescription || error);
            setTimeout(() => {
              router.push(`/sign-in?error=${encodeURIComponent(errorDescription || error)}`);
            }, 2000);
            return;
          }
          
          if (accessToken && refreshToken) {
            console.log('🔐 Setting session with tokens from hash');
            // Set the session with tokens from hash
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) {
              console.error('🔐 Session error:', sessionError);
              setError(sessionError.message);
              setTimeout(() => {
                router.push(`/sign-in?error=${encodeURIComponent(sessionError.message)}`);
              }, 2000);
              return;
            }
            
            console.log('🔐 Session set successfully, redirecting to:', next);
            // Success - redirect to destination
            // Use window.location for more reliable redirect
            window.location.href = next;
            return;
          }
        }
        
        // Check for code in query params (server-side flow)
        const code = searchParams?.get('code');
        const errorParam = searchParams?.get('error');
        
        console.log('🔐 Query params:', { code: !!code, error: errorParam });
        
        if (errorParam) {
          console.error('🔐 OAuth error in query:', errorParam);
          setError(errorParam);
          setTimeout(() => {
            router.push(`/sign-in?error=${encodeURIComponent(errorParam)}`);
          }, 2000);
          return;
        }
        
        if (code) {
          console.log('🔐 Exchanging code for session');
          // Exchange code for session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('🔐 Exchange error:', exchangeError);
            setError(exchangeError.message);
            setTimeout(() => {
              router.push(`/sign-in?error=${encodeURIComponent(exchangeError.message)}`);
            }, 2000);
            return;
          }
          
          console.log('🔐 Code exchanged successfully, redirecting to:', next);
          // Success - redirect to destination
          // Use window.location for more reliable redirect
          window.location.href = next;
          return;
        }
        
        // Check if we're already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('🔐 Already have session, redirecting to:', next);
          window.location.href = next;
          return;
        }
        
        // No tokens or code found
        console.error('🔐 No authentication data found');
        console.error('🔐 Hash:', window.location.hash);
        console.error('🔐 Search:', window.location.search);
        setError('No authentication data found. Please try signing in again.');
        setTimeout(() => {
          router.push('/sign-in?error=no_auth_data');
        }, 3000);
      } catch (err: any) {
        console.error('🔐 Callback error:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => {
          router.push(`/sign-in?error=${encodeURIComponent(err.message || 'auth_failed')}`);
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        {loading ? (
          <>
            <Loader2 className="animate-spin h-8 w-8 text-green-400 mx-auto" />
            <p className="text-white">Completing authentication...</p>
          </>
        ) : error ? (
          <>
            <div className="text-red-400 text-xl mb-4">❌</div>
            <p className="text-red-400 font-semibold mb-2">{error}</p>
            <p className="text-gray-400 text-sm mb-4">
              Check the browser console for detailed logs.
            </p>
            <button
              onClick={() => router.push('/sign-in')}
              className="px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Return to Sign In
            </button>
          </>
        ) : (
          <>
            <div className="text-green-400 text-xl">✅</div>
            <p className="text-white">Authentication successful!</p>
            <p className="text-gray-400 text-sm">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}

