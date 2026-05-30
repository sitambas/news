import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const protectedAdminRoutes = ['/admin'];
const protectedUserRoutes = ['/profile', '/bookmarks'];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = protectedAdminRoutes.some((route) => pathname.startsWith(route));
  const isUserRoute = protectedUserRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute || isUserRoute) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth-token');
      return response;
    }

    if (isAdminRoute && !['admin', 'editor'].includes(decoded.role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/bookmarks/:path*'],
};
