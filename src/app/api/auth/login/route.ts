import { NextResponse } from "next/server";
import {
  isRateLimited,
  recordLoginAttempt,
  clearLoginAttempts,
} from "@/lib/auth";

export async function POST(req: Request) {
  // Get IP address for rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Check rate limiting
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const password = formData.get("password");

  if (typeof password !== "string") {
    return NextResponse.json({ error: "Invalid password" }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured" },
      { status: 500 }
    );
  }

  if (password !== expected) {
    // Record failed attempt
    recordLoginAttempt(ip);
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  // Clear login attempts on success
  clearLoginAttempts(ip);

  const res = NextResponse.json({ ok: true });

  res.cookies.set("admin_auth", "1", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
