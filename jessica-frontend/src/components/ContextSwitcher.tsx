"use client";

import { useChatStore } from "@/state/useChatStore";

const contexts = [
  { id: "personal", label: "Personal", icon: "👤", description: "Calendar, health, journaling" },
  { id: "business", label: "Business", icon: "💼", description: "Standard business operations" },
  { id: "creative", label: "Creative", icon: "✨", description: "Nexus Arcanum worldbuilding" },
] as const;

type ContextId = (typeof contexts)[number]["id"];

export function ContextSwitcher() {
  const contextMode = useChatStore((state) => state.contextMode);
  const setContextMode = useChatStore((state) => state.setContextMode);

  return (
    <div className="flex gap-1 p-1 bg-neutral-800 rounded-lg" role="tablist" aria-label="Context mode">
      {contexts.map((ctx) => (
        <button
          key={ctx.id}
          role="tab"
          aria-selected={contextMode === ctx.id}
          onClick={() => setContextMode(ctx.id as ContextId)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
            contextMode === ctx.id
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-neutral-400 hover:text-white hover:bg-neutral-700"
          }`}
          title={ctx.description}
        >
          <span className="text-xs">{ctx.icon}</span>
          <span className="hidden sm:inline">{ctx.label}</span>
        </button>
      ))}
    </div>
  );
}
