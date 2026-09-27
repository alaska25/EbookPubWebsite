import { useRef, useState } from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import AdminDashboardHome from "./admin/AdminDashboardHome.jsx";
import AdminBooks from "./admin/AdminBooks.jsx";
import AdminBookForm from "./admin/AdminBookForm.jsx";
import AdminTemplates from "./admin/AdminTemplates.jsx";
import AdminTemplateForm from "./admin/AdminTemplateForm.jsx";
import AdminOrders from "./admin/AdminOrders.jsx";
import AdminUsers from "./admin/AdminUsers.jsx";
import AdminCustomers from "./admin/AdminCustomers.jsx";

export default function AdminDashboard() {
  const { isSuperAdmin, user, updateUser } = useAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;

    setPhotoError("");
    setUploadingPhoto(true);
    try {
      const data = new FormData();
      data.append("photo", file);
      const { data: result } = await api.post("/auth/photo", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser({ photoUrl: result.photoUrl });
    } catch (err) {
      setPhotoError(err.response?.data?.message || "Could not upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const tabClass = ({ isActive }) =>
    `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-gold-500 text-ink" : "text-ivory/60 hover:text-ivory"
    }`;

  const defaultTab = isSuperAdmin ? "dashboard" : "books";

  const heading = isSuperAdmin
    ? `${user?.name ?? "CEO"} · CEO Dashboard`
    : `${user?.name ?? "Admin"} · Admin`;

  return (
    // No local data-theme override here anymore — this section now follows
    // whatever theme is set on <html> by ThemeContext, so the light/dark
    // toggle applies across the whole page, admin area included.
    <div className="min-h-screen bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center gap-4">
          {/* Clicking the avatar opens the file picker directly — no
              separate "upload" button needed for a single, obvious action. */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-navy-700/60 bg-navy-900 disabled:opacity-60"
            aria-label="Change profile photo"
          >
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-xl text-ivory/40">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-ink/70 text-xs font-medium text-ivory opacity-0 transition-opacity group-hover:opacity-100">
              {uploadingPhoto ? "Uploading…" : "Change"}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <h1 className="font-display text-3xl tracking-tight text-ivory">{heading}</h1>
        </div>
        {photoError && <p className="mt-2 text-sm text-red-400">{photoError}</p>}
        {/* Same hairline gold gradient used under the footer's top edge —
            the one recurring accent line, not a new decorative device. */}
        <div className="mt-6 h-px w-full bg-gradient-to-r from-gold-500/60 via-gold-500/20 to-transparent" />

        <nav className="mt-6 flex flex-wrap gap-1 rounded-full border border-navy-700/60 bg-navy-900/60 p-1 w-fit">
          {isSuperAdmin && (
            <NavLink to="dashboard" className={tabClass} end>
              Dashboard
            </NavLink>
          )}
          <NavLink to="books" className={tabClass} end>
            Books
          </NavLink>
          <NavLink to="books/new" className={tabClass} end>
            Add book
          </NavLink>
          <NavLink to="templates" className={tabClass} end>
            Templates
          </NavLink>
          <NavLink to="templates/new" className={tabClass} end>
            Add template
          </NavLink>
          <NavLink to="orders" className={tabClass} end>
            Orders
          </NavLink>
          {isSuperAdmin && (
            <NavLink to="admins" className={tabClass} end>
              Admins
            </NavLink>
          )}
          {isSuperAdmin && (
            <NavLink to="customers" className={tabClass} end>
              Customers
            </NavLink>
          )}
        </nav>

        <div className="mt-8">
          <Routes>
            <Route index element={<Navigate to={defaultTab} replace />} />
            {isSuperAdmin && <Route path="dashboard" element={<AdminDashboardHome />} />}
            <Route path="books" element={<AdminBooks />} />
            <Route path="books/new" element={<AdminBookForm />} />
            <Route path="books/:id/edit" element={<AdminBookForm />} />
            <Route path="templates" element={<AdminTemplates />} />
            <Route path="templates/new" element={<AdminTemplateForm />} />
            <Route path="templates/:id/edit" element={<AdminTemplateForm />} />
            <Route path="orders" element={<AdminOrders />} />
            {isSuperAdmin && <Route path="admins" element={<AdminUsers />} />}
            {isSuperAdmin && <Route path="customers" element={<AdminCustomers />} />}
          </Routes>
        </div>
      </div>
    </div>
  );
}