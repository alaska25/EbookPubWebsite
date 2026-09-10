import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";

const emptyForm = {
  title: "",
  author: "",
  description: "",
  category: "",
  price: "",
  isFree: false,
  featured: false,
};

export default function AdminBookForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [cover, setCover] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEditing) return;
    api.get(`/books/${id}`).then(({ data }) => {
      setForm({
        title: data.title,
        author: data.author,
        description: data.description,
        category: data.category,
        price: data.price,
        isFree: data.isFree,
        featured: data.featured,
      });
    });
  }, [id, isEditing]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/books/${id}`, form);
      } else {
        if (!cover || !bookFile) {
          setError("Both a cover image and a book file are required.");
          setSaving(false);
          return;
        }
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        data.append("cover", cover);
        data.append("bookFile", bookFile);
        await api.post("/books", data, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/admin/books");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the book.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <h2 className="font-display text-xl text-ivory">{isEditing ? "Edit book" : "Add a new book"}</h2>

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Title</label>
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Author</label>
        <input
          required
          value={form.author}
          onChange={(e) => update("author", e.target.value)}
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Description</label>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Category</label>
        <input
          required
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-ivory/70">
          <input
            type="checkbox"
            checked={form.isFree}
            onChange={(e) => update("isFree", e.target.checked)}
          />
          This book is free
        </label>
        <label className="flex items-center gap-2 text-sm text-ivory/70">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
          />
          Featured
        </label>
      </div>

      {!form.isFree && (
        <div>
          <label className="mb-1 block text-sm text-ivory/60">Price (USD)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required={!form.isFree}
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500"
          />
        </div>
      )}

      {!isEditing && (
        <>
          <div>
            <label className="mb-1 block text-sm text-ivory/60">Cover image (JPG/PNG/WebP)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => setCover(e.target.files[0])}
              className="w-full text-sm text-ivory/70"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ivory/60">Book file (PDF or EPUB)</label>
            <input
              type="file"
              accept=".pdf,.epub"
              onChange={(e) => setBookFile(e.target.files[0])}
              className="w-full text-sm text-ivory/70"
            />
          </div>
        </>
      )}

      {isEditing && (
        <p className="text-sm text-ivory/40">
          To replace the cover or book file, delete this title and re-add it.
        </p>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
      >
        {saving ? "Saving…" : isEditing ? "Save changes" : "Add book"}
      </button>
    </form>
  );
}
