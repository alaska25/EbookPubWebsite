import { useEffect, useState } from "react";

/**
 * LaunchCountdown
 *
 * Matches Adyoolau's navy/gold/ivory design system.
 *
 * Usage (drop into Home.jsx or its own route):
 *   <LaunchCountdown
 *     launchDate="2026-10-15T09:00:00+09:00"
 *     liveUrl="https://adyoolau.vercel.app"
 *   />
 *
 * - launchDate: ISO string, include a timezone offset so it's unambiguous
 *   for every visitor regardless of where they are.
 * - liveUrl: optional — shown as a "preview" link during the countdown and
 *   as the main CTA once time is up.
 * - onLaunch: optional callback fired once when the countdown reaches zero.
 */

function getTimeLeft(launchDate) {
  const diff = new Date(launchDate).getTime() - Date.now();
  const clamped = Math.max(diff, 0);
  return {
    total: clamped,
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
}

function TimeBlock({ value, label }) {
  return (
    <div className="min-w-[76px] rounded-lg border border-navy-700/60 bg-navy-900/60 px-5 py-4 text-center">
      <div className="font-sans text-3xl font-bold tabular-nums text-ivory">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-ivory/55">
        {label}
      </div>
    </div>
  );
}

export default function LaunchCountdown({
  launchDate,
  liveUrl,
  onLaunch,
  title = "Something new is coming",
  subtitle = "Adyoolau is getting an upgrade. Here's when it drops.",
}) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(launchDate));
  const [firedLaunch, setFiredLaunch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeLeft(launchDate);
      setTimeLeft(t);
      if (t.total === 0 && !firedLaunch) {
        setFiredLaunch(true);
        if (onLaunch) onLaunch();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [launchDate, onLaunch, firedLaunch]);

  const launched = timeLeft.total === 0;

  return (
    <section className="border-t border-navy-700/60 bg-navy-900/40">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        {launched ? (
          <>
            <h2 className="font-sans text-3xl font-bold tracking-[-0.03em] text-ivory sm:text-4xl">
              We're live!
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ivory/70">
              Adyoolau has officially launched.
            </p>
            {liveUrl && (
              <a
                href={liveUrl}
                className="mt-8 inline-block rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-ink shadow-lg shadow-gold-500/20 transition hover:bg-gold-400 active:scale-[0.98]"
              >
                Visit the site →
              </a>
            )}
          </>
        ) : (
          <>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-xs font-medium text-ivory/80">
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-400" />
              </span>
              Launching Soon
            </p>
            <h2 className="mt-5 font-sans text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-ivory [text-wrap:balance] sm:text-4xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ivory/70">
              {subtitle}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <TimeBlock value={timeLeft.days} label="Days" />
              <TimeBlock value={timeLeft.hours} label="Hours" />
              <TimeBlock value={timeLeft.minutes} label="Minutes" />
              <TimeBlock value={timeLeft.seconds} label="Seconds" />
            </div>

            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block text-sm text-gold-400 hover:text-gold-300"
              >
                Preview the live site →
              </a>
            )}
          </>
        )}
      </div>
    </section>
  );
}