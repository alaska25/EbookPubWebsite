import { useEffect, useState, useCallback, useRef } from "react";
import { InfoLink } from "./InfoModal.jsx";
import image29342 from "./images/29342.jpg";
import image29340 from "./images/29340.jpg";
import image29339 from "./images/29339.jpg";

const SLIDES = [
  {
    eyebrow: "Digital Products • Ebooks • Templates • Tools",
    title: "A library that fits in your",
    highlight: "pocket.",
    body: "Adyoolau brings together fiction, nonfiction, and reference titles you can buy once and read anywhere — in the browser or downloaded for offline reading.",
    primaryCta: { label: "Browse the Catalog", to: "/catalog" },
    secondaryCta: { label: "Start with a Free Title", to: "/catalog?search=free" },
    image: image29342,
  },
  {
    eyebrow: "No Subscriptions",
    title: "Buy once,",
    highlight: "keep forever.",
    body: "Every book is yours after purchase — no expiring licenses, no recurring fees. Download a copy to keep, or read it in the browser whenever you like.",
    primaryCta: { label: "Browse the Catalog", to: "/catalog" },
    secondaryCta: { label: "See our Refund Policy", to: "/refund-policy" },
    image: image29339,
  },
  {
    eyebrow: "New Here?",
    title: "Try a title,",
    highlight: "on us.",
    body: "Not ready to commit? A handful of our titles are completely free to claim — a low-risk way to see what Adyoolau is about before you buy.",
    primaryCta: { label: "Start with a Free Title", to: "/catalog?search=free" },
    secondaryCta: { label: "About Adyoolau", to: "/about" },
    note: "No credit card required.",
    image: image29340,
  },
];

const AUTO_ADVANCE_MS = 6500;

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";

// Arrows + dots. "overlay" sits on top of the mobile photo (fixed white
// colors so it reads over any image); "inline" is the desktop version below
// the text, using the site's theme colors.
function Controls({ index, count, onPrev, onNext, onGo, variant }) {
  const overlay = variant === "overlay";

  const arrowClass = overlay
    ? "rounded-full p-2 text-white/90 hover:text-white"
    : "rounded-full border border-ivory/30 bg-ink/50 p-2 text-ivory/70 backdrop-blur-sm hover:border-gold-500 hover:text-gold-400";
  const dotOn = overlay ? "w-6 bg-white" : "w-6 bg-gold-500";
  const dotOff = overlay ? "w-2 bg-white/50" : "w-2 bg-ivory/30 group-hover:bg-ivory/50";

  return (
    <div
      className={
        overlay
          ? "flex items-center gap-1 rounded-full bg-black/40 px-1.5 text-white backdrop-blur-md"
          : "flex items-center gap-4"
      }
    >
      <button onClick={onPrev} aria-label="Previous slide" className={`${arrowClass} ${FOCUS_RING}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-center">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            onClick={() => onGo(i)}
            aria-label={`Go to slide ${i + 1}`}
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

      <button onClick={onNext} aria-label="Next slide" className={`${arrowClass} ${FOCUS_RING}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// Renders the photo in full, uncropped, contained entirely within the box.
// No oversized/blurred duplicate layer — nothing ever renders past the
// box's own edges. Empty letterboxed space (top/bottom on wide images,
// sides on tall ones) shows the section's own dark background.
function SlideImage({ src }) {
  return (
    <img
      src={src}
      alt=""
      className="absolute inset-0 h-full w-full object-contain object-center bg-ink"
    />
  );
}

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(advance, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [advance, index]);

  const goTo = (i) => {
    const nextIndex = ((i % SLIDES.length) + SLIDES.length) % SLIDES.length;
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
    // data-theme="dark" pins this section's color tokens (bg-ink, text-ivory,
    // border-navy-700, etc.) to their dark values regardless of the site-wide
    // theme toggle, so the scrim over the photo stays a dark vignette instead
    // of washing out in light mode.
    <section
      data-theme="dark"
      className="relative min-h-[560px] overflow-hidden border-b border-navy-700/60 bg-ink"
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
            <SlideImage src={s.image} />
          </div>
        ))}
        {/* Scrim is near-opaque under the text column so lettering baked into
            the photos can't show through the headline. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/20 pointer-events-none" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-12 pt-6 md:min-h-[560px] md:grid-cols-[1.2fr,1fr] md:py-20">
        <div>
          {/* MOBILE: photo first, with the arrows and dots overlaid on it so
              they're visible without scrolling. Any extra height from the
              taller slides ends up as space at the bottom of the hero. */}
          <div className="relative mb-6 h-56 overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 sm:h-72 md:hidden">
            {SLIDES.map((s, i) => (
              <div
                key={s.image}
                className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <SlideImage src={s.image} />
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
                  key={s.title}
                  className={`col-start-1 row-start-1 transition-[opacity,visibility,transform] duration-500 motion-reduce:transition-none ${
                    isActive
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-2 opacity-0"
                  }`}
                >
                  {/* Eyebrow: rounded-3xl (not -full) so a wrapped two-line
                      label on phones doesn't turn into a blob */}
                  <p className="inline-flex max-w-full items-center gap-2 rounded-3xl border border-ivory/15 bg-ivory/5 px-3 py-1.5 text-xs font-medium text-ivory/80 backdrop-blur-sm">
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