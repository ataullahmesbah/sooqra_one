// src/middleware.ts (অথবা proxy.ts)
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============ Facebook Pixel Middleware Functions ============
function setupFacebookCookies(request: NextRequest, response: NextResponse) {
  const url = request.nextUrl;
  const fbclid = url.searchParams.get('fbclid');

  if (fbclid) {
    response.cookies.set('_fbc', `fb.1.${Date.now()}.${fbclid}`, {
      maxAge: 60 * 60 * 24 * 90,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

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
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    let response = NextResponse.next();

    // Setup Facebook cookies (every route)
    response = setupFacebookCookies(req, response);

    // ============ PUBLIC ROUTES (No login required) ============
    const publicRoutes = [
      '/',
      '/products',
      '/shop',
      '/categories',
      '/deals',
      '/about',
      '/contact',
      '/auth/signin',
      '/auth/signup',
      '/cart',           // ✅ Cart page - no login required
      '/checkout',       // ✅ Checkout page - no login required
      '/api/products',
      '/api/auth',
    ];

    // Check if current path is public
    const isPublicRoute = publicRoutes.some(route => {
      if (route === '/') return pathname === '/';
      return pathname === route || pathname.startsWith(route + '/');
    });

    // ✅ Allow public routes without authentication
    if (isPublicRoute) {
      return response;
    }

    // ============ PROTECTED ROUTES (Require Login) ============

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
        return NextResponse.redirect(new URL('/', req.url));
      }
      return response;
    }

    // Protect moderator routes
    if (pathname.startsWith('/moderator-dashboard')) {
      if (token?.role !== 'moderator') {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return response;
    }

    // Protect user routes
    if (pathname.startsWith('/user-dashboard')) {
      if (token?.role !== 'user') {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return response;
    }

    // Protect account routes - require authentication
    if (pathname.startsWith('/account')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
      return response;
    }

    // For any other route, allow access
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes - always allow
        const publicRoutes = [
          '/',
          '/products',
          '/shop',
          '/categories',
          '/deals',
          '/about',
          '/contact',
          '/auth/signin',
          '/auth/signup',
          '/cart',
          '/checkout',
        ];

        const isPublicRoute = publicRoutes.some(route =>
          pathname === route || pathname.startsWith(route + '/')
        );

        // Allow public routes without token
        if (isPublicRoute) {
          return true;
        }

        // Protected routes require token
        const protectedRoutes = ['/account', '/user-dashboard', '/admin-dashboard', '/moderator-dashboard'];
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

        if (isProtectedRoute) {
          return !!token;
        }

        // Default: allow access
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Matcher for all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};