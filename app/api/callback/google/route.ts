import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/dashboard';

  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/dashboard';
  }

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // If we have a code, try server-side exchange (fallback)
  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError) {
        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    } catch (err) {
      console.error('Server-side exchange error:', err);
    }
  }

  // If we get here, Supabase likely redirected with tokens in the hash
  // We need to preserve the hash by doing a client-side redirect
  // Return an HTML page that redirects while preserving the hash
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Redirecting...</title>
        <script>
          // Preserve hash and redirect to client-side handler
          const hash = window.location.hash;
          const next = ${JSON.stringify(next)};
          const redirectUrl = '/callback/auth?next=' + encodeURIComponent(next) + hash;
          window.location.replace(redirectUrl);
        </script>
      </head>
      <body>
        <p>Redirecting...</p>
      </body>
    </html>
  `;
  
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

