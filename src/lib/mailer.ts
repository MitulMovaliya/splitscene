import "server-only";
import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === "true";
const defaultFrom = process.env.SMTP_FROM ?? smtpUser;

type GlobalMailer = {
  transporter?: nodemailer.Transporter;
};

const globalForMailer = globalThis as unknown as GlobalMailer;

export const mailer =
  globalForMailer.transporter ??
  nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth:
      smtpUser && smtpPass
        ? {
            user: smtpUser,
            pass: smtpPass,
          }
        : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForMailer.transporter = mailer;
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

export async function sendEmail({
  to,
  subject,
  text,
  html,
  from,
}: SendEmailInput) {
  if (!smtpHost) {
    throw new Error("Missing SMTP_HOST environment variable.");
  }

  if (!defaultFrom && !from) {
    throw new Error("Missing SMTP_FROM (or SMTP_USER) environment variable.");
  }

  return mailer.sendMail({
    from: from ?? defaultFrom,
    to,
    subject,
    text,
    html,
  });
}
