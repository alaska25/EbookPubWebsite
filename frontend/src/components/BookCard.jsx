import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { flyToCart } from "../utils/flyToCart.js";
import StarRating from "./StarRating.jsx";

// Must match the default `duration` in flyToCart.js (750ms).
const FLIGHT_MS = 750;

export default function BookCard({ book, showAddToCart = false, compact = false }) {
  const { items, addItem } = useCart();
  const navigate = useNavigate();
  const inCart = items.some((b) => b._id === book._id);
  const imgRef = useRef(null);
  const pendingRef = useRef(false); // true while a cover is mid-flight

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (book.isFree) {
      navigate(`/book/${book._id}`);
      return;
    }
    if (inCart || pendingRef.current) return;

    pendingRef.current = true;
    flyToCart(imgRef.current);

    // Add when the cover lands, so the badge count changes on arrival
    // instead of on click.
    setTimeout(() => {
      addItem(book);
      pendingRef.current = false;
    }, FLIGHT_MS);
  };

  return (
    <Link to={`/book/${book._id}`} className="group block w-full text-left">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-navy-800">
        <img
          ref={imgRef}
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {book.fileType && (
          <span
            className={`absolute right-1.5 top-1.5 rounded-full bg-ink/80 font-semibold uppercase tracking-wide text-ivory/90 backdrop-blur-sm ${
              compact ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-0.5 text-[10px]"
            }`}
          >
            {book.fileType}
          </span>
        )}
      </div>

      <h3
        className={`font-display leading-snug text-ivory group-hover:text-gold-400 ${
          compact ? "mt-1.5 line-clamp-2 min-h-[2.2em] text-xs" : "mt-3 text-base"
        }`}
      >
        {book.title}
      </h3>

      {/* Subtitle only shown in full layout — no room for it in compact mode */}
      {!compact && book.subtitle && (
        <p className="mt-0.5 truncate text-sm text-ivory/60">{book.subtitle}</p>
      )}

      {book.reviewCount > 0 && (
        <div className={`flex items-center gap-1 ${compact ? "mt-1" : "mt-1 gap-1.5"}`}>
          <StarRating value={book.avgRating} size={compact ? 10 : 13} />
          <span className={`text-ivory/60 ${compact ? "text-[10px]" : "text-xs"}`}>
            ({book.reviewCount})
          </span>
        </div>
      )}

      {/* Author shown in both layouts; compact uses smaller, truncated text */}
      <p className={`truncate text-ivory/60 ${compact ? "mt-0.5 text-[10px]" : "mt-1 text-xs"}`}>
        {book.author}
      </p>

      <p className={`text-gold-400 font-medium ${compact ? "mt-1 text-xs" : "mt-1 text-sm"}`}>
        {book.isFree ? "Free" : `$${book.price.toFixed(2)}`}
      </p>

      {showAddToCart && (
        <button
          onClick={handleAddToCart}
          aria-label={book.isFree ? "Get free" : inCart ? "In cart" : "Add to Cart"}
          className={
            compact
              ? "mt-2 flex w-full items-center justify-center rounded-full bg-gold-500 py-1.5 text-ink hover:bg-gold-400 disabled:opacity-50"
              : "mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {/* Text label only in full layout — icon-only button in compact mode */}
          {!compact && (book.isFree ? "Get free" : inCart ? "In cart" : "Add to Cart")}
        </button>
      )}
    </Link>
  );
}