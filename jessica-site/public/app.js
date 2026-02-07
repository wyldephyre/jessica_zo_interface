/**
 * Jessica – Cognitive Interface
 * Client-side vanilla JavaScript for chat interactivity.
 * Manages state, DOM updates, API calls, context switching,
 * typing indicator, and auto-scroll.
 */
(function () {
  "use strict";

  // =========================================================================
  // State
  // =========================================================================
  const state = {
    messages: [
      {
        id: "1",
        sender: "jessica",
        content:
          "Hey brother, I'm Jessica. I'm connected to Zo Computer now – I remember our context and can help you one step at a time.",
      },
    ],
    isSending: false,
    contextMode: "personal",
  };

  // =========================================================================
  // DOM References
  // =========================================================================
  const messagesContainer = document.getElementById("messages-container");
  const typingIndicator = document.getElementById("typing-indicator");
  const scrollAnchor = document.getElementById("scroll-anchor");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const contextButtons = document.querySelectorAll(".context-btn");

  // =========================================================================
  // Helpers
  // =========================================================================

  /** Scroll the chat to the very bottom. */
  function scrollToBottom() {
    requestAnimationFrame(function () {
      scrollAnchor.scrollIntoView({ behavior: "smooth" });
    });
  }

  /** Enable / disable the send button and input based on current state. */
  function updateSendState() {
    var hasInput = messageInput.value.trim().length > 0;
    sendButton.disabled = !hasInput || state.isSending;
    messageInput.disabled = state.isSending;
    sendButton.textContent = state.isSending ? "…" : "Send";
  }

  /** Show the bouncing-dots typing indicator. */
  function showTyping() {
    typingIndicator.style.display = "flex";
    scrollToBottom();
  }

  /** Hide the typing indicator. */
  function hideTyping() {
    typingIndicator.style.display = "none";
  }

  // =========================================================================
  // Message Rendering
  // =========================================================================

  /**
   * Create a message bubble element and append it to the chat.
   * Also pushes the message into `state.messages` for history tracking.
   */
  function appendMessage(sender, content) {
    var msg = {
      id: String(Date.now()),
      sender: sender,
      content: content,
    };
    state.messages.push(msg);

    var wrapper = document.createElement("div");
    wrapper.className =
      sender === "jessica" ? "flex justify-start" : "flex justify-end";

    var bubble = document.createElement("div");
    bubble.className =
      "max-w-[75%] px-3 py-2 text-sm rounded-2xl whitespace-pre-wrap " +
      (sender === "jessica"
        ? "rounded-bl-sm bg-emerald-700"
        : "rounded-br-sm bg-blue-600");

    // Use textContent to avoid XSS; whitespace-pre-wrap preserves newlines.
    bubble.textContent = content;

    wrapper.appendChild(bubble);

    // Insert the new message before the typing indicator so it stays in order.
    messagesContainer.insertBefore(wrapper, typingIndicator);

    scrollToBottom();
  }

  // =========================================================================
  // Context Switcher
  // =========================================================================
  var ACTIVE_CLASSES =
    "context-btn px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 bg-emerald-600 text-white shadow-sm";
  var INACTIVE_CLASSES =
    "context-btn px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700";

  contextButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-context");
      state.contextMode = mode;

      contextButtons.forEach(function (b) {
        var isActive = b.getAttribute("data-context") === mode;
        b.setAttribute("aria-selected", isActive ? "true" : "false");
        b.className = isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES;
      });
    });
  });

  // =========================================================================
  // Send Message
  // =========================================================================
  async function sendMessage() {
    var text = messageInput.value.trim();
    if (!text || state.isSending) return;

    // Build history BEFORE appending the new message (matches original behavior).
    var history = state.messages
      .filter(function (m) {
        return m.id !== "1";
      })
      .map(function (m) {
        return {
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content,
        };
      });

    // Update UI immediately
    state.isSending = true;
    messageInput.value = "";
    updateSendState();

    appendMessage("user", text);
    showTyping();

    try {
      var response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: state.contextMode,
          history: history,
        }),
      });

      if (!response.ok) {
        var errorData = await response.json().catch(function () {
          return {};
        });
        throw new Error(
          errorData.error || "Request failed with status " + response.status
        );
      }

      var data = await response.json();
      appendMessage("jessica", data.reply);
    } catch (error) {
      console.error("Chat error:", error);
      appendMessage(
        "jessica",
        "Sorry brother, I ran into an issue: " +
          error.message +
          ". Check your connection and try again."
      );
    } finally {
      state.isSending = false;
      hideTyping();
      updateSendState();
      messageInput.focus();
    }
  }

  // =========================================================================
  // Event Listeners
  // =========================================================================
  messageForm.addEventListener("submit", function (e) {
    e.preventDefault();
    sendMessage();
  });

  messageInput.addEventListener("input", function () {
    updateSendState();
  });

  // Allow Ctrl+Enter or Enter to send (Enter sends by default via form submit)
  messageInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      // Default form submit handles this; nothing extra needed.
    }
  });

  // =========================================================================
  // Initialize
  // =========================================================================
  updateSendState();
  messageInput.focus();
  scrollToBottom();
})();
