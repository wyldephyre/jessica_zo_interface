"use client";

import React, { FormEvent, useEffect, useRef } from "react";
import { useChatStore } from "../state/useChatStore";
import { ContextSwitcher } from "../components/ContextSwitcher";
import { TypingIndicator } from "../components/TypingIndicator";

export default function HomePage() {
  const { messages, input, isSending, setInput, sendMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-white flex flex-col">
      <header className="px-4 py-3 border-b border-neutral-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex flex-col">
            <span className="text-sm uppercase tracking-wide text-neutral-400">
              Jessica
            </span>
            <span className="text-lg font-semibold">Cognitive Interface</span>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-700/40 border border-emerald-500/60 text-emerald-200 whitespace-nowrap">
            Phase 1
          </span>
        </div>
        <ContextSwitcher />
      </header>

      <section className="flex-1 flex flex-col min-h-0">
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          role="log"
          aria-label="Chat history"
          aria-live="polite"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.sender === "jessica" ? "flex justify-start" : "flex justify-end"}
            >
              <div
                className={`max-w-[75%] px-3 py-2 text-sm rounded-2xl ${
                  msg.sender === "jessica"
                    ? "rounded-bl-sm bg-emerald-700"
                    : "rounded-br-sm bg-blue-600"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isSending && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <form
          className="border-t border-neutral-800 px-3 py-2 flex items-center gap-2"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="message-input">
            Type a message to Jessica
          </label>
          <input
            id="message-input"
            type="text"
            placeholder="Type a message to Jessica…"
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!input.trim() || isSending}
          >
            {isSending ? "..." : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}
