import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/** i18n uniquement — NextAuth retiré du Edge (évite crash 503/500 sur Hostinger). */
export default createIntlMiddleware(routing);

export const config = {
  matcher: ["/", "/(fr|en|it)/:path*"],
};
