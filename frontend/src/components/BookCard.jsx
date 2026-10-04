import { memo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { flyToCart } from "../utils/flyToCart.js";
import StarRating from "./StarRating.jsx";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

function CartIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function BookCard({ book, showAddToCart = false, compact = false }) {
  const { items, addItem } = useCart();
  const navigate = useNavigate();
  const inCart = items.some((b) => b._id === book._id);
  const imgRef = useRef(null);
  const pendingRef = useRef(false); // true while a cover is mid-flight

  const detailsPath = `/book/${book._id}`;

  const handleAddToCart = () => {
    if (book.isFree) {
      navigate(detailsPath);
      return;
    }
    if (inCart || pendingRef.current) return;

    pendingRef.current = true;
    // Add when the cover lands (or immediately if the animation is skipped),
    // so the badge count changes on arrival instead of on click.
    flyToCart(imgRef.current).finally(() => {
      addItem(book);
      pendingRef.current = false;
    });
  };

  const cartLabel = book.isFree ? "Get free" : inCart ? "In cart" : "Add to cart";

  return (
    // The card is now an <article>. Only the cover and title are links, and the
    // buttons sit outside them, so there is no <button> nested inside an <a>.
    <article
      className={`group flex h-full w-full flex-col rounded-2xl border border-navy-700/60 bg-navy-900/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500/50 hover:shadow-xl hover:shadow-black/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        compact ? "p-1.5" : "p-3"
      }`}
    >
      {/* Cover */}
      <Link
        to={detailsPath}
        aria-label={`View details for ${book.title}`}
        className={`relative block aspect-[2/3] w-full overflow-hidden rounded-xl bg-navy-800 shadow-md shadow-black/20 ring-1 ring-black/5 ${focusRing}`}
      >
        <img
          ref={imgRef}
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          decoding="async"
          width="400"
          height="600"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        {book.fileType && (
          <span
            className={`absolute right-2 top-2 rounded-full bg-ink/75 font-semibold uppercase tracking-wider text-ivory backdrop-blur-md ${
              compact ? "px-1.5 py-0.5 text-[8px]" : "px-2.5 py-1 text-[10px]"
            }`}
          >
            {book.fileType}
          </span>
        )}

        {book.isFree && (
          <span
            className={`absolute bottom-2 left-2 rounded-full bg-gold-500 font-semibold text-ink shadow-sm ${
              compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-xs"
            }`}
          >
            Free
          </span>
        )}
      </Link>

      {/* Details */}
      <div className={`flex flex-1 flex-col ${compact ? "mt-2.5 px-0.5" : "mt-4 px-1"}`}>
        <h3
          className={`break-words font-display font-semibold leading-snug text-ivory ${
            compact ? "line-clamp-2 min-h-[2.5em] text-xs" : "line-clamp-2 text-base"
          }`}
        >
          <Link
            to={detailsPath}
            className={`rounded-sm transition-colors hover:text-gold-400 ${focusRing}`}
          >
            {book.title}
          </Link>
        </h3>

        {/* Subtitle only shown in full layout — no room for it in compact mode */}
        {!compact && book.subtitle && (
          <p className="mt-1 truncate text-sm text-ivory/60">{book.subtitle}</p>
        )}

        <p className={`truncate text-ivory/60 ${compact ? "mt-0.5 text-[11px]" : "mt-1 text-sm"}`}>
          {book.author}
        </p>

        {/* Rating row keeps a fixed height so cards without reviews still line up */}
        <div className={`flex items-center gap-1.5 ${compact ? "mt-1.5 min-h-[14px]" : "mt-2 min-h-[18px]"}`}>
          {book.reviewCount > 0 && (
            <>
              <StarRating value={book.avgRating} size={compact ? 10 : 13} />
              <span className={`text-ivory/60 ${compact ? "text-[10px]" : "text-xs"}`}>
                ({book.reviewCount})
              </span>
            </>
          )}
        </div>

        <p
          className={`font-semibold tabular-nums text-gold-400 ${
            compact ? "mt-1.5 text-sm" : "mt-2 text-lg"
          }`}
        >
          {book.isFree ? "Free" : `$${book.price.toFixed(2)}`}
        </p>

        {/* Actions pinned to the bottom of the card */}
        <div className={`mt-auto flex flex-col ${compact ? "gap-1.5 pt-3" : "gap-2 pt-4"}`}>
          {showAddToCart && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={inCart && !book.isFree}
              aria-label={cartLabel}
              title={cartLabel}
              className={`flex shrink-0 items-center justify-center gap-2 rounded-full bg-gold-500 font-semibold text-ink shadow-sm transition-colors hover:bg-gold-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${
                compact ? "h-8 w-full" : "h-11 w-full text-sm"
              }`}
            >
              <CartIcon className={compact ? "h-4 w-4" : "h-[18px] w-[18px]"} />
              {!compact && cartLabel}
            </button>
          )}

          <Link
            to={detailsPath}
            className={`flex items-center justify-center whitespace-nowrap rounded-full border border-navy-700 font-medium text-ivory/80 transition-colors hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-400 ${focusRing} ${
              compact ? "h-8 w-full text-[11px]" : "h-11 w-full text-sm"
            }`}
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default memo(BookCard);