import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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

  // If something inside the modal navigates elsewhere, close it.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const ActiveContent = active?.component;

  return (
    <Modal open={open} onClose={() => setOpen(false)} title={active?.label}>
      <Suspense fallback={<p className="text-ivory/60">Loading…</p>}>
        {ActiveContent && <ActiveContent />}
      </Suspense>
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