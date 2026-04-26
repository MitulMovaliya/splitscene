"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const signinSchema = z.object({
  email: z.string().trim().email("Invalid email format."),
  password: z.string().min(1, "Password is required."),
});

type SigninValues = z.infer<typeof signinSchema>;

export default function Page() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const normalizedNextPath = nextPath?.replace(/\\+/g, "/").trim() ?? "";
  const callbackURL =
    normalizedNextPath.startsWith("/") &&
    !normalizedNextPath.startsWith("//") &&
    !normalizedNextPath.slice(1).includes(":")
      ? normalizedNextPath
      : "/";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const form = useForm<SigninValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: SigninValues) => {
    setIsSubmitting(true);
    setSuccess("");
    form.clearErrors("root");

    try {
      const response = (await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL,
      })) as { error?: { message?: string }; url?: string };

      if (response.error) {
        form.setError("root", {
          type: "server",
          message: response.error.message || "Unable to sign in.",
        });
        return;
      }

      // Sign in successful, redirect to callback URL
      if (response.url) {
        window.location.assign(response.url);
        return;
      }

      setSuccess("Signed in successfully.");
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
      <div className="flex w-20 h-20 items-center justify-center rounded-3xl bg-primary shadow-[0_0_40px_0px] shadow-primary/40">
        <div className="text-5xl font-extrabold">S</div>
      </div>
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-muted-foreground mt-2 text-center">
          Sign in to continue managing expenses.
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
                    <FieldLabel htmlFor="signin-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="signin-email"
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

              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="signin-password">
                        Password
                      </FieldLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      {...field}
                      id="signin-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button
                className="w-full mt-2"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </FieldGroup>
          </form>
        </Card>
      </div>
      <div className="text-center">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
