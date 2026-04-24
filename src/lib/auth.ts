import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { getMongoDb, mongoClientPromise } from "@/lib/mongodb";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "@/lib/mailer";
import { buildOtpEmailTemplate } from "@/lib/email-templates";

const db = await getMongoDb();
const mongoClient = await mongoClientPromise;

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: mongoClient,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    emailOTP({
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        const { subject, text, html } = buildOtpEmailTemplate({ otp, type });

        // Do not await email delivery to reduce timing attack surface.
        console.log(email, otp, type);
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
