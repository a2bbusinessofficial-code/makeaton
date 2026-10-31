import { NextResponse, type NextRequest } from "next/server";
import { runDailyJobs } from "@/domain/jobs";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Called once a day by Vercel Cron (see vercel.json). Protected by CRON_SECRET. */
export async function GET(request: NextRequest) {
  const secret = env().CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runDailyJobs("Scheduler");
  return NextResponse.json({ ok: true, ...result });
}
