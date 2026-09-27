import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useBotGuard } from "../hooks/useBotGuard.js";
import HoneyPotField from "./HoneyPotField.jsx";

/**
 * Requests a reset email. No page chrome, so it can be dropped into a full
 * page (ForgotPassword.jsx) or into AuthModal.jsx.
 *
 * onBackToLogin: if provided, "Back to sign in" switches the modal back to
 *   login instead of navigating to /login.
 */
export default function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();
  const { honeypot, setHoneypot, isBot } = useBotGuard();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isBot()) {
      // Show the same success state a real request gets rather than
      // revealing a bot check exists.
      setSent(true);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ivory/80">
          If an account exists for <span className="text-ivory">{email}</span>, we've sent a
          link to reset your password.
        </p>
        {onBackToLogin ? (
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm text-gold-400 hover:text-gold-300"
          >
            Back to sign in
          </button>
        ) : (
          <Link to="/login" className="text-sm text-gold-400 hover:text-gold-300">
            Back to sign in
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <HoneyPotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

      <p className="text-sm text-ivory/60">
        Enter the email on your account and we'll send you a link to reset your password.
      </p>

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>

      {onBackToLogin ? (
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-ivory/50 hover:text-gold-400"
        >
          Back to sign in
        </button>
      ) : (
        <Link to="/login" className="text-sm text-ivory/50 hover:text-gold-400">
          Back to sign in
        </Link>
      )}
    </form>
  );
}