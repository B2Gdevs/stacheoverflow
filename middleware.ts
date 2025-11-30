import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';
import { createClient } from '@supabase/supabase-js';

const protectedRoutes = ['/dashboard', '/marketplace', '/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Skip auth check for callback routes
  if (pathname.startsWith('/callback/')) {
    return NextResponse.next();
  }

  // If it's a protected route, check for legacy session cookie
  // Note: Supabase sessions are stored client-side (localStorage) and can't be checked in middleware
  // Client-side pages will handle Supabase auth checks
  if (isProtectedRoute && !sessionCookie) {
    // Don't redirect - let client-side handle Supabase auth
    // The dashboard pages will check for Supabase session and redirect if needed
    return NextResponse.next();
  }

  let res = NextResponse.next();

  // Handle legacy session cookie refresh
  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString()
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      // Don't redirect here - let client-side handle it
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
