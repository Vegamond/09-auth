import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkServerSession } from './lib/api/serverApi';

const privateRoutes = ['/notes', '/profile'];
const authRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Отримуємо обидва токени
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const isPrivate = privateRoutes.some((route) => pathname.startsWith(route));
  const isAuth = authRoutes.some((route) => pathname.startsWith(route));

  let isAuthenticated = false;
  let response = NextResponse.next();

  if (accessToken) {
    // Якщо є accessToken, сесія валідна
    isAuthenticated = true;
  } else if (!accessToken && refreshToken) {
    // Якщо accessToken відсутній, але є refreshToken — пробуємо оновити
    try {
      const sessionRes = await checkServerSession();
      isAuthenticated = true;

      // Оновлюємо cookies, якщо сервер надіслав нові
      
      // 1. Якщо бекенд використовує заголовки Set-Cookie (найчастіший варіант)
      const setCookies = sessionRes.headers['set-cookie'];
      if (setCookies) {
        const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies];
        cookiesArray.forEach((cookie) => {
          response.headers.append('Set-Cookie', cookie);
        });
      }

      // 2. Якщо бекенд повертає токени безпосередньо в тілі (страхувальний варіант)
      const newAccess = sessionRes.data?.accessToken;
      const newRefresh = sessionRes.data?.refreshToken;
      
      if (newAccess) response.cookies.set('accessToken', newAccess, { path: '/' });
      if (newRefresh) response.cookies.set('refreshToken', newRefresh, { path: '/' });

    } catch (error) {
      // Якщо рефреш не вдався (наприклад, refreshToken прострочений)
      isAuthenticated = false;
    }
  }

  // Застосовуємо редиректи
  if (isPrivate && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuth && isAuthenticated) {
    return NextResponse.redirect(new URL('/notes/filter/all', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};