import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export { default } from 'next-auth/middleware';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXT_AUTH_SECRET });
    const { pathname } = request.nextUrl;

    // Public routes (accessible without login)
    const publicRoutes = ['/login', '/signup'];

    // If visiting login/signup while already logged in → go to dashboard
    if (publicRoutes.includes(pathname) && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If visiting protected routes without token → go to login
    if (pathname.startsWith('/dashboard') && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Continue request
    return NextResponse.next();
}

// run middleware on these routes
export const config = {
    matcher: ['/dashboard', '/login', '/signup'], 
};
