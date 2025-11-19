import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export async function POST() {
  // Destroy iron-session
  await destroySession();

  return NextResponse.json({ ok: true });
}
