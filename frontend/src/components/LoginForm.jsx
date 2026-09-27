import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useBotGuard } from "../hooks/useBotGuard.js";
import HoneyPotField from "./HoneyPotField.jsx";
import PasswordInput from "./PasswordInput.jsx";
import GoogleLoginButton from "./GoogleLoginButton.jsx";

/**
 * The sign-in form itself, with no page chrome around it, so it can be
 * dropped into a full page (Login.jsx) or into AuthModal.jsx.
 *
 * onSuccess: called right after a successful login (e.g. to close the modal)
 * onSwitchToRegister / onSwitchToForgot: if provided, those links switch the
 *   modal to that mode instead of navigating to a separate page.
 */
export default function LoginForm({ onSuccess, onSwitchToRegister, onSwitchToForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { honeypot, setHoneypot, isBot } = useBotGuard();

  // Shared by both the email/password flow and the Google flow, so a
  // successful sign-in behaves identically no matter which one was used.
  const handleAuthSuccess = (data) => {
    onSuccess?.();

    if (location.state?.from) {
      navigate(location.state.from);
    } else if (data.role === "superadmin") {
      navigate("/admin/dashboard");
    } else if (data.role === "admin") {
      navigate("/admin/books");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isBot()) {
      // Fail with a generic message rather than revealing a bot check exists.
      setError("Could not sign in. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      handleAuthSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <GoogleLoginButton onSuccess={handleAuthSuccess} onError={setError} />

      <div className="flex items-center gap-3 text-xs text-ivory/40">
        <div className="h-px flex-1 bg-navy-700" />
        or sign in with email
        <div className="h-px flex-1 bg-navy-700" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <HoneyPotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

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

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <div className="flex justify-end">
          {onSwitchToForgot ? (
            <button
              type="button"
              onClick={onSwitchToForgot}
              className="text-xs text-ivory/50 hover:text-gold-400"
            >
              Forgot password?
            </button>
          ) : (
            <Link to="/forgot-password" className="text-xs text-ivory/50 hover:text-gold-400">
              Forgot password?
            </Link>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-sm text-ivory/50">
          Don't have an account?{" "}
          {onSwitchToRegister ? (
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-gold-400 hover:text-gold-300"
            >
              Create one
            </button>
          ) : (
            <Link to="/register" className="text-gold-400 hover:text-gold-300">
              Create one
            </Link>
          )}
        </p>
      </form>
    </div>
  );
}