import { betterAuth } from "better-auth";
import nodemailer from "nodemailer";
import { db } from "./db";

async function sendEmail(to: string, subject: string, url: string) {
  if (!process.env.SMTP_URL || !process.env.MAIL_FROM)
    throw new Error("Email delivery is not configured");
  await nodemailer.createTransport(process.env.SMTP_URL).sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text: `${subject}: ${url}`,
  });
}

if (
  !process.env.BETTER_AUTH_SECRET ||
  process.env.BETTER_AUTH_SECRET.length < 32
)
  throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters");

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    disableSignUp:
      process.env.NODE_ENV === "production" &&
      (!process.env.SMTP_URL || !process.env.MAIL_FROM),
    minPasswordLength: 12,
    requireEmailVerification: process.env.NODE_ENV === "production",
    sendResetPassword: async ({ user, url }) =>
      sendEmail(user.email, "Reset your Select AI Agents password", url),
  },
  emailVerification: {
    sendOnSignUp: process.env.NODE_ENV === "production",
    sendVerificationEmail: async ({ user, url }) =>
      sendEmail(user.email, "Verify your Select AI Agents email", url),
  },
  rateLimit: { enabled: true, storage: "database", window: 60, max: 30 },
});
