import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Protect /admin/* routes (except /admin which is the login page)
  if (pathname.startsWith('/admin/')) {
    const accessToken = request.cookies.get('access_token')?.value;
    const authSession = request.cookies.get('auth_session')?.value;

    if (!accessToken && !authSession) {
      // No tokens at all — truly unauthenticated, redirect to login
      const loginUrl = new URL('/admin', request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (!accessToken && authSession) {
      // Access token expired but session alive — let through,
      // client-side interceptor will refresh the token
      const response = NextResponse.next();
      response.cookies.delete('access_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path+'],
};
