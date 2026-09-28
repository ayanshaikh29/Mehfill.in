import { NextResponse } from "next/server";

// Server timestamp so the client can correct for a wrong device clock.
// GET /api/time -> { now: <server UTC ms> }
export async function GET() {
  return NextResponse.json(
    { now: Date.now() },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
