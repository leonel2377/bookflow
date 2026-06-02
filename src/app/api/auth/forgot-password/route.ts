import { NextResponse } from "next/server";
import { routing, type Locale } from "@/i18n/routing";
import { requestPasswordReset } from "@/lib/password-reset";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; locale?: string };
    const email = body.email?.trim();
    const locale = routing.locales.includes(body.locale as Locale)
      ? (body.locale as Locale)
      : routing.defaultLocale;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await requestPasswordReset(email, locale);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("forgot-password", err);
    return NextResponse.json(
      { error: "Unable to process request" },
      { status: 500 },
    );
  }
}
