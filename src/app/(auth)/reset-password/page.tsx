"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function Page() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const hasToken = token.length > 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      form.setError("root", {
        type: "manual",
        message: "This reset link is invalid or expired.",
      });
      return;
    }

    setIsSubmitting(true);
    setSuccess("");
    form.clearErrors("root");

    try {
      const response = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });

      if (response?.error) {
        form.setError("root", {
          type: "server",
          message: response.error.message || "Unable to reset password.",
        });
        return;
      }

      form.reset();
      setSuccess("Password updated successfully. You can sign in now.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : undefined;
      form.setError("root", {
        type: "server",
        message: message || "Unable to reset password.",
      });
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
          Set a new password
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          Choose a strong password to secure your account.
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
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="reset-password">
                      New password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="reset-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="reset-confirm-password">
                      Confirm new password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="reset-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {!hasToken && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  This reset link is invalid or expired. Request a new reset
                  link.
                </p>
              )}

              <Button
                className="mt-2 w-full"
                disabled={isSubmitting || !hasToken}
                type="submit"
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </Button>
            </FieldGroup>
          </form>
        </Card>
      </div>
      <div className="text-center">
        {hasToken ? "Back to " : "Need a fresh link? "}
        {!hasToken && (
          <Link
            href="/forgot-password"
            className="text-primary hover:underline"
          >
            Forgot password
          </Link>
        )}
        {!hasToken && " or "}
        <Link href="/signin" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
