import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get("/templates/admin", { params: { limit: 100 } })
      .then(({ data }) => {
        setTemplates(data.templates);
        setTotal(data.total);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Couldn't load templates. Please try again.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this template permanently? This also removes its files from storage.")) return;
    try {
      await api.delete(`/templates/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't delete the template. Please try again.");
    }
  };

  const handleTogglePublish = async (template) => {
    const nextPublished = !template.published;
    setTogglingId(template._id);
    try {
      await api.put(`/templates/${template._id}`, { published: nextPublished });
      setTemplates((prev) =>
        prev.map((t) => (t._id === template._id ? { ...t, published: nextPublished } : t))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't update publish status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <p className="text-ivory/50">Loading…</p>;

  const publishedCount = templates.filter((t) => t.published !== false).length;
  const unpublishedCount = templates.length - publishedCount;
  const catalogValue = templates.reduce((sum, t) => sum + (t.isFree ? 0 : t.price || 0), 0);
  const showingPartial = total > templates.length;

  const stats = [
    { label: "Templates in catalog", value: total || templates.length },
    { label: "Published", value: publishedCount },
    { label: "Unpublished", value: unpublishedCount },
    { label: "Combined list price", value: `$${catalogValue.toFixed(2)}` },
  ];

  return (
    <div>
      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          <span>{error}</span>
          <button onClick={load} className="shrink-0 font-medium underline underline-offset-4">
            Retry
          </button>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-b border-navy-700/60 pb-8 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <dd className="font-display text-3xl text-ivory">{s.value}</dd>
            <dt className="mt-1 text-sm text-ivory/50">{s.label}</dt>
          </div>
        ))}
      </dl>
      {showingPartial && (
        <p className="mt-3 text-xs text-ivory/40">
          Showing the newest {templates.length} of {total} templates. Published, unpublished and
          price figures cover the templates shown.
        </p>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-navy-700/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-navy-700/60 bg-navy-900/60 text-ivory/50">
                <th className="py-3 pl-5 pr-4 font-medium">Title</th>
                <th className="py-3 pr-4 font-medium">Category</th>
                <th className="py-3 pr-4 font-medium">Price</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/40">
              {templates.map((t) => {
                const isPublished = t.published !== false;
                const isToggling = togglingId === t._id;

                return (
                  <tr key={t._id} className="text-ivory/80 transition-colors hover:bg-navy-900/40">
                    <td className="py-3.5 pl-5 pr-4 font-medium text-ivory">{t.title}</td>
                    <td className="py-3.5 pr-4 text-ivory/70">{t.category}</td>
                    <td className="py-3.5 pr-4 text-ivory/70">
                      {t.isFree ? "Free" : `$${t.price.toFixed(2)}`}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isPublished ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-ivory/10 text-ivory/50"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-[#22c55e]" : "bg-ivory/40"}`}
                        />
                        {isPublished ? "Published" : "Unpublished"}
                      </span>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1 text-xs font-medium">
                        <button
                          onClick={() => handleTogglePublish(t)}
                          disabled={isToggling}
                          className="rounded-full px-3 py-1.5 text-gold-400 transition-colors hover:bg-gold-500/10 hover:text-gold-300 disabled:opacity-50"
                        >
                          {isToggling ? "…" : isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <Link
                          to={`/admin/templates/${t._id}/edit`}
                          className="rounded-full px-3 py-1.5 text-gold-400 transition-colors hover:bg-gold-500/10 hover:text-gold-300"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="rounded-full px-3 py-1.5 text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {templates.length === 0 && !error && (
        <p className="mt-8 text-center text-ivory/50">
          No templates yet — head to Add template to publish your first one.
        </p>
      )}
    </div>
  );
}