import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { pushToast } from "../utils/toastStore.js";
import Avatar from "../components/Avatar.jsx";
import BackButton from "../components/BackButton.jsx";

// Success and error toasts for these calls come from the axios interceptor
// (see describeAction in api/axios.js), so this page only handles its own state.

const TABS = [
  ["profile", "Profile"],
  ["orders", "Orders"],
  ["security", "Security"],
];

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const inputCls =
  "h-12 w-full rounded-xl border border-navy-700 bg-navy-900 px-4 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/15";
const btnPrimary =
  "rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "rounded-full border border-navy-700 px-5 py-2.5 text-sm font-medium text-ivory/80 hover:border-gold-500/60 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50";

/* ------------------------------ Profile ------------------------------ */

function ProfileTab() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const saveName = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.patch("/account/profile", { name });
      updateUser({ name: data.name });
    } catch {
      /* the interceptor already showed the error toast */
    } finally {
      setBusy(false);
    }
  };

  // Reuses the same endpoint the admin dashboard uses for its photo.
  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again later
    if (!file) return;
    if (!/^image\/(jpeg|png)$/.test(file.type)) {
      pushToast({ type: "error", message: "Please choose a JPG or PNG image." });
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const { data } = await api.post("/auth/photo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser({ photoUrl: data.photoUrl });
    } catch {
      /* the interceptor already showed the error toast */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5">
        <Avatar user={user} size={88} />
        <div>
          <button type="button" className={btnGhost} disabled={busy} onClick={() => fileRef.current?.click()}>
            {user?.photoUrl ? "Change photo" : "Upload photo"}
          </button>
          <p className="mt-2 text-xs text-ivory/50">JPG or PNG.</p>
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={pickFile} />
        </div>
      </div>

      <form onSubmit={saveName} className="max-w-md space-y-4">
        <div>
          <label htmlFor="acc-name" className="mb-1.5 block text-sm text-ivory/70">Name</label>
          <input id="acc-name" className={inputCls} value={name} maxLength={80} required onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="acc-email" className="mb-1.5 block text-sm text-ivory/70">Email</label>
          <input id="acc-email" className={`${inputCls} opacity-60`} value={user?.email || ""} disabled readOnly />
        </div>
        <button type="submit" className={btnPrimary} disabled={busy || !name.trim() || name.trim() === user?.name}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------ Orders ------------------------------- */

function OrdersTab() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/account/orders", { silent: true })
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Could not load your orders."));
  }, []);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!orders) return <p className="text-sm text-ivory/50">Loading…</p>;
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-700 px-6 py-12 text-center">
        <p className="font-display text-lg text-ivory">No orders yet</p>
        <p className="mt-1 text-sm text-ivory/60">Your purchases will show up here.</p>
        <Link to="/catalog" className={`${btnPrimary} mt-5 inline-block`}>Browse the catalog</Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o._id} className="rounded-2xl border border-navy-700/60 bg-navy-900/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-ivory/60">
              {fmtDate(o.createdAt)} · Order #{o.receiptNo}
            </span>
            <span className="font-display text-lg text-ivory">{money(o.totalAmount)}</span>
          </div>
          {o.status === "pending_review" && (
            <p className="mt-2 text-xs text-gold-400">Payment is being reviewed by PayPal.</p>
          )}
          <ul className="mt-3 divide-y divide-navy-700/60">
            {o.items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5">
                {it.coverUrl ? (
                  <img src={it.coverUrl} alt="" className="h-12 w-9 shrink-0 rounded object-cover" />
                ) : (
                  <div className="h-12 w-9 shrink-0 rounded bg-navy-800" />
                )}
                <span className="min-w-0 flex-1 truncate text-ivory">{it.title}</span>
                {it.kind === "template" && (
                  <span className="shrink-0 rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold-400">
                    Template
                  </span>
                )}
                <span className="shrink-0 text-sm text-ivory/60">{money(it.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-4 text-sm">
            <Link to={`/account/orders/${o._id}/receipt`} className="text-gold-400 hover:text-gold-300">
              View receipt
            </Link>
            <Link to="/library" className="text-ivory/60 hover:text-ivory">Go to My Library</Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------- Security ------------------------------ */

function SecurityTab({ hasPassword }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!hasPassword) {
    return (
      <p className="max-w-md text-sm text-ivory/70">
        This account signs in with Google, so there is no password to manage here.
      </p>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      pushToast({ type: "error", message: "The new passwords do not match." });
      return;
    }
    setBusy(true);
    try {
      await api.post("/account/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch {
      /* the interceptor already showed the error toast */
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="pw-cur" className="mb-1.5 block text-sm text-ivory/70">Current password</label>
        <input id="pw-cur" type="password" autoComplete="current-password" className={inputCls} value={form.currentPassword} onChange={set("currentPassword")} required />
      </div>
      <div>
        <label htmlFor="pw-new" className="mb-1.5 block text-sm text-ivory/70">New password</label>
        <input id="pw-new" type="password" autoComplete="new-password" minLength={8} className={inputCls} value={form.newPassword} onChange={set("newPassword")} required />
        <p className="mt-1 text-xs text-ivory/50">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="pw-conf" className="mb-1.5 block text-sm text-ivory/70">Confirm new password</label>
        <input id="pw-conf" type="password" autoComplete="new-password" className={inputCls} value={form.confirm} onChange={set("confirm")} required />
      </div>
      <button type="submit" className={btnPrimary} disabled={busy}>
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

/* ------------------------------- Page -------------------------------- */

export default function Account() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([id]) => id === params.get("tab")) ? params.get("tab") : "profile";
  const [hasPassword, setHasPassword] = useState(null); // null while loading

  // Only used to learn whether this account has a password (Google-only accounts do not).
  useEffect(() => {
    api
      .get("/account/me", { silent: true })
      .then(({ data }) => setHasPassword(Boolean(data.hasPassword)))
      .catch(() => setHasPassword(true));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Back on the left; a quiet icon-only Home shortcut on the right,
          matching the book and template detail pages. */}
      <div className="mb-6 flex items-center justify-between">
        <BackButton fallback="/" />
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
      <h1 className="font-display text-3xl text-ivory">Your account</h1>

      <div role="tablist" className="mt-6 flex gap-2 border-b border-navy-700/60">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setParams({ tab: id })}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === id ? "border-gold-500 text-gold-400" : "border-transparent text-ivory/60 hover:text-ivory"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8" role="tabpanel">
        {tab === "profile" && <ProfileTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "security" &&
          (hasPassword === null ? <p className="text-sm text-ivory/50">Loading…</p> : <SecurityTab hasPassword={hasPassword} />)}
      </div>
    </div>
  );
}