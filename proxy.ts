import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkServerSession } from './lib/api/serverApi';

const privateRoutes = ['/notes', '/profile'];
const authRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const isPrivate = privateRoutes.some((route) => pathname.startsWith(route));
  const isAuth = authRoutes.some((route) => pathname.startsWith(route));

  let isAuthenticated = false;
  let response = NextResponse.next();

  if (accessToken) {
    isAuthenticated = true;
  } else if (!accessToken && refreshToken) {
    try {
      const sessionRes = await checkServerSession();
      isAuthenticated = true;

      const setCookies = sessionRes.headers['set-cookie'];
      if (setCookies) {
        const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies];
        cookiesArray.forEach((cookie) => {
          response.headers.append('Set-Cookie', cookie);
        });
      }

      const newAccess = sessionRes.data?.accessToken;
      const newRefresh = sessionRes.data?.refreshToken;
      
      if (newAccess) response.cookies.set('accessToken', newAccess, { path: '/' });
      if (newRefresh) response.cookies.set('refreshToken', newRefresh, { path: '/' });

    } catch (error) {
      isAuthenticated = false;
    }
  }

  if (isPrivate && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuth && isAuthenticated) {
    return NextResponse.redirect(new URL('/notes/filter/all', request.url));
  }

  return response;
}

// ОСЬ ТУТ ЗМІНИВСЯ MATCHER
export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};