import { addHours } from "date-fns";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { generateResetToken, hashResetToken } from "@/lib/tokens";
import { getAppUrl } from "@/lib/app-url";
import { sendMail } from "@/lib/mail";
import type { Locale } from "@/i18n/routing";

const TOKEN_TTL_HOURS = 1;

const resetCopy: Record<
  Locale,
  { subject: string; intro: string; cta: string; ignore: string; expiry: string }
> = {
  fr: {
    subject: "Réinitialisation de votre mot de passe — BOOKFLOW",
    intro: "Vous avez demandé à réinitialiser votre mot de passe BOOKFLOW.",
    cta: "Réinitialiser mon mot de passe",
    ignore: "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
    expiry: "Ce lien expire dans 1 heure.",
  },
  en: {
    subject: "Reset your BOOKFLOW password",
    intro: "You requested to reset your BOOKFLOW password.",
    cta: "Reset my password",
    ignore: "If you did not request this, you can ignore this email.",
    expiry: "This link expires in 1 hour.",
  },
  it: {
    subject: "Reimpostazione password BOOKFLOW",
    intro: "Hai richiesto di reimpostare la password BOOKFLOW.",
    cta: "Reimposta la password",
    ignore: "Se non hai richiesto questa operazione, ignora questa e-mail.",
    expiry: "Il link scade tra 1 ora.",
  },
};

export async function requestPasswordReset(
  email: string,
  locale: Locale,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) return;

  const rawToken = generateResetToken();
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = addHours(new Date(), TOKEN_TTL_HOURS);

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    }),
  ]);

  const resetUrl = `${getAppUrl()}/${locale}/mot-de-passe/reinitialiser?token=${rawToken}`;
  const copy = resetCopy[locale];

  await sendMail({
    to: user.email,
    subject: copy.subject,
    text: `${copy.intro}\n\n${resetUrl}\n\n${copy.expiry}\n\n${copy.ignore}`,
    html: `
      <p>${copy.intro}</p>
      <p><a href="${resetUrl}">${copy.cta}</a></p>
      <p style="color:#666;font-size:14px">${copy.expiry}</p>
      <p style="color:#666;font-size:14px">${copy.ignore}</p>
      <p style="color:#999;font-size:12px;word-break:break-all">${resetUrl}</p>
    `,
  });
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<"ok" | "invalid" | "expired"> {
  const tokenHash = hashResetToken(token.trim());
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) return "invalid";
  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    return "expired";
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return "ok";
}
