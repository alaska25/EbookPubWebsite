import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";

const emptyForm = {
  title: "",
  subtitle: "",
  author: "",
  description: "",
  category: "",
  price: "",
  isFree: false,
  featured: false,
  pageCount: "",
  publishedAt: "",
};

// A labeled file input with a filename chip and a way to clear the selection,
// used for cover / book file / sample file so all three look and behave the same.
function FileField({ label, hint, accept, file, onChange, required }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-ivory/60">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {hint && <p className="mb-1.5 text-xs text-ivory/40">{hint}</p>}

      {file ? (
        <div className="flex items-center justify-between rounded-md border border-navy-700 bg-navy-900 px-4 py-2">
          <span className="truncate text-sm text-ivory/80">{file.name}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-3 shrink-0 text-xs text-ivory/40 hover:text-red-400"
          >
            Remove
          </button>
        </div>
      ) : (
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files[0] || null)}
          className="w-full cursor-pointer rounded-md border border-dashed border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory/60 file:mr-3 file:rounded-full file:border-0 file:bg-navy-700 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ivory/80 hover:border-gold-500/60"
        />
      )}
    </div>
  );
}

// Formats an ISO date string (or Date) down to the yyyy-mm-dd shape a
// <input type="date"> expects, since the API returns full ISO timestamps.
const toDateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

// Uploads a single file to its own endpoint (cover / book file / sample all
// follow this same shape) and returns whether it succeeded, so the caller
// can stop and report a specific, actionable error instead of a generic one.
async function uploadFile(url, fieldName, file, setError, failureNote) {
  try {
    const data = new FormData();
    data.append(fieldName, file);
    await api.post(url, data, { headers: { "Content-Type": "multipart/form-data" } });
    return true;
  } catch (err) {
    setError((err.response?.data?.message || failureNote) + " The rest of the book's details were saved.");
    return false;
  }
}

export default function AdminBookForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [cover, setCover] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [sampleFile, setSampleFile] = useState(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState(null);
  const [currentBookFileType, setCurrentBookFileType] = useState(null);
  const [currentSampleType, setCurrentSampleType] = useState(null);
  const [saving, setSaving] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEditing) return;
    api.get(`/books/${id}`).then(({ data }) => {
      setForm({
        title: data.title,
        subtitle: data.subtitle || "",
        author: data.author,
        description: data.description,
        category: data.category,
        price: data.price,
        isFree: data.isFree,
        featured: data.featured,
        pageCount: data.pageCount ?? "",
        publishedAt: toDateInputValue(data.publishedAt),
      });
      setCurrentCoverUrl(data.coverUrl || null);
      setCurrentBookFileType(data.fileType || null);
      setCurrentSampleType(data.sampleFileType || null);
    });
  }, [id, isEditing]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleDownloadFile = async () => {
    setDownloadingFile(true);
    try {
      const { data } = await api.get(`/books/${id}/file`);
      // Open the signed S3 URL directly; it's already time-limited and
      // needs no auth header of its own, so a new tab is enough.
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.response?.data?.message || "Could not get a download link for the current file.");
    } finally {
      setDownloadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (isEditing) {
        // Save the text fields first, then any replacement files, so a
        // failure in one step gives a specific, actionable error rather than
        // leaving the admin unsure what actually saved.
        try {
          await api.put(`/books/${id}`, form);
        } catch (err) {
          setError(err.response?.data?.message || "Could not save the book's details.");
          setSaving(false);
          return;
        }

        if (cover) {
          const ok = await uploadFile(
            `/books/${id}/cover`,
            "cover",
            cover,
            setError,
            "Could not upload the cover image."
          );
          if (!ok) {
            setSaving(false);
            return;
          }
        }

        if (bookFile) {
          const ok = await uploadFile(
            `/books/${id}/file`,
            "bookFile",
            bookFile,
            setError,
            "Could not upload the book file."
          );
          if (!ok) {
            setSaving(false);
            return;
          }
        }

        if (sampleFile) {
          const ok = await uploadFile(
            `/books/${id}/sample`,
            "sampleFile",
            sampleFile,
            setError,
            "Could not upload the sample file."
          );
          if (!ok) {
            setSaving(false);
            return;
          }
        }
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
        if (sampleFile) {
          data.append("sampleFile", sampleFile);
        }
        await api.post("/books", data, { headers: { "Content-Type": "multipart/form-data" } });
      }

      navigate("/admin/books");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the book.");
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
        <label className="mb-1 block text-sm text-ivory/60">Subtitle</label>
        <p className="mb-1.5 text-xs text-ivory/40">Optional — shown under the title on the book page.</p>
        <input
          value={form.subtitle}
          onChange={(e) => update("subtitle", e.target.value)}
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

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm text-ivory/60">Page count</label>
          <p className="mb-1.5 text-xs text-ivory/40">Optional — shown in the book details on the page.</p>
          <input
            type="number"
            min="0"
            step="1"
            value={form.pageCount}
            onChange={(e) => update("pageCount", e.target.value)}
            className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm text-ivory/60">Published date</label>
          <p className="mb-1.5 text-xs text-ivory/40">Optional — only the year is shown to readers.</p>
          <input
            type="date"
            value={form.publishedAt}
            onChange={(e) => update("publishedAt", e.target.value)}
            className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500"
          />
        </div>
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
          <FileField
            label="Cover image"
            hint="JPG, PNG, or WebP."
            accept=".jpg,.jpeg,.png,.webp"
            file={cover}
            onChange={setCover}
            required
          />
          <FileField
            label="Book file"
            hint="PDF or EPUB — the full book readers get once they own it."
            accept=".pdf,.epub"
            file={bookFile}
            onChange={setBookFile}
            required
          />
          <FileField
            label="Sample file"
            hint='Optional. A shorter preview readers can open without buying, like Amazon\u2019s "Read sample."'
            accept=".pdf,.epub"
            file={sampleFile}
            onChange={setSampleFile}
          />
        </>
      )}

      {isEditing && (
        <>
          <div>
            <label className="mb-1 block text-sm text-ivory/60">Cover image</label>
            {currentCoverUrl && !cover && (
              <img
                src={currentCoverUrl}
                alt="Current cover"
                className="mb-2 h-32 w-auto rounded-md border border-navy-700 object-cover"
              />
            )}
            <FileField
              label={null}
              hint="Choosing a new image replaces the current cover when you save."
              accept=".jpg,.jpeg,.png,.webp"
              file={cover}
              onChange={setCover}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-ivory/60">Book file (manuscript)</label>
            <p className="mb-1.5 text-xs text-ivory/40">
              {currentBookFileType
                ? `Current file: ${currentBookFileType.toUpperCase()}. Choosing a new file replaces it when you save.`
                : "PDF or EPUB — the full book readers get once they own it. Choosing a new file replaces the current one when you save."}
            </p>
            <button
              type="button"
              onClick={handleDownloadFile}
              disabled={downloadingFile}
              className="mb-2 text-sm text-gold-400 hover:text-gold-300 disabled:opacity-50"
            >
              {downloadingFile ? "Getting link…" : "Download current file"}
            </button>
            <FileField accept=".pdf,.epub" file={bookFile} onChange={setBookFile} />
          </div>

          <FileField
            label="Sample file"
            hint={
              currentSampleType
                ? `Current sample: ${currentSampleType.toUpperCase()}. Choosing a new file replaces it when you save.`
                : 'Optional. Readers won\u2019t see a "Read sample" button until one is added.'
            }
            accept=".pdf,.epub"
            file={sampleFile}
            onChange={setSampleFile}
          />
        </>
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