import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { routing, type Locale } from "@/i18n/routing";
import { requestPasswordReset } from "@/lib/password-reset";
import { MailNotConfiguredError, MailSendError } from "@/lib/smtp-config";

function isDatabaseError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientKnownRequestError ||
    (err instanceof Error &&
      (err.message.includes("Can't reach database") ||
        err.message.includes("Authentication failed") ||
        err.message.includes("database")))
  );
}

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

    if (isDatabaseError(err)) {
      return NextResponse.json(
        { error: "service_unavailable", code: "database" },
        { status: 503 },
      );
    }

    if (err instanceof MailNotConfiguredError || err instanceof MailSendError) {
      return NextResponse.json(
        { error: "mail_failed", code: "smtp" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: "Unable to process request" },
      { status: 500 },
    );
  }
}
