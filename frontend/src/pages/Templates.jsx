import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { flyToCart } from "../utils/flyToCart.js";
import BackButton from "../components/BackButton.jsx";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

const chipBase =
  "h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/5 bg-navy-900/40 p-2.5">
      <div className="aspect-[16/10] w-full animate-pulse rounded-2xl bg-navy-800" />
      <div className="space-y-3 px-2 pb-2 pt-4">
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-navy-800" />
        <div className="h-4 w-full animate-pulse rounded-full bg-navy-800" />
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-navy-800" />
        <div className="h-10 w-full animate-pulse rounded-full bg-navy-800" />
      </div>
    </div>
  );
}

export default function Templates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { items, addItem } = useCart();
  const navigate = useNavigate();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const page = Number(searchParams.get("page") || 1);
  const limit = 9;

  useEffect(() => {
    api.get("/templates/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/templates", { params: { search: search || undefined, category: category || undefined, page, limit } })
      .then(({ data }) => {
        setTemplates(data.templates);
        setTotal(data.total);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [search, category, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page"); // reset to page 1 on filter change
    setSearchParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (e, template) => {
    // The cover image lives in the same card (<article>) as the button
    const imgEl = e.currentTarget.closest("article")?.querySelector("img");
    flyToCart(imgEl);

    // Tag the item as a template so the cart sends it to checkout as one.
    // Without this, checkout treats it as a book (bookIds), the backend can't
    // find it in the Book collection, and create-order fails with a 400.
    addItem({ ...template, itemType: "template" });
    setAddedId(template._id);
    setTimeout(() => setAddedId((id) => (id === template._id ? null : id)), 1500);
  };

  const hasFilters = Boolean(search || category);

  return (
    // pb-28 keeps the last row of cards clear of the floating chat button
    <div className="relative isolate mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pt-12">
      {/* Soft gold glow behind the header */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(212,175,55,0.14),transparent)]"
      />

      <BackButton fallback="/" className="mb-8" />

      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ivory sm:text-5xl">
          Templates
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ivory/60">
          Production-ready starter kits for your next project.
        </p>
      </header>

      {/* Filters */}
      <div className="mt-10 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
            <input
              key={search} // remounts when filters are cleared so the box empties too
              type="search"
              defaultValue={search}
              aria-label="Search templates"
              onKeyDown={(e) => e.key === "Enter" && updateParam("search", e.currentTarget.value.trim())}
              placeholder="Search templates"
              className="h-12 w-full rounded-full border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-ivory backdrop-blur-md transition placeholder:text-ivory/40 hover:border-white/20 focus:border-gold-500 focus:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-gold-500/15"
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className={`h-10 rounded-full px-4 text-sm font-medium text-ivory/60 transition-colors hover:text-ivory ${focusRing}`}
            >
              Clear filters
            </button>
          )}

          {!loading && templates.length > 0 && (
            <p className="text-sm tabular-nums text-ivory/50 sm:ml-auto" aria-live="polite">
              {total} template{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Category chips: scroll sideways on small screens */}
        {categories.length > 0 && (
          <div
            role="group"
            aria-label="Filter by category"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <button
              type="button"
              onClick={() => updateParam("category", "")}
              aria-pressed={!category}
              className={`${chipBase} ${focusRing} ${
                !category
                  ? "border-ivory bg-ivory text-ink"
                  : "border-white/10 text-ivory/70 hover:border-gold-500/60 hover:text-ivory"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateParam("category", c)}
                aria-pressed={category === c}
                className={`${chipBase} ${focusRing} ${
                  category === c
                    ? "border-ivory bg-ivory text-ink"
                    : "border-white/10 text-ivory/70 hover:border-gold-500/60 hover:text-ivory"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="mt-14 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <p className="font-display text-xl font-semibold text-ivory">No templates found</p>
          <p className="mt-2 text-sm text-ivory/60">
            Try a different search term or remove a filter.
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className={`mt-6 h-11 rounded-full bg-gold-500 px-6 text-sm font-semibold text-ink transition-colors hover:bg-gold-400 ${focusRing}`}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => {
              const inCart = items.some((i) => i._id === t._id);
              const justAdded = addedId === t._id;
              const detailsPath = `/template/${t._id}`;

              // <article> with separate links and buttons: no <button> inside an <a>
              return (
                <article
                  key={t._id}
                  className="group flex flex-col rounded-3xl border border-white/5 bg-gradient-to-b from-navy-900/70 to-navy-900/30 p-2.5 transition-all duration-300 hover:border-gold-500/40 hover:shadow-2xl hover:shadow-gold-500/5 motion-reduce:transition-none"
                >
                  <Link
                    to={detailsPath}
                    aria-label={`View details for ${t.title}`}
                    className={`relative block aspect-[16/10] w-full overflow-hidden rounded-2xl bg-navy-800 ${focusRing}`}
                  >
                    <img
                      src={t.coverUrl}
                      alt={`Preview of ${t.title}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent"
                    />
                    {t.category && (
                      <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-ink/60 px-3 py-1 text-xs font-medium text-ivory backdrop-blur-md">
                        {t.category}
                      </span>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-display text-lg font-semibold leading-snug text-ivory">
                        <Link
                          to={detailsPath}
                          className={`rounded-sm transition-colors hover:text-gold-400 ${focusRing}`}
                        >
                          {t.title}
                        </Link>
                      </h2>
                      <p className="shrink-0 rounded-full bg-gold-500/10 px-3 py-1 text-sm font-semibold tabular-nums text-gold-400">
                        {t.isFree ? "Free" : `$${t.price.toFixed(2)}`}
                      </p>
                    </div>

                    {t.tagline && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ivory/60">
                        {t.tagline}
                      </p>
                    )}

                    {/* Actions pinned to the bottom so cards of different heights line up */}
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, t)}
                        disabled={inCart}
                        className={`flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-gold-500 px-3 text-sm font-semibold text-ink transition hover:bg-gold-400 active:scale-[0.98] disabled:cursor-default disabled:bg-white/5 disabled:text-ivory/50 disabled:active:scale-100 ${focusRing}`}
                      >
                        {inCart ? "In cart" : justAdded ? "Added ✓" : "Add to cart"}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(detailsPath)}
                        className={`flex h-11 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-3 text-sm font-medium text-ivory/80 transition-colors hover:border-gold-500/60 hover:bg-gold-500/10 hover:text-gold-400 ${focusRing}`}
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {pages > 1 && (
            <nav
              className="mx-auto mt-12 flex w-fit max-w-full flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-md"
              aria-label="Pagination"
            >
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className={`h-9 rounded-full px-4 text-sm font-medium text-ivory/70 transition-colors hover:text-ivory disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
              >
                Previous
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={`h-9 w-9 rounded-full text-sm font-medium tabular-nums transition-colors ${focusRing} ${
                    p === page
                      ? "bg-gold-500 text-ink"
                      : "text-ivory/60 hover:bg-white/10 hover:text-ivory"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= pages}
                className={`h-9 rounded-full px-4 text-sm font-medium text-ivory/70 transition-colors hover:text-ivory disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}