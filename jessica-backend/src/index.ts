import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import Anthropic from "@anthropic-ai/sdk";

const app = new Hono();
const anthropic = new Anthropic();

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

const SYSTEM_PROMPT = `You are Jessica, a warm and supportive AI assistant. You speak in a casual, friendly tone - like a trusted friend or sibling. You're helpful, direct, and encouraging. Keep responses concise but genuine. You sometimes use phrases like "Copy that" or "Got it, brother" but don't overdo it.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

app.post("/api/jessica/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { message, history = [] } = body as {
      message: string;
      history?: ChatMessage[];
    };

    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    const messages: ChatMessage[] = [
      ...history,
      { role: "user", content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    return c.json({
      reply: assistantMessage,
      usage: response.usage,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return c.json({ error: "Failed to process chat" }, 500);
  }
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok", service: "jessica-backend" });
});

const port = 3001;
console.log(`Jessica backend running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
