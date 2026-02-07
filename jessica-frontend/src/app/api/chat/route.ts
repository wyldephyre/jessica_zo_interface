import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, context, history } = await request.json();

    const apiKey = process.env.ZO_API_KEY;
    const apiUrl = process.env.ZO_API_URL;

    if (!apiKey || !apiUrl) {
      console.error("Missing ZO_API_KEY or ZO_API_URL environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        message,
        context,
        history,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Zo API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Zo API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the response - adjust field name based on actual Zo API response structure
    return NextResponse.json({
      reply: data.reply || data.response || data.message || data.content,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
