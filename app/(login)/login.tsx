'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Social icons as SVG components
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width="20" height="20">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="#1DB954">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'spotify' | null>(null);

  const getRedirectDestination = () => {
    if (redirect) return redirect;
    if (priceId) return `/subscribe?priceId=${priceId}`;
    return '/dashboard';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.replace(getRedirectDestination());
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              inviteId: inviteId || undefined,
              priceId: priceId || undefined,
            },
          },
        });
        if (signUpError) throw signUpError;
        setMessage('Check your email to confirm your account.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setPending(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'spotify') => {
    setOauthLoading(provider);
    setError(null);
    setMessage(null);
    try {
      const redirectTo = `${window.location.origin}/callback/auth?next=${encodeURIComponent(getRedirectDestination())}`;
      const queryParams: Record<string, string> = {};
      if (inviteId) queryParams.inviteId = inviteId;
      if (priceId) queryParams.priceId = priceId;
      
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: Object.keys(queryParams).length ? queryParams : undefined,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || 'OAuth sign-in failed');
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-[100dvh] flex bg-black">
      {/* Left Column - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-8 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-2">
            {mode === 'signin'
              ? 'Welcome back'
              : 'Get started'}
          </h2>
          <p className="text-gray-400 mb-8">
            {mode === 'signin'
              ? 'Sign in to continue to your account'
              : 'Create an account to start selling your music'}
          </p>

          <div className="bg-[#1a1a1a] border-2 border-white rounded-xl p-8 shadow-[white_4px_4px_0_0]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  maxLength={50}
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-2"
              >
                Password
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  maxLength={100}
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm border-2 border-red-400 bg-black px-4 py-2 rounded-xl">{error}</div>
            )}
            {message && (
              <div className="text-green-400 text-sm border-2 border-green-400 bg-black px-4 py-2 rounded-xl">{message}</div>
            )}

            <div>
              <Button
                type="submit"
                variant="default"
                className="w-full"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Loading...
                  </>
                ) : mode === 'signin' ? (
                  'Sign in'
                ) : (
                  'Sign up'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-3"
              onClick={() => handleOAuth('google')}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === 'google' ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="h-5 w-5" />
                  <span>Continue with Google</span>
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-3"
              onClick={() => handleOAuth('spotify')}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === 'spotify' ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Connecting to Spotify...</span>
                </>
              ) : (
                <>
                  <SpotifyIcon className="h-5 w-5" />
                  <span>Continue with Spotify</span>
                </>
              )}
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-white" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1a1a] text-gray-400">
                  {mode === 'signin'
                    ? 'New to our platform?'
                    : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                  redirect ? `?redirect=${redirect}` : ''
                }${priceId ? `&priceId=${priceId}` : ''}`}
                className="w-full flex justify-center py-2 px-4 border-2 border-white rounded-xl shadow-[white_4px_4px_0_0] text-sm font-medium text-white bg-black hover:bg-white hover:text-black transition-colors"
              >
                {mode === 'signin'
                  ? 'Create an account'
                  : 'Sign in to existing account'}
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Right Column - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center px-16 bg-gradient-to-br from-[#1a1a1a] to-black border-l-2 border-white">
        <div className="max-w-md text-center">
          <div className="relative w-48 h-48 mb-8 mx-auto">
            <Image
              src="/images/stacheoverflow-logo.png"
              alt="StacheOverflow Logo"
              fill
              sizes="192px"
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4">StacheOverflow</h1>
          <p className="text-xl text-gray-300 mb-6">
            Game music marketplace
          </p>
          <p className="text-gray-400 leading-relaxed">
            Fully owned music made and performed by artists. 
            Use commercially in games, films, and any project you need.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>100% ownership rights</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Commercial use included</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>High-quality production</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
