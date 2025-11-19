import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import {
  isRateLimited,
  recordLoginAttempt,
  clearLoginAttempts,
} from "@/lib/auth";
import { createAdminSession } from "@/lib/session";

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

  // Check if password is hashed (starts with $2b$ for bcrypt)
  let isValid = false;
  if (expected.startsWith("$2b$") || expected.startsWith("$2a$")) {
    // Password is hashed, use bcrypt to compare
    isValid = await bcrypt.compare(password, expected);
  } else {
    // Password is plain text (for backward compatibility during migration)
    isValid = password === expected;
    console.warn(
      "⚠️  WARNING: Using plain text password. Please hash your ADMIN_PASSWORD with bcrypt."
    );
  }

  if (!isValid) {
    // Record failed attempt
    recordLoginAttempt(ip);
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  // Clear login attempts on success
  clearLoginAttempts(ip);

  // Create admin session using iron-session
  await createAdminSession();

  return NextResponse.json({ ok: true });
}
