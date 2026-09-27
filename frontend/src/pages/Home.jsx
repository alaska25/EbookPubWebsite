import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/axios.js";
import HeroCarousel from "../components/HeroCarousel.jsx";
import BookCarousel from "../components/BookCarousel.jsx";
import Reveal from "../components/Reveal.jsx";
import LaunchCountdown from "../components/LaunchCountdown.jsx";
import TemplateShowcase from "../components/TemplateShowcase.jsx";

// Only icons + translation KEYS live here now — the actual title/description
// text comes from the active locale file via t().
const FEATURES = [
  {
    key: "quality",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    ),
  },
  {
    key: "readAnywhere",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    ),
  },
  {
    key: "securePurchase",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
  },
  {
    key: "instantAccess",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    ),
  },
];

// Mirrors FEATURES above, but scoped to what a developer actually cares
// about when evaluating a starter template rather than an ebook.
const TEMPLATE_FEATURES = [
  {
    key: "fullSource",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
      />
    ),
  },
  {
    key: "instantDownload",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    ),
  },
  {
    key: "preview",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
    ),
  },
  {
    key: "securePurchase",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
  },
];

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    api
      .get("/books", { params: { limit: 12 } })
      .then(({ data }) => setFeatured(data.books))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    <div>
      {/* Hero — stays as-is, it's above the fold so no reveal needed */}
      <HeroCarousel />

      {/* Launch countdown */}
      <Reveal>
        <LaunchCountdown
          launchDate="2026-10-15T09:00:00+09:00"
          liveUrl="https://adyoolau.vercel.app"
        />
      </Reveal>

      {/* Featured books */}
      {loading ? (
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-ivory/50">{t("common.loadingBooks")}</p>
        </div>
      ) : featured.length === 0 ? (
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-ivory/50">{t("common.noBooksYet")}</p>
        </div>
      ) : (
        <Reveal>
          <BookCarousel books={featured} />
        </Reveal>
      )}

      {/* Trust features — books */}
      <section className="border-t border-navy-700/60 bg-navy-900/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-12 md:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.key} delay={i * 100}>
              <div className="group h-full rounded-lg border border-navy-700/60 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/50 hover:bg-navy-900/60 hover:shadow-lg hover:shadow-navy-900/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                  className="mx-auto h-8 w-8 text-gold-400 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                >
                  {f.icon}
                </svg>
                <p className="mt-4 font-sans text-base font-semibold tracking-tight text-ivory">
                  {t(`features.${f.key}.title`)}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ivory/60">
                  {t(`features.${f.key}.description`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Templates for developers */}
      <TemplateShowcase />

      {/* Trust features — templates (mirrors the books strip above, own audience) */}
      <section className="border-t border-navy-700/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-12 md:grid-cols-4">
          {TEMPLATE_FEATURES.map((f, i) => (
            <Reveal key={f.key} delay={i * 100}>
              <div className="group h-full rounded-lg border border-navy-700/60 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/50 hover:bg-navy-900/60 hover:shadow-lg hover:shadow-navy-900/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                  className="mx-auto h-8 w-8 text-gold-400 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                >
                  {f.icon}
                </svg>
                <p className="mt-4 font-sans text-base font-semibold tracking-tight text-ivory">
                  {t(`templateFeatures.${f.key}.title`)}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ivory/60">
                  {t(`templateFeatures.${f.key}.description`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Newsletter — kept neutral so it lands for both readers and developers */}
      <section className="border-t border-navy-700/60">
        <Reveal className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-1.5 text-xs font-medium text-ivory/80">
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            {t("newsletter.badge")}
          </p>
          <h2 className="mt-5 font-sans text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-ivory [text-wrap:balance] sm:text-4xl">
            {t("newsletter.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ivory/70">
            {t("newsletter.subtitle")}
          </p>

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
        </Reveal>
      </section>
    </div>
  );
}