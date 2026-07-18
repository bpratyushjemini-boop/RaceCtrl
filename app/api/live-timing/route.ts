import { NextResponse } from "next/server";
import { getLiveSessionTiming } from "@/lib/api/f1";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roundStr = searchParams.get("round");
  const session = searchParams.get("session") || "Race";

  const round = Number(roundStr);
  if (isNaN(round) || round < 1) {
    return NextResponse.json({ success: false, error: "Invalid round parameter" }, { status: 400 });
  }

  try {
    const timing = await getLiveSessionTiming(round, session);
    if (!timing) {
      return NextResponse.json({ success: false, error: "No timing data found" }, { status: 404 });
    }
    return NextResponse.json(timing);
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
