import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/axios.js";

export default function Templates() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/" className="text-sm text-ivory/50 hover:text-ivory">
        {t("templatesPage.backHome")}
      </Link>

      <h1 className="mt-6 font-display text-3xl tracking-tight text-ivory">{t("templatesPage.title")}</h1>
      <p className="mt-2 text-ivory/60">{t("templatesPage.subtitle")}</p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <input
          type="search"
          defaultValue={search}
          onKeyDown={(e) => e.key === "Enter" && updateParam("search", e.currentTarget.value.trim())}
          placeholder={t("templatesPage.searchPlaceholder")}
          className="w-full max-w-xs rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
        />
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory focus:border-gold-500"
        >
          <option value="">{t("templatesPage.allCategories")}</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {(search || category) && (
          <button
            onClick={() => setSearchParams({})}
            className="text-sm text-ivory/50 hover:text-ivory"
          >
            {t("templatesPage.clearFilters")}
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-12 text-center text-ivory/50">{t("templatesPage.loading")}</p>
      ) : templates.length === 0 ? (
        <p className="mt-12 text-center text-ivory/50">{t("templatesPage.noResults")}</p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t2) => (
              <Link
                key={t2._id}
                to={`/template/${t2._id}`}
                className="group overflow-hidden rounded-xl border border-navy-700/60 bg-navy-900/60 transition hover:border-gold-500/50"
              >
                <img src={t2.coverUrl} alt={t2.title} className="h-40 w-full object-cover" />
                <div className="p-5">
                  <p className="font-display text-lg text-ivory">{t2.title}</p>
                  {t2.tagline && <p className="mt-1 text-sm text-ivory/60">{t2.tagline}</p>}
                  <p className="mt-3 text-sm font-semibold text-gold-400">
                    {t2.isFree ? t("templatesPage.free") : `$${t2.price.toFixed(2)}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                    p === page ? "bg-gold-500 text-ink" : "text-ivory/60 hover:text-ivory"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <p className="mt-4 text-center text-xs text-ivory/40">{t("templatesPage.totalCount", { count: total })}</p>
        </>
      )}
    </div>
  );
}