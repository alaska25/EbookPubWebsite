import { createContext, lazy, Suspense, useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from "./Modal.jsx";

// Pages that open as a modal. Adjust these import paths and filenames to
// match your project; each page must be the default export of its file.
// They load only the first time they're opened.
const PAGES = {
  "/about": { label: "About", component: lazy(() => import("../pages/About.jsx")) },
  "/contact": { label: "Contact", component: lazy(() => import("../pages/Contact.jsx")) },
  "/refund-policy": {
    label: "Refund Policy",
    component: lazy(() => import("../pages/RefundPolicy.jsx")),
  },
  "/terms": { label: "Terms of Service", component: lazy(() => import("../pages/Terms.jsx")) },
  "/privacy-policy": {
    label: "Privacy Policy",
    component: lazy(() => import("../pages/PrivacyPolicy.jsx")),
  },
};

// The mounted <InfoModalHost /> registers itself here. If no host is
// mounted, InfoLink behaves like a normal <Link>, so it can never break
// navigation.
let openHandler = null;

// Lets page content (About.jsx, Contact.jsx, ...) know whether it's being
// rendered inside the modal, and if so, how to close it. When a page is
// visited directly (no host mounted, or opened outside the modal flow),
// this is null and BackHome falls back to a real navigation.
const InfoModalContext = createContext(null);

/**
 * Mount ONCE (the Footer does this). Renders the modal and listens for
 * InfoLink clicks from anywhere on the page.
 */
export function InfoModalHost() {
  // `active` keeps the last opened page so its title and content stay
  // visible while the modal animates out; `open` controls visibility.
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const close = () => setOpen(false);

  useEffect(() => {
    openHandler = (to) => {
      const page = PAGES[to];
      if (!page) return false;
      setActive(page);
      setOpen(true);
      return true;
    };
    return () => {
      openHandler = null;
    };
  }, []);

  // If something inside the modal navigates to a genuinely different page,
  // close it. (Closing "Back home" itself no longer depends on this — see
  // the context below — but this still covers e.g. clicking a real link
  // inside the page content to some other route.)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const ActiveContent = active?.component;

  return (
    <Modal open={open} onClose={close} title={active?.label}>
      <InfoModalContext.Provider value={{ close }}>
        <Suspense fallback={<p className="text-ivory/60">Loading…</p>}>
          {ActiveContent && <ActiveContent />}
        </Suspense>
      </InfoModalContext.Provider>
    </Modal>
  );
}

/**
 * Drop-in replacement for <Link>. Opens known info pages as a modal on a
 * normal click; ctrl/cmd/shift/middle-click still opens the real page.
 */
export function InfoLink({ to, onClick, ...props }) {
  const handleClick = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (typeof to === "string" && openHandler?.(to)) e.preventDefault();
  };

  return <Link to={to} onClick={handleClick} {...props} />;
}

/**
 * Drop this into About.jsx, Contact.jsx, etc. in place of a hardcoded
 * `<Link to="/">← Back home</Link>`.
 *
 * Inside the modal, it closes the modal directly — this is the fix: a plain
 * <Link to="/"> does nothing when you're already on "/", which is exactly
 * what happens when these pages are opened from the footer on the homepage.
 * Outside the modal (page visited directly at its own URL, if your router
 * also registers one), it falls back to a real navigation to "/".
 */
export function BackHome({ children = "← Back home", className }) {
  const modal = useContext(InfoModalContext);
  const navigate = useNavigate();

  if (modal) {
    return (
      <button type="button" onClick={modal.close} className={className}>
        {children}
      </button>
    );
  }

  return (
    <Link to="/" onClick={() => navigate("/")} className={className}>
      {children}
    </Link>
  );
}