import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  // 1. Oturum bilgisini (token) çerezden (cookie) oku.
  //    NOT: 'sessionToken' adını, kendi kullandığınız çerez adıyla değiştirmeniz gerekebilir.
  const sessionToken = request.cookies.get('sessionToken')?.value;

  const { pathname } = request.nextUrl;

  // 2. Herkese açık (public) sayfaları tanımla.
  const publicRoutes = [
    '/', // Ana sayfa
    '/login',
    '/register',
    '/forgot-password',
    '/elci-basvuru',
    '/elci-panel',
    '/gdpr',
    '/cookies',
    '/privacy',
    '/terms',
    '/odeme',
    '/help',
    '/feedback',
  ];

  // Dinamik herkese açık rotaların başlangıçları
  const dynamicPublicPrefixes = ['/odeme', '/api/get-application', '/elci-panel'];

  // Mevcut sayfa yolunun herkese açık olup olmadığını kontrol et
  const isPublicPage =
    publicRoutes.includes(pathname) ||
    dynamicPublicPrefixes.some((prefix) => pathname.startsWith(prefix));

  // --- Yönlendirme Mantığı ---

  // DURUM 1: Kullanıcının oturumu yok VE gitmek istediği sayfa herkese açık DEĞİL.
  if (!sessionToken && !isPublicPage) {
    // Kullanıcıyı login sayfasına yönlendir.
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // DURUM 2: Kullanıcının oturumu var VE login sayfasına gitmeye çalışıyor.
  if (sessionToken && pathname === '/login') {
    // Kullanıcıyı ana panele (dashboard) yönlendir.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Yukarıdaki durumlar dışındaki her istek için, sayfanın normal şekilde yüklenmesine izin ver.
  return NextResponse.next();
}

// Middleware'in hangi sayfa yollarında çalışacağını belirtir.
// Bu, gereksiz API ve dosya isteklerinde çalışmasını engeller.
export const config = {
  matcher: [
    // Bu yeni desen, API, Next.js dosyaları ve yaygın resim uzantıları
    // DIŞINDAKİ her şeyle eşleşir.
    '/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
};