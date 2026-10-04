import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let scriptPromise = null;
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// onSuccess receives the same `data` shape login()/register() resolve with
// (see authResponse() on the backend: _id, name, email, role, photoUrl,
// token), so callers like LoginForm's handleAuthSuccess(data) can read
// data.role right away instead of getting undefined.
export default function GoogleLoginButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);
  const { googleLogin } = useAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Keep the latest callbacks in refs so the setup effect below doesn't
  // need them as dependencies. onSuccess/onError are re-created on every
  // render of the parent form (they're inline/non-memoized), so depending
  // on them directly caused this effect to tear down and re-run Google's
  // initialize()/renderButton() on every keystroke — which is what made
  // the sign-in button (and its account picker) appear to loop/refresh.
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    let cancelled = false;

    if (!clientId) {
      console.error(
        "VITE_GOOGLE_CLIENT_ID is not set — Google sign-in button will not render."
      );
      return;
    }

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              const data = await googleLogin(response.credential);
              onSuccessRef.current?.(data);
            } catch (err) {
              onErrorRef.current?.(err.response?.data?.message || "Could not sign in with Google.");
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
        });
      })
      .catch(() => {
        if (!cancelled) onErrorRef.current?.("Could not load Google sign-in. Please try again.");
      });

    return () => {
      cancelled = true;
    };
    // Only re-run if clientId or googleLogin actually change — not on
    // every parent re-render caused by unrelated state (email/password
    // input changes, etc.).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, googleLogin]);

  if (!clientId) return null;

  return <div ref={buttonRef} className="flex justify-center" />;
}