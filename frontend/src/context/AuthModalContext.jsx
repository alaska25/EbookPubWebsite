import { createContext, useCallback, useContext, useState } from "react";

const AuthModalContext = createContext(null);

/**
 * Tracks which auth modal is open: null (closed), "login", "register", or
 * "forgot". Mount <AuthModalProvider> once near the root, above <Navbar>
 * and <AuthModal>, so both can share the same state.
 */
export function AuthModalProvider({ children }) {
  const [mode, setMode] = useState(null);

  const openLogin = useCallback(() => setMode("login"), []);
  const openRegister = useCallback(() => setMode("register"), []);
  const openForgot = useCallback(() => setMode("forgot"), []);
  const close = useCallback(() => setMode(null), []);

  return (
    <AuthModalContext.Provider
      value={{ mode, openLogin, openRegister, openForgot, close }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export const useAuthModal = () => useContext(AuthModalContext);