import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const EXIT_MS = 200;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal: portal, backdrop click + Escape to close, scroll lock,
 * focus trap, focus restored to the trigger on close. Bottom sheet on mobile,
 * centered card from the sm breakpoint up. Animations respect reduced motion.
 */
export default function Modal({ open, onClose, title, children }) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef(null);
  const titleId = useId();

  // Mount first, then flip `visible` after the initial state has painted so
  // the enter transition actually runs. On close, animate out, then unmount.
  useEffect(() => {
    if (open) {
      setMounted(true);
      let raf2;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);

  // Move focus into the dialog on open and back to the trigger on close.
  const active = open && mounted;
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement;
    dialogRef.current?.focus();
    return () => previous?.focus?.();
  }, [active]);

  // Escape to close, Tab trapped inside the dialog, page scroll locked.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = dialogRef.current?.querySelectorAll(FOCUSABLE);
      if (!items || items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (e.shiftKey && (current === first || current === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    // z-[60] sits above the chat widget (z-50)
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm motion-safe:transition-opacity motion-safe:duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-navy-700 bg-navy-900 shadow-2xl shadow-black/50 outline-none sm:max-w-2xl sm:rounded-lg motion-safe:transition motion-safe:duration-200 ${
          visible
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-4 opacity-0 sm:scale-95"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-navy-700/60 bg-navy-800 px-5 py-3">
          <h2 id={titleId} className="text-base font-semibold tracking-tight text-ivory">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ivory/50 hover:text-ivory"
          >
            ✕
          </button>
        </div>

        {/* min-h-0 lets this flex child shrink so only the content scrolls */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-sm text-ivory/80">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}