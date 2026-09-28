import type { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "feaseweb_admin_session";

export function setAdminSessionCookie(response: NextResponse, clear = false) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: clear ? "" : "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(clear ? { maxAge: 0 } : {}),
  });
  return response;
}
