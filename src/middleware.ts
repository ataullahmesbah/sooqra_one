import { withAuth } from 'next-auth/middleware';

export default withAuth(
    function middleware(req) {
        // Additional middleware logic can go here
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Protect admin routes
                if (req.nextUrl.pathname.startsWith('/admin-dashboard')) {
                    return token?.role === 'admin';
                }

                // Protect moderator routes
                if (req.nextUrl.pathname.startsWith('/moderator')) {
                    return token?.role === 'admin' || token?.role === 'moderator';
                }

                // Check if user is active
                return !!token?.isActive;
            },
        },
    }
);

export const config = {
    matcher: [
        '/admin-dashboard/:path*',
        '/moderator/:path*',
        '/profile/:path*',
    ],
};