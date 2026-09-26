import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";

const ROLES = ["user", "admin", "superadmin"];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/users/admins")
      .then(({ data }) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Could not load admins.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setError("");
    setSavingId(userId);
    const prevUsers = users;
    setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));

    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
    } catch (err) {
      setUsers(prevUsers);
      setError(err.response?.data?.message || "Could not update role.");
    } finally {
      setSavingId(null);
    }
  };

  const handleStatusToggle = async (userId, currentlyActive) => {
    setError("");
    setSavingId(userId);
    const prevUsers = users;
    const nextActive = !currentlyActive;
    setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive: nextActive } : u)));

    try {
      await api.put(`/users/${userId}/status`, { isActive: nextActive });
    } catch (err) {
      setUsers(prevUsers);
      setError(err.response?.data?.message || "Could not update status.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <p className="text-ivory/50">Loading admins…</p>;

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="divide-y divide-navy-700/60 overflow-hidden rounded-lg border border-navy-700/60">
        {users.map((u) => {
          const isSelf = u._id === currentUser?._id;
          const active = u.isActive !== false;
          return (
            <div
              key={u._id}
              className={`flex flex-wrap items-center gap-3 bg-navy-900 px-4 py-3 sm:flex-nowrap sm:gap-4 ${
                active ? "" : "opacity-60"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm text-ivory">{u.name}</p>
                  {!active && (
                    <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-400">
                      Deactivated
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-ivory/50">{u.email}</p>
              </div>

              <select
                value={u.role}
                disabled={isSelf || savingId === u._id}
                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                aria-label={`Role for ${u.name}`}
                className="rounded-full border border-navy-700 bg-navy-800 px-3 py-1.5 text-sm text-ivory disabled:opacity-50"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleStatusToggle(u._id, active)}
                disabled={isSelf || savingId === u._id}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
                  active
                    ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
                    : "border-navy-700 text-ivory/70 hover:border-gold-500 hover:text-gold-400"
                }`}
              >
                {active ? "Deactivate" : "Activate"}
              </button>

              {isSelf && <span className="text-xs text-ivory/40">(you)</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}