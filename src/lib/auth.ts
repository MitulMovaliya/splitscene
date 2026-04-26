import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { getMongoDb, mongoClientPromise } from "@/lib/mongodb";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "@/lib/mailer";
import {
  buildOtpEmailTemplate,
  buildResetPasswordEmailTemplate,
} from "@/lib/email-templates";

const db = await getMongoDb();
const mongoClient = await mongoClientPromise;

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: mongoClient,
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      const { subject, text, html } = buildResetPasswordEmailTemplate({
        resetUrl: url,
        name: user.name,
      });

      sendEmail({
        to: user.email,
        subject,
        text,
        html,
      }).catch((error: unknown) => {
        console.error("Failed to send reset password email", error);
      });
    },
  },
  plugins: [
    nextCookies(),
    emailOTP({
      sendVerificationOnSignUp: true,

      async sendVerificationOTP({ email, otp, type }) {
        const { subject, text, html } = buildOtpEmailTemplate({ otp, type });
        sendEmail({
          to: email,
          subject,
          text,
          html,
        }).catch((error: unknown) => {
          console.error("Failed to send OTP email", error);
        });
      },
    }),
  ],
});
