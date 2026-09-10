import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import AdminBooks from "./admin/AdminBooks.jsx";
import AdminBookForm from "./admin/AdminBookForm.jsx";
import AdminOrders from "./admin/AdminOrders.jsx";

export default function AdminDashboard() {
  const tabClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm ${
      isActive ? "bg-gold-500 text-ink" : "text-ivory/70 hover:text-gold-400"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl text-ivory">Admin</h1>

      <nav className="mt-6 flex gap-2">
        <NavLink to="books" className={tabClass} end>
          Books
        </NavLink>
        <NavLink to="books/new" className={tabClass}>
          Add book
        </NavLink>
        <NavLink to="orders" className={tabClass}>
          Orders
        </NavLink>
      </nav>

      <div className="mt-8">
        <Routes>
          <Route index element={<Navigate to="books" replace />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="books/new" element={<AdminBookForm />} />
          <Route path="books/:id/edit" element={<AdminBookForm />} />
          <Route path="orders" element={<AdminOrders />} />
        </Routes>
      </div>
    </div>
  );
}
