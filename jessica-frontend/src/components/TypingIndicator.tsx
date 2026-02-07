"use client";

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-emerald-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        <span
          className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "600ms" }}
        />
        <span
          className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce"
          style={{ animationDelay: "150ms", animationDuration: "600ms" }}
        />
        <span
          className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce"
          style={{ animationDelay: "300ms", animationDuration: "600ms" }}
        />
      </div>
    </div>
  );
}
