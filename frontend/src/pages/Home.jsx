import { useEffect, useState } from "react";
import api from "../api/axios.js";
import HeroCarousel from "../components/HeroCarousel.jsx";
import BookCarousel from "../components/BookCarousel.jsx";
import Reveal from "../components/Reveal.jsx";
import LaunchCountdown from "../components/LaunchCountdown.jsx";

const FEATURES = [
  {
    title: "High-Quality Content",
    description: "Well-researched and professionally written ebooks.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    ),
  },
  {
    title: "Read Anywhere",
    description: "On your device, anytime, anywhere.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    ),
  },
  {
    title: "Secure Purchase",
    description: "Safe and reliable payment methods.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
  },
  {
    title: "Instant Access",
    description: "Get your book immediately after purchase.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    ),
  },
];

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";

export default function Home() {
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
      setSubStatus(err.response?.data?.message || "Something went wrong. Please try again.");
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
          <p className="text-ivory/50">Loading books…</p>
        </div>
      ) : featured.length === 0 ? (
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-ivory/50">No books yet — check back soon.</p>
        </div>
      ) : (
        <Reveal>
          <BookCarousel books={featured} />
        </Reveal>
      )}

      {/* Trust features */}
      <section className="border-t border-navy-700/60 bg-navy-900/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-12 md:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
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
                  {f.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ivory/60">{f.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-navy-700/60">
        <Reveal className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-1.5 text-xs font-medium text-ivory/80">
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            Stay updated
          </p>
          <h2 className="mt-5 font-sans text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-ivory [text-wrap:balance] sm:text-4xl">
            Get the latest books and offers
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ivory/70">
            Subscribe to our newsletter and be the first to know about new
            releases, exclusive deals, and special offers from Adyoolau.
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
              placeholder="Enter your email address"
              aria-label="Email address"
              className={`flex-1 rounded-full border border-navy-700 bg-navy-900 px-5 py-3 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500 ${FOCUS_RING}`}
            />
            <button
              type="submit"
              disabled={subscribing}
              className={`rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-ink shadow-lg shadow-gold-500/20 transition hover:bg-gold-400 active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-gold-500 ${FOCUS_RING}`}
            >
              {subscribing ? "Subscribing…" : "Subscribe"}
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