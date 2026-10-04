import { useEffect, useState } from "react";
import { subscribe, dismissToast } from "../utils/toastStore.js";

const STYLES = {
  success: "border-[#22c55e]/40 bg-[#22c55e]/10 text-ivory",
  error: "border-red-500/40 bg-red-500/10 text-ivory",
  info: "border-navy-700/60 bg-navy-900/80 text-ivory",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => subscribe(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[9999] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${
            STYLES[t.type] || STYLES.info
          }`}
        >
          <span>{t.message}</span>
          <button
            onClick={() => dismissToast(t.id)}
            className="shrink-0 text-ivory/40 hover:text-ivory"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}