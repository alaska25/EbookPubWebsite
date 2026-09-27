import { useCallback, useRef, useState } from "react";

// Decoy field name real users never see or fill; bots that auto-fill every
// input on a form tend to fill this too.
export const HONEYPOT_NAME = "website";

// Real humans take at least this long to read and fill a short form;
// scripted submissions are usually near-instant.
const MIN_SUBMIT_MS = 1500;

/**
 * Lightweight, no-dependency bot check: a hidden honeypot field plus a
 * minimum time-on-form check. Not a hard guarantee against bots, but stops
 * the large majority of naive scripted/automated submissions with no
 * external service or API key.
 *
 * Usage: render <HoneypotField value={honeypot} onChange={...} /> inside the
 * form, then call isBot() in your submit handler before hitting the API.
 */
export function useBotGuard() {
  const mountedAt = useRef(Date.now());
  const [honeypot, setHoneypot] = useState("");

  const isBot = useCallback(() => {
    if (honeypot !== "") return true;
    if (Date.now() - mountedAt.current < MIN_SUBMIT_MS) return true;
    return false;
  }, [honeypot]);

  return { honeypot, setHoneypot, isBot };
}