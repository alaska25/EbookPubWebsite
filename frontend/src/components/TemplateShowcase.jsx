import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/axios.js";
import Reveal from "./Reveal.jsx";
import { useCart } from "../context/CartContext.jsx";
import { flyToCart } from "../utils/flyToCart.js";

export default function TemplateShowcase() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { items, addItem } = useCart();

  useEffect(() => {
    api
      .get("/templates", { params: { limit: 3 } })
      .then(({ data }) => setTemplates(data.templates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || templates.length === 0) return null;

  const handleAddToCart = (e, template) => {
    e.preventDefault();
    e.stopPropagation();

    const imgEl = e.currentTarget.closest("a")?.querySelector("img");
    flyToCart(imgEl);

    addItem(template);
    setAddedId(template._id);
    setTimeout(() => setAddedId((id) => (id === template._id ? null : id)), 1500);
  };

  return (
    <section className="border-t border-navy-700/60 bg-navy-900/40">
      <Reveal className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-xs font-medium text-ivory/80">
            {t("templates.eyebrow")}
          </p>
          <h2 className="mt-5 font-display text-3xl tracking-tight text-ivory sm:text-4xl">
            {t("templates.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ivory/70">
            {t("templates.subtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {templates.map((template) => {
            const inCart = items.some((i) => i._id === template._id);
            const justAdded = addedId === template._id;

            return (
              <Link
                key={template._id}
                to={`/template/${template._id}`}
                className="group overflow-hidden rounded-xl border border-navy-700/60 bg-navy-900/60 transition hover:border-gold-500/50"
              >
                <img src={template.coverUrl} alt={template.title} className="h-40 w-full object-cover" />
                <div className="p-5">
                  <p className="font-display text-lg text-ivory">{template.title}</p>
                  {template.tagline && <p className="mt-1 text-sm text-ivory/60">{template.tagline}</p>}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gold-400">
                      {template.isFree ? t("templates.free") : `$${template.price.toFixed(2)}`}
                    </p>

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, template)}
                      disabled={inCart}
                      className="shrink-0 rounded-full border border-gold-500/40 px-3.5 py-1.5 text-xs font-medium text-gold-400 transition hover:bg-gold-500/10 disabled:cursor-default disabled:border-navy-700 disabled:text-ivory/40 disabled:hover:bg-transparent"
                    >
                      {inCart ? t("templates.inCart") : justAdded ? t("templates.added") : t("templates.addToCart")}
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/templates"
            className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 px-5 py-2.5 text-sm font-medium text-gold-400 transition hover:bg-gold-500/10"
          >
            {t("templates.seeAll")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}