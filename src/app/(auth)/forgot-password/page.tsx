"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email format."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: ForgotPasswordValues) => {
    setIsSubmitting(true);
    setSuccess("");
    form.clearErrors("root");

    try {
      const response = await authClient.requestPasswordReset({
        email: values.email.trim(),
        redirectTo: "/reset-password",
      });

      if (response?.error) {
        form.setError("root", {
          type: "server",
          message:
            response.error.message || "Unable to send reset instructions.",
        });
        return;
      }

      form.reset();
      setSuccess("If your email exists, reset instructions have been sent.");
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
          Forgot your password?
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          Enter your email and we&apos;ll send reset instructions.
        </p>
      </div>
      <div className="w-full max-w-[430px]">
        <Card className="w-full p-4 shadow-sm sm:p-5">
          <form onSubmit={handleFormSubmit} noValidate className="space-y-2">
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
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="forgot-password-email">
                      Email
                    </FieldLabel>
                    <Input
                      {...field}
                      id="forgot-password-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button
                className="mt-2 w-full"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Sending..." : "Send reset instructions"}
              </Button>
            </FieldGroup>
          </form>
        </Card>
      </div>
      <div className="text-center">
        Remember your password?{" "}
        <Link href="/signin" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
