import { cleanEnvValue } from "@/lib/database-url";

export class MailNotConfiguredError extends Error {
  constructor() {
    super("SMTP non configuré (SMTP_HOST, SMTP_USER, SMTP_PASS requis en production)");
    this.name = "MailNotConfiguredError";
  }
}

export class MailSendError extends Error {
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "MailSendError";
    this.cause = cause;
  }
}

export function getSmtpPort(): number {
  const raw = cleanEnvValue(process.env.SMTP_PORT) ?? "465";
  const port = Number(raw);
  // Erreur fréquente Hostinger : 485 au lieu de 465
  if (port === 485) return 465;
  return Number.isFinite(port) && port > 0 ? port : 465;
}

export function getSmtpConfig() {
  const host = cleanEnvValue(process.env.SMTP_HOST);
  const user = cleanEnvValue(process.env.SMTP_USER);
  const pass = cleanEnvValue(process.env.SMTP_PASS);
  const port = getSmtpPort();
  const from =
    cleanEnvValue(process.env.MAIL_FROM) ??
    (user ? `"BOOKFLOW" <${user}>` : undefined);

  return { host, user, pass, port, from };
}

export function isSmtpConfigured(): boolean {
  const { host, user, pass } = getSmtpConfig();
  return Boolean(host && user && pass);
}

export function getSmtpHealthChecks(): Record<string, boolean | string | number> {
  const { host, user, pass, port, from } = getSmtpConfig();
  const rawPort = cleanEnvValue(process.env.SMTP_PORT) ?? "465";
  const appUrl = cleanEnvValue(process.env.NEXT_PUBLIC_APP_URL) ?? cleanEnvValue(process.env.AUTH_URL);

  const checks: Record<string, boolean | string | number> = {
    smtpHost: Boolean(host),
    smtpUser: Boolean(user),
    smtpPass: Boolean(pass),
    smtpPort: port,
    mailFrom: Boolean(from),
    appUrlForEmails: Boolean(appUrl),
    smtpReady: Boolean(host && user && pass && from && appUrl),
  };

  if (rawPort === "485") {
    checks.smtpPortWarning = "SMTP_PORT=485 détecté — utilisez 465 (SSL) ou 587 (TLS)";
  }

  if (!checks.smtpReady) {
    checks.smtpFixSteps = [
      "1. hPanel → E-mails → créer noreply@stkmsoft.online (ou votre domaine)",
      "2. Variables app : SMTP_HOST=smtp.hostinger.com, SMTP_PORT=465, SMTP_USER=noreply@stkmsoft.online",
      "3. SMTP_PASS=mot de passe de la boîte mail, MAIL_FROM=BOOKFLOW <noreply@stkmsoft.online>",
      "4. NEXT_PUBLIC_APP_URL=https://stkmsoft.online",
    ];
  }

  return checks;
}
