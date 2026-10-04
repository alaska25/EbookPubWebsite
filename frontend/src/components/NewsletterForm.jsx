import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/axios.js";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";

// Owns the email state so typing only re-renders this small component,
// not the whole homepage (carousels, cards, etc.).
export default function NewsletterForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setSubStatus("");
    try {
      const { data } = await api.post("/newsletter/subscribe", { email: email.trim() });
      setSubStatus(data.message);
      setEmail("");
    } catch (err) {
      setSubStatus(err.response?.data?.message || t("newsletter.error"));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubscribe}
        className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newsletter.placeholder")}
          aria-label={t("newsletter.emailAriaLabel")}
          className={`flex-1 rounded-full border border-navy-700 bg-navy-900 px-5 py-3 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500 ${FOCUS_RING}`}
        />
        <button
          type="submit"
          disabled={subscribing}
          className={`rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-ink shadow-lg shadow-gold-500/20 transition hover:bg-gold-400 active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-gold-500 ${FOCUS_RING}`}
        >
          {subscribing ? t("newsletter.subscribing") : t("newsletter.subscribe")}
        </button>
      </form>

      <p role="status" className="mt-4 min-h-5 text-sm text-gold-400">
        {subStatus}
      </p>
    </>
  );
}