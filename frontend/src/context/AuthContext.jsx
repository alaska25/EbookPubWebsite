import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axios.js";
import { pushToast } from "../utils/toastStore.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("adyoolau_user");
    return stored ? JSON.parse(stored) : null;
  });

  const persist = useCallback((userData) => {
    localStorage.setItem("adyoolau_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post("/auth/login", { email, password });
      persist(data);
      return data;
    },
    [persist]
  );

  // Completes sign-in using the ID token from Google Identity Services
  // (see components/GoogleLoginButton.jsx). The backend verifies the token,
  // finds-or-creates the matching user, and returns the same shape as
  // login()/register(), so this can be used identically once it resolves.
  // Marked silent so the axios interceptor's generic "Created successfully"
  // toast doesn't fire alongside the specific one pushed below.
  const googleLogin = useCallback(
    async (credential) => {
      const { data } = await api.post("/auth/google", { credential }, { silent: true });
      persist(data);
      pushToast({ type: "success", message: "Logged in successfully" });
      return data;
    },
    [persist]
  );

  const register = useCallback(
    async (name, email, password, captchaToken) => {
      const { data } = await api.post("/auth/register", { name, email, password, captchaToken });
      persist(data);
      return data;
    },
    [persist]
  );

  // Requests a reset email. Does not log the user in or touch stored auth
  // state — the backend should respond the same way whether or not the
  // email exists, so this never reveals which emails are registered.
  const forgotPassword = useCallback(async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  }, []);

  // Completes a reset using the token from the emailed link.
  const resetPassword = useCallback(async (token, password) => {
    const { data } = await api.post("/auth/reset-password", { token, password });
    return data;
  }, []);

  // Logout is purely client-side (no API call), so it can't be caught by
  // the axios response interceptor — the toast is pushed here directly.
  const logout = useCallback(() => {
    localStorage.removeItem("adyoolau_user");
    setUser(null);
    pushToast({ type: "success", message: "Logged out successfully" });
  }, []);

  // Merges partial fields (e.g. a new photoUrl after an avatar upload) into
  // the stored user instead of requiring a full re-login to pick up a change.
  const updateUser = useCallback(
    (partial) => {
      persist({ ...user, ...partial });
    },
    [persist, user]
  );

  // A superadmin can do everything an admin can, so isAdmin stays true for
  // both roles — existing admin-only UI (like the Admin nav link) keeps
  // working unchanged for superadmins too.
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin" || isSuperAdmin;

  // Without this, a new object is created on every render of AuthProvider,
  // which is high up the tree — that alone was enough to make every
  // consumer (including GoogleLoginButton's effect deps) think `googleLogin`
  // and friends had changed, even though their actual behavior never did.
  const value = useMemo(
    () => ({
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
    }),
    [user, login, googleLogin, register, forgotPassword, resetPassword, logout, updateUser, isAdmin, isSuperAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);