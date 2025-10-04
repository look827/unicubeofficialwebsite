import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { USERS } from '@/lib/data/users';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get session (Edge-safe)
  const session = await getSession(request);

  const publicRoutes = ['/'];
  const isPublicRoute = publicRoutes.includes(pathname);
  const adminRoutes = ['/dashboard', '/attendance', '/goals'];

  if (session) {
    const user = USERS.find((u) => u.id === session.userId);

    // Redirect logged-in users from login page to dashboard/my-requests
    if (isPublicRoute) {
      const redirectTo = user?.role === 'admin' ? '/dashboard' : '/my-requests';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Prevent non-admin users from accessing admin routes
    if (adminRoutes.some((p) => pathname.startsWith(p)) && user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/my-requests', request.url));
    }
  } else {
    // Redirect unauthenticated users to login
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
