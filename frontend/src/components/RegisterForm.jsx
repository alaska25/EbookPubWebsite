import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import { useAuth } from "../context/AuthContext.jsx";
import { useBotGuard } from "../hooks/useBotGuard.js";
import HoneyPotField from "./HoneyPotField.jsx";
import PasswordInput from "./PasswordInput.jsx";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

/**
 * The registration form itself, with no page chrome around it, so it can be
 * dropped into a full page (Register.jsx) or into AuthModal.jsx.
 *
 * onSuccess: called right after a successful registration (e.g. to close
 *   the modal)
 * onSwitchToLogin: if provided, "Sign in" opens the login modal instead of
 *   navigating to /login.
 */
export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const turnstileRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { honeypot, setHoneypot, isBot } = useBotGuard();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isBot()) {
      setError("Could not create account. Please try again.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the captcha.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, captchaToken);
      onSuccess?.();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account.");
      // Tokens are single-use — reset the widget so they can retry.
      turnstileRef.current?.reset();
      setCaptchaToken("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <HoneyPotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="Juan Dela Cruz"
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory placeholder:text-ivory/30 focus:border-gold-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory placeholder:text-ivory/30 focus:border-gold-500"
        />
      </div>

      <PasswordInput
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        autoComplete="new-password"
        helperText="At least 6 characters"
      />

      <PasswordInput
        label="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength={6}
        autoComplete="new-password"
        status={confirmPassword ? (confirmPassword === password ? "match" : "mismatch") : undefined}
      />

      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={setCaptchaToken}
        onExpire={() => setCaptchaToken("")}
        onError={() => setCaptchaToken("")}
        options={{ theme: "dark" }}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading || !captchaToken}
        className="w-full rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-sm text-ivory/50">
        Already have an account?{" "}
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-gold-400 hover:text-gold-300"
          >
            Sign in
          </button>
        ) : (
          <Link to="/login" className="text-gold-400 hover:text-gold-300">
            Sign in
          </Link>
        )}
      </p>
    </form>
  );
}