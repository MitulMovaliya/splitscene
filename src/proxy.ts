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

  if (!isAuthenticated && isVerificationPage) {
    const redirectUrl = new URL("/signin", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (!isAuthenticated && !isPublic) {
    const redirectUrl = new URL("/signin", request.url);
    redirectUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated && isVerificationPage && session?.user?.email) {
    const queryEmail = request.nextUrl.searchParams.get("email");
    if (queryEmail !== session.user.email) {
      const redirectUrl = new URL("/verify-email", request.url);
      redirectUrl.searchParams.set("email", session.user.email);
      if (request.nextUrl.searchParams.has("next")) {
        redirectUrl.searchParams.set(
          "next",
          request.nextUrl.searchParams.get("next") ?? "/",
        );
      }
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isAuthenticated && !emailVerified && !isPublic && !isVerificationPage) {
    const redirectUrl = new URL("/verify-email", request.url);
    if (session?.user?.email) {
      redirectUrl.searchParams.set("email", session.user.email);
    }
    redirectUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated && emailVerified && isVerificationPage) {
    const nextPath = request.nextUrl.searchParams.get("next") ?? "/";
    const normalizedNextPath = nextPath.replace(/\\+/g, "/").trim();
    const safeNextPath =
      normalizedNextPath.startsWith("/") &&
      !normalizedNextPath.startsWith("//") &&
      !normalizedNextPath.slice(1).includes(":")
        ? normalizedNextPath
        : "/";

    return NextResponse.redirect(new URL(safeNextPath, request.url));
  }

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
