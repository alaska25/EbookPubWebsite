import { createContext, useContext, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("adyoolau_user");
    return stored ? JSON.parse(stored) : null;
  });

  const persist = (userData) => {
    localStorage.setItem("adyoolau_user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persist(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    persist(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("adyoolau_user");
    setUser(null);
  };

  // Merges partial fields (e.g. a new photoUrl after an avatar upload) into
  // the stored user instead of requiring a full re-login to pick up a change.
  const updateUser = (partial) => {
    persist({ ...user, ...partial });
  };

  // A superadmin can do everything an admin can, so isAdmin stays true for
  // both roles — existing admin-only UI (like the Admin nav link) keeps
  // working unchanged for superadmins too.
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin" || isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, isAdmin, isSuperAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);