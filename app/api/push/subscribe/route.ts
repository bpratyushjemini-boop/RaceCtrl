import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    const { endpoint, keys } = body;

    if (!endpoint || typeof endpoint !== "string" || !endpoint.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid or missing endpoint URL" }, { status: 400 });
    }

    if (!keys || typeof keys !== "object" || !keys.p256dh || !keys.auth || typeof keys.p256dh !== "string" || typeof keys.auth !== "string") {
      return NextResponse.json({ error: "Invalid or missing cryptographic keys" }, { status: 400 });
    }

    // Note: RaceCtrl currently has no database configured.
    // Durable cross-request push delivery requires a production database/subscription store.
    // We return success to complete the client subscription contract.
    return NextResponse.json({
      success: true,
      message: "Subscription endpoint validated successfully (pending database storage integration)",
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
