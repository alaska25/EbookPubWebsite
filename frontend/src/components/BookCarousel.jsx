import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import BookCard from "./BookCard";

// Swipe / drag tuning
const DRAG_THRESHOLD = 6; // px a press must move before it counts as a drag (keeps taps and clicks working)
const FLICK_MIN_DISTANCE = 30; // px
const FLICK_MIN_SPEED = 0.4; // px per ms; a quick flick moves one card even if the drag was short
const EDGE_RESISTANCE = 0.35; // rubber-band feel when dragging past the first/last card

export default function BookCarousel({ books = [] }) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [cardWidth, setCardWidth] = useState(240);

  // Live drag state: `dragOffset` is how far the row is being pulled (px),
  // `dragging` turns off the slide transition so the row follows the finger.
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ active: false, moved: false, pointerId: null, startX: 0, startTime: 0 });
  const suppressClickRef = useRef(false);

  const containerRef = useRef(null);
  const GAP_WIDTH = 24; // gap-6 is 24px (mobile uses a smaller gap, see below)
  const MOBILE_GAP_WIDTH = 8; // gap-2 for a tighter, more even mobile row

  const gap = window.innerWidth < 640 ? MOBILE_GAP_WIDTH : GAP_WIDTH;
  const STEP = cardWidth + gap;

  useEffect(() => {
    const handleResize = () => {
      let count;
      if (window.innerWidth < 640) {
        count = 4; // Mobile: show 4 cards
      } else if (window.innerWidth < 768) {
        count = 2; // Small tablets
      } else if (window.innerWidth < 1024) {
        count = 3; // Large tablets
      } else {
        count = 4; // Desktop
      }
      setVisibleCount(count);

      // Measure the actual container width and derive card width from it,
      // instead of relying on a fixed 240px that won't fit small screens.
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const currentGap = window.innerWidth < 640 ? MOBILE_GAP_WIDTH : GAP_WIDTH;
        const totalGap = currentGap * (count - 1);
        const width = (containerWidth - totalGap) / count;
        setCardWidth(width);
      }
    };

    handleResize(); // Run immediately on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxScrollIndex = Math.max(0, books.length - visibleCount);
  // Clamp in case a resize reduced the number of steps
  const index = Math.min(scrollIndex, maxScrollIndex);

  const handlePrev = () => {
    setScrollIndex(Math.max(0, index - 1));
  };

  const handleNext = () => {
    setScrollIndex(Math.min(maxScrollIndex, index + 1));
  };

  // ---- Touch / drag handling -------------------------------------------
  // Pointer events cover touch, mouse and pen. The track has
  // `touch-action: pan-y`, so vertical swipes still scroll the page while
  // horizontal ones come to us.
  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = {
      active: true,
      moved: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      startTime: performance.now(),
    };
  };

  const handlePointerMove = (e) => {
    const d = dragRef.current;
    if (!d.active || e.pointerId !== d.pointerId) return;

    const dx = e.clientX - d.startX;

    if (!d.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      // Only capture the pointer once it's clearly a drag, so plain taps
      // still reach the book cards' links and buttons.
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
    }

    const pastStart = index === 0 && dx > 0;
    const pastEnd = index >= maxScrollIndex && dx < 0;
    setDragOffset(pastStart || pastEnd ? dx * EDGE_RESISTANCE : dx);
  };

  const finishDrag = (e, cancelled) => {
    const d = dragRef.current;
    if (!d.active || e.pointerId !== d.pointerId) return;
    d.active = false;
    if (!d.moved) return; // it was a tap, let the click through
    d.moved = false;

    setDragging(false);
    setDragOffset(0);
    if (cancelled) return;

    const dx = e.clientX - d.startX;
    const elapsed = Math.max(1, performance.now() - d.startTime);

    // How many cards' worth did the finger travel?
    let cardsMoved = Math.round(-dx / STEP);
    // A quick flick moves at least one card
    if (cardsMoved === 0 && Math.abs(dx) > FLICK_MIN_DISTANCE && Math.abs(dx) / elapsed > FLICK_MIN_SPEED) {
      cardsMoved = dx < 0 ? 1 : -1;
    }
    setScrollIndex(Math.max(0, Math.min(maxScrollIndex, index + cardsMoved)));

    // The browser fires a click right after a drag ends; swallow it so a
    // swipe never opens the book under the finger.
    suppressClickRef.current = true;
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const handleClickCapture = (e) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!books || books.length === 0) return null;

  return (
    <section aria-label="Featured books" className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-6 sm:py-12">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1.5 text-xs font-medium text-ivory/80">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            Featured books
          </p>
          <h2 className="mt-3 font-sans text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-ivory sm:text-4xl">
            Popular titles
          </h2>
        </div>
        <Link
          to="/catalog"
          className="shrink-0 pb-1 text-sm font-semibold text-gold-500 underline-offset-4 transition-colors hover:text-gold-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
        >
          View all books &rarr;
        </Link>
      </div>

      {/* Outer Context Window Container Frame */}
      <div className="relative mt-4 w-full sm:mt-8" ref={containerRef}>

        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          disabled={index === 0}
          aria-label="Previous items"
          className="absolute -left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-navy-700/60 bg-ink p-1.5 text-ivory shadow-md transition-all hover:bg-navy-800 disabled:pointer-events-none disabled:opacity-0 sm:-left-4 sm:p-3"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3 sm:h-4 sm:w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* The Clipped Window Track (also the swipe/drag surface) */}
        <div
          className={`w-full select-none overflow-hidden rounded-lg ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ touchAction: "pan-y" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(e) => finishDrag(e, false)}
          onPointerCancel={(e) => finishDrag(e, true)}
          onClickCapture={handleClickCapture}
          onDragStart={(e) => e.preventDefault()}
        >

          {/* Transforming Slider Track Ribbon */}
          <div
            className={`flex ${
              dragging ? "" : "transition-transform duration-500 ease-out motion-reduce:transition-none"
            }`}
            style={{
              gap: `${gap}px`,
              transform: `translateX(${-index * STEP + dragOffset}px)`,
              willChange: "transform",
            }}
          >
            {books.map((book) => (
              <div
                key={book._id}
                className="shrink-0"
                style={{ width: `${cardWidth}px` }}
              >
                <BookCard book={book} showAddToCart={true} compact={cardWidth < 140} />
              </div>
            ))}
          </div>

        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          disabled={index >= maxScrollIndex}
          aria-label="Next items"
          className="absolute -right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-navy-700/60 bg-ink p-1.5 text-ivory shadow-md transition-all hover:bg-navy-800 disabled:pointer-events-none disabled:opacity-0 sm:-right-4 sm:p-3"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3 sm:h-4 sm:w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>
    </section>
  );
}