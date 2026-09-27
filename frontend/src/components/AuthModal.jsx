import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import LoginForm from "./LoginForm.jsx";
import RegisterForm from "./RegisterForm.jsx";
import ForgotPasswordForm from "./ForgotPasswordForm.jsx";
import { useAuthModal } from "../context/AuthModalContext.jsx";

const TITLES = {
  login: "Sign in",
  register: "Create an account",
  forgot: "Reset your password",
};

/**
 * Mount this once, anywhere inside <AuthModalProvider> (App.jsx is fine).
 * It renders nothing until openLogin()/openRegister()/openForgot() from
 * useAuthModal() is called, e.g. from the "Sign in" button in Navbar.
 */
export default function AuthModal() {
  const { mode, close, openLogin, openRegister, openForgot } = useAuthModal();

  // Modal.jsx keeps animating for ~200ms after `open` goes false. `mode`
  // flips to null immediately on close, so without this the title/content
  // would flash to the default before the closing animation finishes.
  // Keep showing whatever was last open until the next one opens.
  const [lastMode, setLastMode] = useState(mode);
  useEffect(() => {
    if (mode) setLastMode(mode);
  }, [mode]);
  const displayMode = mode ?? lastMode ?? "login";

  return (
    <Modal open={mode !== null} onClose={close} title={TITLES[displayMode]}>
      {displayMode === "register" && (
        <RegisterForm onSuccess={close} onSwitchToLogin={openLogin} />
      )}
      {displayMode === "forgot" && <ForgotPasswordForm onBackToLogin={openLogin} />}
      {displayMode === "login" && (
        <LoginForm
          onSuccess={close}
          onSwitchToRegister={openRegister}
          onSwitchToForgot={openForgot}
        />
      )}
    </Modal>
  );
}