"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

const verifyEmailSchema = z.object({
  email: z.string().trim().email("Invalid email format."),
  otp: z.string().length(6, "OTP must be exactly 6 digits."),
});

type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromParams = searchParams.get("email") ?? "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [showSendOtpForm, setShowSendOtpForm] = useState(!emailFromParams);

  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailFromParams,
      otp: "",
    },
  });

  const handleSendOtp = async (email: string) => {
    setIsSubmitting(true);
    setSuccess("");
    form.clearErrors("root");

    try {
      const { error: sendOtpError } =
        await authClient.emailOtp.sendVerificationOtp({
          email: email.trim(),
          type: "email-verification",
        });

      if (sendOtpError) {
        form.setError("email", {
          type: "server",
          message: sendOtpError.message || "Unable to send verification code.",
        });
        return;
      }

      setSuccess("Verification code sent to your email.");
      setShowSendOtpForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (values: VerifyEmailValues) => {
    setIsSubmitting(true);
    setSuccess("");
    form.clearErrors("root");

    try {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email: values.email.trim(),
        otp: values.otp,
      });

      if (verifyError) {
        form.setError("otp", {
          type: "server",
          message:
            verifyError.message || "Invalid or expired verification code.",
        });
        return;
      }

      setSuccess("Email verified successfully!");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitForm = form.handleSubmit(handleSubmit);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitForm();
  };

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-start gap-4 px-4 py-6 sm:justify-center sm:py-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-[0_0_40px_0px] shadow-primary/40">
        <div className="text-5xl font-extrabold">S</div>
      </div>

      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Verify your email
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          {showSendOtpForm
            ? "Enter your email to receive a verification code."
            : "Check your inbox for the 6-digit code."}
        </p>
      </div>

      <div className="w-full max-w-[430px]">
        <Card className="w-full p-4 shadow-sm sm:p-5">
          <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
            {success !== "" && (
              <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
                {success}
              </p>
            )}

            {form.formState.errors.root?.message && (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {form.formState.errors.root.message}
              </p>
            )}

            <FieldGroup>
              {showSendOtpForm ? (
                <>
                  <Controller
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="verify-email">Email</FieldLabel>
                        <FieldContent>
                          <Input
                            {...field}
                            id="verify-email"
                            type="email"
                            autoComplete="email"
                            placeholder="name@example.com"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />

                  <Button
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={() => handleSendOtp(form.getValues("email"))}
                    type="button"
                  >
                    {isSubmitting ? "Sending..." : "Send verification code"}
                  </Button>
                </>
              ) : (
                <>
                  <Field data-invalid={Boolean(form.formState.errors.email)}>
                    <FieldLabel htmlFor="verify-email-email">Email</FieldLabel>
                    <FieldContent>
                      <Input
                        id="verify-email-email"
                        type="email"
                        value={form.getValues("email")}
                        readOnly
                        className="bg-muted/50"
                      />
                    </FieldContent>
                  </Field>

                  <Controller
                    control={form.control}
                    name="otp"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="verify-otp">
                          Verification code
                        </FieldLabel>
                        <FieldContent>
                          <InputOTP
                            {...field}
                            maxLength={6}
                            onChange={(value) => {
                              field.onChange(value);
                              form.trigger("otp");
                            }}
                            containerClassName="w-full justify-center"
                          >
                            <InputOTPGroup>
                              {[0, 1, 2, 3, 4, 5].map((index) => (
                                <InputOTPSlot key={index} index={index} />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />

                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Verifying..." : "Verify email"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSendOtp(form.getValues("email"))}
                    disabled={isSubmitting}
                    type="button"
                  >
                    {isSubmitting ? "Resending..." : "Resend code"}
                  </Button>
                </>
              )}
            </FieldGroup>
          </form>
        </Card>
      </div>

      <div className="text-center text-sm">
        <Link href="/signin" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
