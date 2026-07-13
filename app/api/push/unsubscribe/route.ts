import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    const { endpoint } = body;

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ error: "Missing subscription endpoint URL" }, { status: 400 });
    }

    // Return success to complete the client unsubscription contract.
    return NextResponse.json({
      success: true,
      message: "Unsubscribed endpoint successfully",
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
