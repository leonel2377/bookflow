import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT ?? "587");
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendMail(options: SendMailOptions): Promise<void> {
  const from =
    process.env.MAIL_FROM ?? `"BOOKFLOW" <${process.env.SMTP_USER ?? "noreply@bookflow.local"}>`;

  const message: Mail.Options = {
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  if (!isSmtpConfigured()) {
    console.info("\n--- E-mail (mode dev, SMTP non configuré) ---");
    console.info(`À: ${options.to}`);
    console.info(`Objet: ${options.subject}`);
    console.info(options.text);
    console.info("--------------------------------------------\n");
    return;
  }

  const transport = createTransport();
  await transport.sendMail(message);
}
