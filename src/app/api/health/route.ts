import { NextResponse } from "next/server";
import { validateEnv } from "@/lib/auth";

/**
 * Health check endpoint that validates environment configuration
 */
export async function GET() {
  try {
    validateEnv();
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Configuration error",
      },
      { status: 500 }
    );
  }
}
