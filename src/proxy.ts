import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];
const publicRoutePrefixes = ["/api/auth"];

function isPublicRoute(pathname: string) {
  if (publicRoutes.includes(pathname)) {
    return true;
  }

  return publicRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isVerificationPage = pathname === "/verify-email";

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthenticated = Boolean(session?.user);
  const isPublic = isPublicRoute(pathname);
  const emailVerified = session?.user?.emailVerified ?? false;

  // Block unauthenticated access to verify-email.
  if (!isAuthenticated && isVerificationPage) {
    const redirectUrl = new URL("/signin", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect unauthenticated users to signin (unless public route)
  if (!isAuthenticated && !isPublic) {
    const redirectUrl = new URL("/signin", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Keep verify-email query email aligned with the authenticated user's email.
  if (isAuthenticated && isVerificationPage && session?.user?.email) {
    const queryEmail = request.nextUrl.searchParams.get("email");
    if (queryEmail !== session.user.email) {
      const redirectUrl = new URL("/verify-email", request.url);
      redirectUrl.searchParams.set("email", session.user.email);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Enforce email verification: if signed in but email not verified, redirect to verify-email
  if (isAuthenticated && !emailVerified && !isPublic && !isVerificationPage) {
    const redirectUrl = new URL("/verify-email", request.url);
    if (session?.user?.email) {
      redirectUrl.searchParams.set("email", session.user.email);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect verified users away from verify-email.
  if (isAuthenticated && emailVerified && isVerificationPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect authenticated users away from auth pages (except verify-email)
  if (
    isAuthenticated &&
    publicRoutes.includes(pathname) &&
    pathname !== "/verify-email"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
