import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";

const emptyForm = {
  title: "",
  tagline: "",
  description: "",
  category: "",
  techStack: "",
  version: "",
  repoUrl: "",
  liveDemoUrl: "",
  price: "",
  isFree: false,
  featured: false,
};

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

async function uploadFile(url, fieldName, file, setError, failureNote) {
  try {
    const data = new FormData();
    data.append(fieldName, file);
    await api.post(url, data, { headers: { "Content-Type": "multipart/form-data" } });
    return true;
  } catch (err) {
    setError((err.response?.data?.message || failureNote) + " The rest of the template's details were saved.");
    return false;
  }
}

export default function AdminTemplateForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [cover, setCover] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEditing) return;
    api.get(`/templates/${id}`).then(({ data }) => {
      setForm({
        title: data.title,
        tagline: data.tagline || "",
        description: data.description,
        category: data.category,
        techStack: (data.techStack || []).join(", "),
        version: data.version || "",
        repoUrl: data.repoUrl || "",
        liveDemoUrl: data.liveDemoUrl || "",
        price: data.price,
        isFree: data.isFree,
        featured: data.featured,
      });
      setCurrentCoverUrl(data.coverUrl || null);
    });
  }, [id, isEditing]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleDownloadFile = async () => {
    setDownloadingFile(true);
    try {
      const { data } = await api.get(`/templates/${id}/file`);
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
        try {
          await api.put(`/templates/${id}`, form);
        } catch (err) {
          setError(err.response?.data?.message || "Could not save the template's details.");
          setSaving(false);
          return;
        }

        if (cover) {
          const ok = await uploadFile(`/templates/${id}/cover`, "cover", cover, setError, "Could not upload the cover image.");
          if (!ok) { setSaving(false); return; }
        }

        if (templateFile) {
          const ok = await uploadFile(`/templates/${id}/file`, "templateFile", templateFile, setError, "Could not upload the template file.");
          if (!ok) { setSaving(false); return; }
        }
      } else {
        if (!cover || !templateFile) {
          setError("Both a cover image and a template zip are required.");
          setSaving(false);
          return;
        }
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        data.append("cover", cover);
        data.append("templateFile", templateFile);
        await api.post("/templates", data, { headers: { "Content-Type": "multipart/form-data" } });
      }

      setSuccess(true);
      setSaving(false);
      setTimeout(() => navigate("/admin/templates"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the template.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <h2 className="font-display text-xl text-ivory">{isEditing ? "Edit template" : "Add a new template"}</h2>

      {success && (
        <div className="flex items-center gap-2 rounded-md border border-[#22c55e]/30 bg-[#22c55e]/10 px-4 py-3 text-sm text-[#22c55e]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {isEditing ? "Template updated successfully." : "Template uploaded successfully."}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Title</label>
        <input required value={form.title} onChange={(e) => update("title", e.target.value)}
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500" />
      </div>

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Tagline</label>
        <p className="mb-1.5 text-xs text-ivory/40">Optional — shown under the title on the template page.</p>
        <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)}
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500" />
      </div>

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Description</label>
        <textarea required rows={4} value={form.description} onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500" />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm text-ivory/60">Category</label>
          <input required value={form.category} onChange={(e) => update("category", e.target.value)}
            className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm text-ivory/60">Version</label>
          <p className="mb-1.5 text-xs text-ivory/40">Optional, e.g. 1.2.0</p>
          <input value={form.version} onChange={(e) => update("version", e.target.value)}
            className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Tech stack</label>
        <p className="mb-1.5 text-xs text-ivory/40">Comma-separated, e.g. MERN, Stripe, Tailwind</p>
        <input value={form.techStack} onChange={(e) => update("techStack", e.target.value)}
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500" />
      </div>

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Live demo URL</label>
        <p className="mb-1.5 text-xs text-ivory/40">Optional — link to a hosted, interactive preview.</p>
        <input type="url" value={form.liveDemoUrl} onChange={(e) => update("liveDemoUrl", e.target.value)}
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500" />
      </div>

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Repo URL</label>
        <p className="mb-1.5 text-xs text-ivory/40">Optional — a public preview repo, separate from the paid zip.</p>
        <input type="url" value={form.repoUrl} onChange={(e) => update("repoUrl", e.target.value)}
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500" />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-ivory/70">
          <input type="checkbox" checked={form.isFree} onChange={(e) => update("isFree", e.target.checked)} />
          This template is free
        </label>
        <label className="flex items-center gap-2 text-sm text-ivory/70">
          <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
          Featured
        </label>
      </div>

      {!form.isFree && (
        <div>
          <label className="mb-1 block text-sm text-ivory/60">Price (USD)</label>
          <input type="number" min="0" step="0.01" required={!form.isFree} value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500" />
        </div>
      )}

      {!isEditing && (
        <>
          <FileField label="Cover image" hint="Screenshot of the template's homepage or dashboard." accept=".jpg,.jpeg,.png,.webp" file={cover} onChange={setCover} required />
          <FileField label="Template file" hint="A .zip of the full source code buyers get after purchase." accept=".zip" file={templateFile} onChange={setTemplateFile} required />
        </>
      )}

      {isEditing && (
        <>
          <div>
            <label className="mb-1 block text-sm text-ivory/60">Cover image</label>
            {currentCoverUrl && !cover && (
              <img src={currentCoverUrl} alt="Current cover" className="mb-2 h-32 w-auto rounded-md border border-navy-700 object-cover" />
            )}
            <FileField label={null} hint="Choosing a new image replaces the current cover when you save." accept=".jpg,.jpeg,.png,.webp" file={cover} onChange={setCover} />
          </div>

          <div>
            <label className="mb-1 block text-sm text-ivory/60">Template zip</label>
            <p className="mb-1.5 text-xs text-ivory/40">Choosing a new file replaces the current one when you save.</p>
            <button type="button" onClick={handleDownloadFile} disabled={downloadingFile}
              className="mb-2 text-sm text-gold-400 hover:text-gold-300 disabled:opacity-50">
              {downloadingFile ? "Getting link…" : "Download current file"}
            </button>
            <FileField accept=".zip" file={templateFile} onChange={setTemplateFile} />
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={saving || success}
        className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50">
        {saving ? "Saving…" : isEditing ? "Save changes" : "Add template"}
      </button>
    </form>
  );
}