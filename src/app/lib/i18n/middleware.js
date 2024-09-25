import { NextResponse } from 'next/server';
import acceptLanguage from 'accept-language';
import { fallbackLng, languages, cookieName } from './settings';

acceptLanguage.languages(languages);

export const config = {
  matcher: ['/((api|static| *\\ *|_next) *)'],
};

export async function middleware(req) {
  let lng;
  if (req.cookies.has(cookieName)) {
    lng = acceptLanguage.get(req.cookies.get(cookieName).value);
  }
  if (!lng) {
    lng = acceptLanguage.get(req.headers.get('Accept-Language'));
  }
  if (!lng) {
    lng = fallbackLng; // 默认语言
  }

  if (!languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`))) {
    return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url));
  }

  return NextResponse.next();
}
