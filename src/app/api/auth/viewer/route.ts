import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createViewerSession } from "@/lib/session";

export async function POST(req: Request) {
  const formData = await req.formData();
  const password = formData.get("password");

  if (typeof password !== "string") {
    return NextResponse.json({ error: "Invalid password" }, { status: 400 });
  }

  const expected = process.env.VIEWER_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "VIEWER_PASSWORD is not configured" },
      { status: 500 }
    );
  }

  // Check if password is hashed (starts with $2b$ for bcrypt)
  let isValid = false;
  if (expected.startsWith("$2b$") || expected.startsWith("$2a$")) {
    // Password is hashed, use bcrypt to compare
    isValid = await bcrypt.compare(password, expected);
  } else {
    // Password is plain text
    isValid = password === expected;
  }

  if (!isValid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  // Create viewer session using iron-session
  await createViewerSession();

  return NextResponse.json({ ok: true });
}
