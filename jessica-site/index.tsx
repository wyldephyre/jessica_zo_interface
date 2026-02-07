import { Hono } from "hono";
import { serveStatic } from "hono/bun";

const app = new Hono();

// ---------------------------------------------------------------------------
// Static files from /public
// ---------------------------------------------------------------------------
app.use("/public/*", serveStatic({ root: "./" }));

// ---------------------------------------------------------------------------
// POST /chat  –  proxy to Zo AI backend
// ---------------------------------------------------------------------------
app.post("/chat", async (c) => {
  const { message, context, history } = await c.req.json();

  const apiKey = process.env.ZO_API_KEY || "";
  const apiUrl =
    process.env.ZO_API_URL || "https://api.zo.computer/zo/ask";

  if (!apiKey) {
    console.error("Chat API error: ZO_API_KEY environment variable is not set");
    return c.json({ error: "Server configuration error: missing API key" }, 500);
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ message, context, history }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Zo API error:", response.status, errorText);
      return c.json(
        { error: `Zo API error: ${response.status}` },
        { status: response.status as any }
      );
    }

    const data: any = await response.json();

    return c.json({
      reply: data.reply || data.response || data.message || data.content,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return c.json({ error: "Failed to process chat request" }, 500);
  }
});

// ---------------------------------------------------------------------------
// GET /  –  Server-rendered chat UI
// ---------------------------------------------------------------------------
app.get("/", (c) => {
  return c.html(/* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Jessica – Cognitive Interface</title>

  <!-- Tailwind CDN (Play) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Google Fonts – Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />

  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; margin: 0; }

    /* Slim custom scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #525252; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #737373; }

    /* Bounce animation for typing dots */
    @keyframes bounce-dot {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .dot-bounce { animation: bounce-dot 600ms ease-in-out infinite; }
  </style>
</head>

<body class="bg-neutral-900 text-white">
  <main class="h-screen flex flex-col">

    <!-- ===== Header ===== -->
    <header class="px-4 py-3 border-b border-neutral-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
      <div class="flex items-center justify-between sm:justify-start gap-4">
        <div class="flex flex-col">
          <span class="text-sm uppercase tracking-wide text-neutral-400">Jessica</span>
          <span class="text-lg font-semibold">Cognitive Interface</span>
        </div>
        <span class="text-xs px-2 py-1 rounded-full bg-emerald-700/40 border border-emerald-500/60 text-emerald-200 whitespace-nowrap">
          Phase 1
        </span>
      </div>

      <!-- Context Switcher -->
      <div id="context-switcher" class="flex gap-1 p-1 bg-neutral-800 rounded-lg" role="tablist" aria-label="Context mode">
        <button
          role="tab" aria-selected="true" data-context="personal"
          class="context-btn px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 bg-emerald-600 text-white shadow-sm"
          title="Calendar, health, journaling"
        >
          <span class="text-xs">👤</span><span class="hidden sm:inline">Personal</span>
        </button>
        <button
          role="tab" aria-selected="false" data-context="business"
          class="context-btn px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700"
          title="Standard business operations"
        >
          <span class="text-xs">💼</span><span class="hidden sm:inline">Business</span>
        </button>
        <button
          role="tab" aria-selected="false" data-context="creative"
          class="context-btn px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700"
          title="Nexus Arcanum worldbuilding"
        >
          <span class="text-xs">✨</span><span class="hidden sm:inline">Creative</span>
        </button>
      </div>
    </header>

    <!-- ===== Chat Messages ===== -->
    <section class="flex-1 flex flex-col min-h-0">
      <div
        id="messages-container"
        class="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        role="log"
        aria-label="Chat history"
        aria-live="polite"
      >
        <!-- Server-rendered initial message -->
        <div class="flex justify-start">
          <div class="max-w-[75%] px-3 py-2 text-sm rounded-2xl rounded-bl-sm bg-emerald-700 whitespace-pre-wrap">Hey brother, I'm Jessica. I'm connected to Zo Computer now – I remember our context and can help you one step at a time.</div>
        </div>

        <!-- Typing indicator (hidden by default) -->
        <div id="typing-indicator" class="justify-start" style="display:none;">
          <div class="bg-emerald-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
            <span class="w-2 h-2 bg-emerald-300 rounded-full dot-bounce" style="animation-delay:0ms;"></span>
            <span class="w-2 h-2 bg-emerald-300 rounded-full dot-bounce" style="animation-delay:150ms;"></span>
            <span class="w-2 h-2 bg-emerald-300 rounded-full dot-bounce" style="animation-delay:300ms;"></span>
          </div>
        </div>

        <!-- Invisible anchor for auto-scroll -->
        <div id="scroll-anchor"></div>
      </div>

      <!-- ===== Input Form ===== -->
      <form id="message-form" class="border-t border-neutral-800 px-3 py-2 flex items-center gap-2 shrink-0">
        <label class="sr-only" for="message-input">Type a message to Jessica</label>
        <input
          id="message-input"
          type="text"
          placeholder="Type a message to Jessica…"
          class="flex-1 bg-neutral-800 border border-neutral-700 rounded-full px-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          autocomplete="off"
        />
        <button
          id="send-button"
          type="submit"
          class="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >Send</button>
      </form>
    </section>

  </main>

  <!-- Client-side interactivity -->
  <script src="/public/app.js"></script>
</body>
</html>`);
});

// ---------------------------------------------------------------------------
// Export for Bun / Zo Computer
// ---------------------------------------------------------------------------
export default app;
