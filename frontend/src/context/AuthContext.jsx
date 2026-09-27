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

  // Completes sign-in using the ID token from Google Identity Services
  // (see components/GoogleLoginButton.jsx). The backend verifies the token,
  // finds-or-creates the matching user, and returns the same shape as
  // login()/register(), so this can be used identically once it resolves.
  const googleLogin = async (credential) => {
    const { data } = await api.post("/auth/google", { credential });
    persist(data);
    return data;
  };

  const register = async (name, email, password, captchaToken) => {
    const { data } = await api.post("/auth/register", { name, email, password, captchaToken });
    persist(data);
    return data;
  };

  // Requests a reset email. Does not log the user in or touch stored auth
  // state — the backend should respond the same way whether or not the
  // email exists, so this never reveals which emails are registered.
  const forgotPassword = async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  };

  // Completes a reset using the token from the emailed link.
  const resetPassword = async (token, password) => {
    const { data } = await api.post("/auth/reset-password", { token, password });
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
      value={{
        user,
        login,
        googleLogin,
        register,
        forgotPassword,
        resetPassword,
        logout,
        updateUser,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);