import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { InfoLink } from "./InfoModal.jsx";
// TIP: convert these to .webp (see scripts/compress-images.mjs) and change
// the extensions below, e.g. "./images/29342.webp".
import image29342 from "./images/29342.jpg";
import image29340 from "./images/29340.jpg";
import image29339 from "./images/29339.jpg";

// Slide copy comes from translation keys (heroCarousel.slide1/2/3.*);
// only the images and link targets stay hardcoded here.
const SLIDE_META = [
  {
    key: "slide1",
    primaryTo: "/catalog",
    secondaryTo: "/catalog?search=free",
    image: image29342,
    hasNote: false,
  },
  {
    key: "slide2",
    primaryTo: "/catalog",
    secondaryTo: "/refund-policy",
    image: image29339,
    hasNote: false,
  },
  {
    key: "slide3",
    primaryTo: "/catalog?search=free",
    secondaryTo: "/about",
    image: image29340,
    hasNote: true,
  },
];

const AUTO_ADVANCE_MS = 6500;

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";

// Arrows + dots. "overlay" sits on top of the mobile photo; "inline" is the
// desktop version below the text, using the site's theme colors.
// (backdrop-blur removed: it re-blurs every frame during the crossfade and
// is a common cause of stutter on phones and older laptops.)
function Controls({ index, count, onPrev, onNext, onGo, variant }) {
  const { t } = useTranslation();
  const overlay = variant === "overlay";

  const arrowClass = overlay
    ? "rounded-full p-2 text-white/90 hover:text-white"
    : "rounded-full border border-ivory/30 bg-ink/80 p-2 text-ivory/70 hover:border-gold-500 hover:text-gold-400";
  const dotOn = overlay ? "w-6 bg-white" : "w-6 bg-gold-500";
  const dotOff = overlay ? "w-2 bg-white/50" : "w-2 bg-ivory/30 group-hover:bg-ivory/50";

  return (
    <div
      className={
        overlay
          ? "flex items-center gap-1 rounded-full bg-black/55 px-1.5 text-white"
          : "flex items-center gap-4"
      }
    >
      <button onClick={onPrev} aria-label={t("heroCarousel.prevSlide")} className={`${arrowClass} ${FOCUS_RING}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-center">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            onClick={() => onGo(i)}
            aria-label={t("heroCarousel.goToSlide", { number: i + 1 })}
            aria-current={i === index}
            // Padding makes the tap target ~24px tall while the dot stays 8px
            className={`group rounded-full px-1 py-2 ${FOCUS_RING}`}
          >
            <span
              className={`block h-2 rounded-full transition-all ${i === index ? dotOn : dotOff}`}
            />
          </button>
        ))}
      </div>

      <button onClick={onNext} aria-label={t("heroCarousel.nextSlide")} className={`${arrowClass} ${FOCUS_RING}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// Renders the photo in full, uncropped, contained entirely within the box.
// The first slide loads eagerly with high priority (it's the page's LCP
// image); the others are lazy so they don't compete for bandwidth.
function SlideImage({ src, first }) {
  return (
    <img
      src={src}
      alt=""
      decoding="async"
      loading={first ? "eager" : "lazy"}
      fetchpriority={first ? "high" : "auto"}
      className="absolute inset-0 h-full w-full object-contain object-center bg-ink"
    />
  );
}

export default function HeroCarousel() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  // Build the full slide objects (translated text + static meta) on each
  // render so a language change immediately updates the copy.
  const SLIDES = SLIDE_META.map((meta) => ({
    ...meta,
    eyebrow: t(`heroCarousel.${meta.key}.eyebrow`),
    title: t(`heroCarousel.${meta.key}.title`),
    highlight: t(`heroCarousel.${meta.key}.highlight`),
    body: t(`heroCarousel.${meta.key}.body`),
    primaryCta: { label: t(`heroCarousel.${meta.key}.primaryCta`), to: meta.primaryTo },
    secondaryCta: { label: t(`heroCarousel.${meta.key}.secondaryCta`), to: meta.secondaryTo },
    note: meta.hasNote ? t(`heroCarousel.${meta.key}.note`) : null,
  }));

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDE_META.length);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduceMotion) return;

    timerRef.current = setInterval(() => {
      // Don't churn through slides in a background tab.
      if (!document.hidden) advance();
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [advance, index, paused]);

  const goTo = (i) => {
    const nextIndex = ((i % SLIDE_META.length) + SLIDE_META.length) % SLIDE_META.length;
    setIndex(nextIndex);
  };

  const controlProps = {
    index,
    count: SLIDES.length,
    onPrev: () => goTo(index - 1),
    onNext: () => goTo(index + 1),
    onGo: goTo,
  };

  return (
    // Pause autoplay while the pointer is over the hero or keyboard focus is
    // inside it (also an accessibility requirement for auto-moving content).
    <section
      className="relative min-h-[560px] overflow-hidden border-b border-navy-700/60 bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Full-bleed background image: desktop/tablet only (md and up). */}
      <div className="absolute inset-0 hidden md:block">
        {SLIDES.map((s, i) => (
          <div
            key={s.image}
            className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <SlideImage src={s.image} first={i === 0} />
          </div>
        ))}
        {/* Scrim is near-opaque under the text column so lettering baked into
            the photos can't show through the headline. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/20 pointer-events-none" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-12 pt-6 md:min-h-[560px] md:grid-cols-[1.2fr,1fr] md:py-20">
        <div>
          {/* MOBILE: photo first, with the arrows and dots overlaid on it. */}
          <div className="relative mb-6 h-56 overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 sm:h-72 md:hidden">
            {SLIDES.map((s, i) => (
              <div
                key={s.image}
                className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <SlideImage src={s.image} first={i === 0} />
              </div>
            ))}
            <div className="absolute inset-x-0 bottom-3 flex justify-center">
              <Controls {...controlProps} variant="overlay" />
            </div>
          </div>

          {/* All slides share ONE grid cell, so this block is always as tall
              as the tallest slide and nothing below the carousel moves.
              Inactive slides are `invisible`, which also removes their links
              from the tab order and from screen readers. */}
          <div className="grid">
            {SLIDES.map((s, i) => {
              const isActive = i === index;
              // Only the first slide is the page's h1; the rest are h2s
              const Heading = i === 0 ? "h1" : "h2";

              return (
                <div
                  key={s.key}
                  className={`col-start-1 row-start-1 transition-[opacity,visibility,transform] duration-500 motion-reduce:transition-none ${
                    isActive
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-2 opacity-0"
                  }`}
                >
                  {/* Eyebrow: rounded-3xl (not -full) so a wrapped two-line
                      label on phones doesn't turn into a blob */}
                  <p className="inline-flex max-w-full items-center gap-2 rounded-3xl border border-ivory/15 bg-ivory/5 px-3 py-1.5 text-xs font-medium text-ivory/80">
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    {s.eyebrow}
                  </p>

                  <Heading className="mt-4 font-sans text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-ivory [text-wrap:balance] sm:text-5xl md:mt-5 md:text-6xl">
                    {s.title} {s.highlight}
                  </Heading>

                  <p className="mt-4 max-w-[34rem] text-base leading-relaxed text-ivory/75 md:mt-6 md:text-lg">
                    {s.body}
                  </p>

                  {/* Full-width stacked buttons on phones, inline from sm up */}
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-8">
                    <InfoLink
                      to={s.primaryCta.to}
                      className={`w-full rounded-full bg-gold-500 px-6 py-3 text-center text-sm font-semibold text-ink shadow-lg shadow-gold-500/20 transition hover:bg-gold-400 active:scale-[0.98] sm:w-auto ${FOCUS_RING}`}
                    >
                      {s.primaryCta.label}
                    </InfoLink>
                    <InfoLink
                      to={s.secondaryCta.to}
                      className={`w-full rounded-full border border-ivory/25 px-6 py-3 text-center text-sm font-semibold text-ivory/90 transition hover:border-gold-500 hover:text-gold-400 active:scale-[0.98] sm:w-auto ${FOCUS_RING}`}
                    >
                      {s.secondaryCta.label}
                    </InfoLink>
                  </div>

                  {s.note && <p className="mt-4 text-sm text-ivory/60">{s.note}</p>}
                </div>
              );
            })}
          </div>

          {/* DESKTOP: arrows + dots below the text */}
          <div className="mt-10 hidden md:block">
            <Controls {...controlProps} variant="inline" />
          </div>
        </div>
      </div>
    </section>
  );
}