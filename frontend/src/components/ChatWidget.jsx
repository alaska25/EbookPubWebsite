import { useEffect, useRef, useState } from "react";
import api from "../api/axios.js";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm here to help with questions about orders, refunds, or how Adyoolau works. What can I help with?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  // Tracks the visible viewport height on mobile so the panel can shrink to
  // sit above the on-screen keyboard instead of being covered by it. Falls
  // back to null (no override) on browsers without the visualViewport API.
  const [viewportHeight, setViewportHeight] = useState(null);
  // Fallback for in-app browsers (e.g. Messenger's WebView) that don't report
  // the keyboard at all: when the input is focused and nothing shrank, cap
  // the panel to the top half of the screen so the input stays visible.
  const [compact, setCompact] = useState(false);
  const baseHeightRef = useRef(0); // full window height before any keyboard
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, compact, viewportHeight]);

  // Keep the panel's height in sync with the actual visible viewport while
  // it's open, so opening the keyboard shrinks the panel (keeping the input
  // in view) instead of the keyboard just covering the bottom of a
  // fixed-size box. This only matters on mobile, where the floating-card
  // layout below is replaced by a full-screen one anyway.
  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    // Remember the height before any keyboard appears.
    baseHeightRef.current = window.innerHeight;

    if (!window.visualViewport) return;

    const vv = window.visualViewport;
    const updateHeight = () => setViewportHeight(vv.height);

    updateHeight();
    vv.addEventListener("resize", updateHeight);
    vv.addEventListener("scroll", updateHeight);
    return () => {
      vv.removeEventListener("resize", updateHeight);
      vv.removeEventListener("scroll", updateHeight);
    };
  }, [open]);

  // Lock the page's own scroll while the chat is open. On mobile the panel
  // is fixed but can be shorter than the full screen (see the backdrop note
  // below); without this the body behind it can still scroll, which made the
  // footer visibly shift/"float" while chatting.
  useEffect(() => {
    if (!open || typeof document === "undefined") return;

    const { body } = document;
    const scrollY = window.scrollY;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;
    const prevOverflow = body.style.overflow;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      body.style.overflow = prevOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const handleFocus = () => {
    // Give the browser a moment to react to the keyboard, then check whether
    // it actually shrank anything. If not, switch to the compact fallback.
    setTimeout(() => {
      const base = baseHeightRef.current;
      const visible = window.visualViewport?.height ?? window.innerHeight;
      const keyboardDetected =
        visible < base - 100 || window.innerHeight < base - 100;
      setCompact(!keyboardDetected && window.innerWidth < 640);
    }, 400);
  };

  const handleBlur = () => setCompact(false);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setError("");
    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const { data } = await api.post("/support/chat", {
        message: trimmed,
        history: nextMessages.slice(-13, -1), // exclude the just-added user message, it's sent separately
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // In compact mode use ~half the screen (keyboards usually take 35-45%).
  // Otherwise use the live visualViewport height, if we have one.
  const panelHeight = compact
    ? Math.round(baseHeightRef.current * 0.5)
    : viewportHeight;

  return (
    <>
      {open && (
        <>
          {/* Full-screen backdrop, always covers the whole viewport on mobile
              even when the panel itself is shrunk to half-height in compact
              mode. Without this, the page behind (including the footer) was
              visible/could shift in the gap below the panel. Hidden on
              desktop (sm:hidden) since the panel is a small floating card
              there and doesn't need a backdrop. */}
          <div className="fixed inset-0 z-40 bg-navy-900 sm:hidden" aria-hidden="true" />

          <div
            // Height comes from the --chat-h CSS variable on mobile (live
            // visualViewport height, the compact fallback, or 100dvh). From the
            // sm breakpoint up, sm:h-[28rem] takes over. Setting `height` as an
            // inline style would override that class on desktop and push the
            // top of the panel off-screen, so only the variable is set inline.
            className="fixed inset-0 z-50 flex h-[var(--chat-h,100dvh)] flex-col bg-navy-900 sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[28rem] sm:w-96 sm:overflow-hidden sm:rounded-lg sm:border sm:border-navy-700 sm:shadow-2xl sm:shadow-black/50"
            style={panelHeight ? { "--chat-h": `${panelHeight}px` } : undefined}
          >
            <div className="flex items-center justify-between border-b border-navy-700/60 bg-navy-800 px-4 py-3">
              <p className="font-display text-sm text-ivory">Adyoolau Support</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-ivory/50 hover:text-ivory"
              >
                ✕
              </button>
            </div>

            {/* min-h-0 lets this flex child shrink so only the message list scrolls */}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-gold-500 text-ink"
                      : "bg-navy-800 text-ivory/80"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {sending && (
                <div className="max-w-[85%] rounded-lg bg-navy-800 px-3 py-2 text-sm text-ivory/40">
                  Typing…
                </div>
              )}
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="shrink-0 border-t border-navy-700/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Ask a question…"
                  className="flex-1 rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
                />
                <button
                  type="submit"
                  // Keeps focus in the input when tapping Send, so the keyboard
                  // stays open and the panel doesn't resize mid-tap.
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={sending || !input.trim()}
                  className="rounded-full bg-gold-500 px-4 py-2 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        // On mobile the panel is full-screen and its header already has a
        // close (✕) button right where this one used to overlap the input
        // bar, so this floating button hides there while open. On desktop
        // the panel leaves room below it (sm:bottom-24), so it stays put.
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-ink shadow-lg shadow-black/40 hover:bg-gold-400 ${
          open ? "hidden sm:flex" : "flex"
        }`}
      >
        {open ? (
          <span className="text-2xl leading-none">✕</span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </>
  );
}