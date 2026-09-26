import { useNavigate } from "react-router-dom";

/**
 * Goes back one step when the visitor has in-app history; otherwise (they
 * opened this page directly, e.g. from a shared link or a new tab) goes to
 * `fallback` so the button never sends them off-site or does nothing.
 */
export default function BackButton({ fallback = "/", label = "Back", className = "" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // React Router stores a position counter in history.state; anything
    // above 0 means there is a previous page inside this app.
    const canGoBack = (window.history.state?.idx ?? 0) > 0;
    if (canGoBack) navigate(-1);
    else navigate(fallback);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-full py-1 pr-3 text-sm font-medium text-ivory/70 transition-colors hover:text-gold-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}