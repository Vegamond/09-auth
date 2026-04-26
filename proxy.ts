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
  let newCookies: string[] = [];

  if (accessToken) {
    isAuthenticated = true;
  } else if (refreshToken) {
    try {
      const sessionRes = await checkServerSession();
      isAuthenticated = true;

      // Збираємо нові куки тільки через Set-Cookie заголовки
      const setCookies = sessionRes.headers['set-cookie'];
      if (setCookies) {
        newCookies = Array.isArray(setCookies) ? setCookies : [setCookies];
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Після перевірки сесії — виконуємо ті ж редиректи що й для авторизованих
  if (isPrivate && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuth && isAuthenticated) {
    const redirectResponse = NextResponse.redirect(new URL('/', request.url));
    // Додаємо оновлені куки до редиректу
    newCookies.forEach((cookie) => {
      redirectResponse.headers.append('Set-Cookie', cookie);
    });
    return redirectResponse;
  }

  // Для приватних маршрутів після поновлення сесії — передаємо куки далі
  const response = NextResponse.next();
  newCookies.forEach((cookie) => {
    response.headers.append('Set-Cookie', cookie);
  });
  return response;
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};