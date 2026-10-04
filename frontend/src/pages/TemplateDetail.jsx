import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuthModal } from "../context/AuthModalContext.jsx";
import { flyToCart } from "../utils/flyToCart.js";

export default function TemplateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, addItem } = useCart();
  const { openLogin } = useAuthModal();
  const coverRef = useRef(null);

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    // Without this, navigating here from a scrolled-down position on the
    // templates listing (common on mobile, where cards run long) leaves
    // this page rendered at that same scroll offset — landing near the
    // footer instead of the top of the new page.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    setLoading(true);
    setNotFound(false);
    api
      .get(`/templates/${id}`)
      .then(({ data }) => setTemplate(data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="mx-auto max-w-4xl px-6 py-24 text-center text-ivory/50">Loading…</p>;
  }

  if (notFound || !template) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-ivory">Template not found</h1>
        <p className="mt-4 text-ivory/60">It may have been removed or unpublished.</p>
        <Link to="/templates" className="mt-6 inline-block text-gold-400 hover:text-gold-300">
          Back to templates
        </Link>
      </div>
    );
  }

  const inCart = items.some((i) => i._id === template._id);

  const handleAddToCart = () => {
    flyToCart(coverRef.current);
    // Tag the item as a template so the cart sends it to checkout as one.
    // Without this, checkout can mistake it for a book (bookIds) and the
    // backend fails to find it, so the buyer can't pay.
    addItem({ ...template, itemType: "template" });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleClaimFree = async () => {
    if (!user) {
      openLogin();
      return;
    }
    setError("");
    setClaiming(true);
    try {
      await api.post(`/templates/${template._id}/claim`);
      navigate("/library");
    } catch (err) {
      setError(err.response?.data?.message || "Could not claim this template.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Back goes to the templates listing; Home is a quiet icon-only
          shortcut on the opposite end, matching the book detail page. */}
      <div className="flex items-center justify-between">
        <Link to="/templates" className="text-sm text-ivory/50 hover:text-ivory">
          ← Back to templates
        </Link>
        <Link
          to="/"
          aria-label="Home"
          title="Home"
          className="-mr-2 inline-flex h-10 items-center gap-2 rounded-full px-2 text-ivory/70 transition-colors hover:bg-ivory/5 hover:text-gold-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 sm:px-3"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            className="h-[18px] w-[18px]"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 10v9a1 1 0 0 0 1 1h3.5v-5.5h4V20H17.5a1 1 0 0 0 1-1v-9" />
          </svg>
          <span className="hidden text-sm sm:inline">Home</span>
        </Link>
      </div>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <img
          ref={coverRef}
          src={template.coverUrl}
          alt={template.title}
          className="w-full rounded-xl border border-navy-700/60 object-cover"
        />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gold-400">{template.category}</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-ivory">{template.title}</h1>
          {template.tagline && <p className="mt-2 text-ivory/60">{template.tagline}</p>}

          <div className="mt-6 flex items-center gap-4">
            <p className="font-display text-2xl text-ivory">
              {template.isFree ? "Free" : `$${template.price.toFixed(2)}`}
            </p>

            {template.isFree ? (
              <button
                onClick={handleClaimFree}
                disabled={claiming}
                className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
              >
                {claiming ? "Adding…" : "Get for free"}
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={inCart}
                className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:cursor-default disabled:bg-navy-700 disabled:text-ivory/40"
              >
                {inCart ? "In cart" : added ? "Added ✓" : "Add to cart"}
              </button>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-ivory/70">
            {template.description}
          </p>

          {template.techStack?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {template.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-navy-700 bg-navy-900 px-3 py-1 text-xs text-ivory/70"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {template.version && (
              <div>
                <dt className="text-ivory/40">Version</dt>
                <dd className="mt-0.5 text-ivory/80">{template.version}</dd>
              </div>
            )}
            {template.liveDemoUrl && (
              <div>
                <dt className="text-ivory/40">Live demo</dt>
                <dd className="mt-0.5">
                  <a href={template.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300">
                    View demo ↗
                  </a>
                </dd>
              </div>
            )}
            {template.repoUrl && (
              <div>
                <dt className="text-ivory/40">Preview repo</dt>
                <dd className="mt-0.5">
                  <a href={template.repoUrl} target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300">
                    View source ↗
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {(template.readme || template.fileTree?.length > 0) && (
        <div className="mt-14 border-t border-navy-700/60 pt-10">
          <h2 className="font-display text-xl text-ivory">What's inside</h2>
          <p className="mt-1 text-sm text-ivory/50">
            Pulled directly from the template's zip — a preview of the docs and structure before you buy.
          </p>

          {template.readme && (
            <div className="mt-6">
              <p className="text-sm font-medium text-ivory/70">README</p>
              <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-navy-700 bg-navy-900 p-4 text-xs leading-relaxed text-ivory/70">
                {template.readme}
              </pre>
            </div>
          )}

          {template.fileTree?.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-ivory/70">
                File structure{template.fileTree.length >= 500 && " (truncated)"}
              </p>
              <div className="mt-2 max-h-80 overflow-auto rounded-lg border border-navy-700 bg-navy-900 p-4">
                <ul className="space-y-0.5 text-xs text-ivory/60">
                  {template.fileTree.map((path) => (
                    <li key={path} className="font-mono">
                      {path}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}