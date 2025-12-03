import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

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
    if (pathname.startsWith('/moderator')) {
      if (token?.role !== 'admin' && token?.role !== 'moderator') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protect account routes
    if (pathname.startsWith('/account')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    return NextResponse.next();
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
    '/admin-dashboard/:path*',
    '/moderator/:path*',
    '/account/:path*',
    '/auth/signin',
    '/auth/signup',
  ],
};