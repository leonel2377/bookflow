import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import {
  getSmtpConfig,
  isSmtpConfigured,
  MailNotConfiguredError,
  MailSendError,
} from "@/lib/smtp-config";

type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function createTransport() {
  const { host, user, pass, port } = getSmtpConfig();

  return nodemailer.createTransport({
    host: host!,
    port,
    secure: port === 465,
    auth: { user: user!, pass: pass! },
    tls: port === 587 ? { minVersion: "TLSv1.2" } : undefined,
  });
}

export async function sendMail(options: SendMailOptions): Promise<void> {
  const { from } = getSmtpConfig();

  const message: Mail.Options = {
    from: from ?? `"BOOKFLOW" <noreply@bookflow.local>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new MailNotConfiguredError();
    }

    console.info("\n--- E-mail (mode dev, SMTP non configuré) ---");
    console.info(`À: ${options.to}`);
    console.info(`Objet: ${options.subject}`);
    console.info(options.text);
    console.info("--------------------------------------------\n");
    return;
  }

  try {
    const transport = createTransport();
    await transport.sendMail(message);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[mail] send failed:", detail);
    throw new MailSendError(`Échec envoi e-mail : ${detail}`, err);
  }
}
