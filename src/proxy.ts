// src/proxy.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============ Facebook Pixel Middleware Functions ============
function setupFacebookCookies(request: NextRequest, response: NextResponse) {
  const url = request.nextUrl;
  const fbclid = url.searchParams.get('fbclid');

  // Capture fbclid from URL and store in cookie
  if (fbclid) {
    response.cookies.set('_fbc', `fb.1.${Date.now()}.${fbclid}`, {
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  // Create fbp cookie if not exists
  if (!request.cookies.get('_fbp')) {
    const randomId = Math.random().toString(36).substring(2, 15);
    response.cookies.set('_fbp', `fb.1.${Date.now()}.${randomId}`, {
      maxAge: 60 * 60 * 24 * 90,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return response;
}

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Get initial response
    let response = NextResponse.next();

    // Setup Facebook cookies (always do this first)
    response = setupFacebookCookies(req, response);

    // Prevent signed-in users from accessing auth pages
    if (token && (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup'))) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Check if user is active
    if (token && !token.isActive) {
      return NextResponse.redirect(new URL('/auth/signin?error=Account deactivated', req.url));
    }

    // Protect admin routes
    if (pathname.startsWith('/admin-dashboard')) {
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protect moderator routes
    if (pathname.startsWith('/moderator-dashboard')) {
      if (token?.role !== 'moderator') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protect user routes
    if (pathname.startsWith('/user-dashboard')) {
      if (token?.role !== 'user') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protect account routes
    if (pathname.startsWith('/account')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    // ✅ Return the response with Facebook cookies
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes
        const publicRoutes = [
          '/',
          '/shop',
          '/shop/search',
          '/categories',
          '/deals',
          '/about',
          '/contact',
          '/auth/signin',
          '/auth/signup',
          '/api/auth',
          '/api/products',
          '/api/products/search',
        ];

        const isPublicRoute = publicRoutes.some(route =>
          req.nextUrl.pathname === route ||
          req.nextUrl.pathname.startsWith(route + '/')
        );

        if (isPublicRoute) {
          return true;
        }

        // For protected routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Auth protected routes
    '/admin-dashboard/:path*',
    '/moderator-dashboard/:path*',
    '/user-dashboard/:path*',
    '/account/:path*',
    '/auth/signin',
    '/auth/signup',
    // Facebook Pixel - all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};