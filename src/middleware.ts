import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { UserRole } from "@/types/roles";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const PUBLIC_PRO_SUFFIXES = ["/pro/connexion", "/pro/inscription", "/pro/tarifs"];
const { auth } = NextAuth(authConfig);

function stripLocale(pathname: string): { locale: string; path: string } {
  const match = pathname.match(/^\/(fr|en|it)(\/.*)?$/);
  if (match) {
    return { locale: match[1], path: match[2] || "/" };
  }
  return { locale: routing.defaultLocale, path: pathname };
}

function localizedPath(locale: string, path: string) {
  return `/${locale}${path === "/" ? "" : path}`;
}

export default auth((req) => {
  const intlResponse = intlMiddleware(req as NextRequest);
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  const { pathname } = req.nextUrl;
  const { locale, path } = stripLocale(pathname);
  const session = req.auth;
  const role = session?.user?.role;

  const isCompte = path === "/compte" || path.startsWith("/compte/");
  const isProProtected =
    path.startsWith("/pro/") &&
    !PUBLIC_PRO_SUFFIXES.some((p) => path === p || path.startsWith(`${p}/`)) &&
    path !== "/pro";

  if (isCompte) {
    if (!session) {
      const url = new URL(localizedPath(locale, "/connexion"), req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (role === UserRole.PROVIDER) {
      return NextResponse.redirect(new URL(localizedPath(locale, "/pro"), req.nextUrl.origin));
    }
    if (role !== UserRole.CLIENT) {
      return NextResponse.redirect(new URL(localizedPath(locale, "/connexion"), req.nextUrl.origin));
    }
  }

  if (isProProtected) {
    if (!session) {
      const url = new URL(localizedPath(locale, "/pro/connexion"), req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (role === UserRole.CLIENT) {
      return NextResponse.redirect(new URL(localizedPath(locale, "/compte"), req.nextUrl.origin));
    }
    if (role !== UserRole.PROVIDER) {
      return NextResponse.redirect(new URL(localizedPath(locale, "/pro/connexion"), req.nextUrl.origin));
    }
  }

  return intlResponse;
});

export const config = {
  matcher: ["/", "/(fr|en|it)/:path*", "/compte/:path*", "/compte", "/pro/:path*"],
};
