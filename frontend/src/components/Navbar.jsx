import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuthModal } from "../context/AuthModalContext.jsx";
import Avatar from "./Avatar.jsx";
import logo from "../assets/logo.png";

const LANGUAGES = [
  { code: "en", label: "EN", flag: "🇺🇸", name: "English" },
  { code: "es", label: "ES", flag: "🇪🇸", name: "Español" },
  { code: "pt", label: "PT", flag: "🇧🇷", name: "Português" },
  { code: "ja", label: "JA", flag: "🇯🇵", name: "日本語" },
];

// Inline icons (no icon library needed).
const icons = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  cart: <><circle cx="9" cy="20" r="1.2" /><circle cx="18" cy="20" r="1.2" /><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21 7H6" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  check: <path d="M5 13l4 4L19 7" />,
  logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  catalog: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  templates: <><rect x="3.5" y="4" width="17" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  library: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
  admin: <><path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z" /></>,
};

const Icon = ({ name, className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {icons[name]}
  </svg>
);

const navIconFor = (to) =>
  to === "/catalog" ? "catalog" : to === "/templates" ? "templates" : to === "/library" ? "library" : to === "/admin" ? "admin" : "catalog";

// Shared styles, all built from your theme tokens (ink / navy / ivory / gold).
const ring = "outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink";
const iconBtn = `relative grid h-10 w-10 place-items-center rounded-full text-ivory/70 transition hover:bg-ivory/10 hover:text-ivory ${ring}`;
const pill = `rounded-full px-3.5 py-2 text-sm font-medium transition ${ring}`;
const pillIdle = "text-ivory/70 hover:bg-ivory/10 hover:text-ivory";
const pillActive = "bg-ivory/10 text-gold-400";
const popover = "absolute right-0 top-full z-50 mt-2 min-w-52 overflow-hidden rounded-2xl border border-navy-700 bg-navy-900 p-1.5 shadow-xl shadow-black/30";
const menuItem = "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-ivory/80 transition hover:bg-navy-700/50 hover:text-ivory";
// Mobile panel building blocks: every section is a card with a consistent
// border/radius so the panel reads as one coherent design, not stacked lists.
const mSection = "rounded-2xl border border-navy-700/60 bg-navy-900/40 p-1.5";
const mSectionLabel = "px-2.5 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ivory/40";
const mNavLink = `flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition ${ring}`;

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { openLogin } = useAuthModal();
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(null); // null | "lang" | "user"
  const [menuOpen, setMenuOpen] = useState(false); // mobile panel
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActiveLang = (code) => i18n.language === code || i18n.language?.startsWith(code);
  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language) ??
    LANGUAGES.find((l) => i18n.language?.startsWith(l.code)) ??
    LANGUAGES[0];
  const dark = theme === "dark";
  const themeLabel = dark ? t("nav.switchToLight", "Switch to light mode") : t("nav.switchToDark", "Switch to dark mode");

  const links = isAdmin
    ? [{ to: "/admin", label: t("nav.admin") }]
    : [
        { to: "/catalog", label: t("nav.catalog") },
        { to: "/templates", label: t("nav.templates") },
        ...(user ? [{ to: "/library", label: t("nav.myLibrary") }] : []),
      ];
  // Falls back to a plain label if a translation key is missing, so the UI
  // never shows a raw key like "nav.account" to the user.
  const accountLabel = t("nav.account", "Account");
  const accountItems = isAdmin ? [] : [{ to: "/account", label: accountLabel }];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setMenu(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenu(null);
        setMenuOpen(false);
      } else if (
        e.key === "/" &&
        searchRef.current &&
        !/^(input|textarea|select)$/i.test(e.target.tagName) &&
        !e.target.isContentEditable
      ) {
        e.preventDefault();
        searchRef.current.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Close menus after navigating.
  useEffect(() => {
    setMenu(null);
    setMenuOpen(false);
  }, [pathname]);

  // Lock page scroll while the mobile panel is open, so the panel itself
  // scrolls instead of the page behind it.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/catalog?search=${encodeURIComponent(query.trim())}` : "/catalog");
    setMenuOpen(false);
  };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setMenu(null);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setMenu(null);
    setMenuOpen(false);
    logout();
  };

  const handleSignIn = () => {
    setMenuOpen(false);
    openLogin();
  };

  const searchForm = (ref) => (
    <form onSubmit={handleSearch} role="search" className="group relative">
      <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
      <input
        ref={ref}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("nav.searchPlaceholder")}
        aria-label={t("nav.searchPlaceholder")}
        className="h-10 w-full rounded-full border border-navy-700 bg-navy-900 pl-10 pr-10 text-sm text-ivory outline-none transition placeholder:text-ivory/40 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-navy-700 px-1.5 text-[11px] text-ivory/40 group-focus-within:hidden lg:block">/</kbd>
    </form>
  );

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 border-b border-navy-700/60 bg-ink/80 backdrop-blur-xl transition-shadow ${scrolled ? "shadow-lg shadow-black/10" : ""}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6 lg:gap-6">
        {/* Brand */}
        <Link to="/" className={`flex shrink-0 items-center gap-3 rounded-full pr-2 ${ring}`}>
          <img src={logo} alt="Adyoolau" className="h-10 w-10 rounded-full" />
          <span className="font-display text-xl tracking-wide text-ivory">Adyoolau</span>
        </Link>

        {/* Desktop links */}
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `${pill} ${isActive ? pillActive : pillIdle}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop search (hidden for admins, as before) */}
        {!isAdmin && (
          <div className="hidden flex-1 md:block">
            <div className="mx-auto w-full max-w-md">{searchForm(searchRef)}</div>
          </div>
        )}

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* Language (desktop) */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setMenu(menu === "lang" ? null : "lang")}
              aria-label="Change language"
              aria-haspopup="listbox"
              aria-expanded={menu === "lang"}
              className={`${iconBtn} w-auto gap-1.5 px-3 text-xs font-medium tracking-wide`}
            >
              <span className="text-base leading-none">{currentLang.flag}</span>
              {currentLang.label}
              <Icon name="chevron" className={`h-3.5 w-3.5 text-ivory/40 transition-transform ${menu === "lang" ? "rotate-180" : ""}`} />
            </button>
            {menu === "lang" && (
              <div role="listbox" className={`${popover} w-48`}>
                {LANGUAGES.map((lang) => {
                  const active = isActiveLang(lang.code);
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => changeLanguage(lang.code)}
                      className={`${menuItem} ${active ? "text-gold-400" : ""}`}
                    >
                      <span className="text-base leading-none">{lang.flag}</span>
                      <span className="flex-1">{lang.name}</span>
                      {active && <Icon name="check" className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Theme (desktop) */}
          <button type="button" onClick={toggleTheme} aria-label={themeLabel} className={`${iconBtn} hidden md:grid`}>
            <Icon name={dark ? "sun" : "moon"} />
          </button>

          {/* Cart: one link for every screen size, so [data-cart-target] is always visible */}
          {!isAdmin && (
            <Link
              to="/cart"
              data-cart-target
              aria-label={`${t("nav.cart")}${items.length ? ` (${items.length})` : ""}`}
              className={iconBtn}
            >
              <Icon name="cart" />
              {items.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold-500 px-1 text-[11px] font-semibold text-ink">
                  {items.length > 99 ? "99+" : items.length}
                </span>
              )}
            </Link>
          )}

          {/* Account (desktop) */}
          <div className="relative ml-1 hidden md:block">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setMenu(menu === "user" ? null : "user")}
                  aria-haspopup="menu"
                  aria-expanded={menu === "user"}
                  aria-label={accountLabel}
                  title={user.name || accountLabel}
                  className={`flex items-center gap-1 rounded-full p-0.5 pr-1.5 transition hover:bg-ivory/10 ${ring}`}
                >
                  <Avatar user={user} size={34} />
                  <Icon name="chevron" className="h-3.5 w-3.5 text-ivory/40" />
                </button>
                {menu === "user" && (
                  <div role="menu" className={popover}>
                    <div className="px-3 pb-2 pt-1.5">
                      <p className="truncate text-sm font-semibold text-ivory">{user.name}</p>
                      {user.email && <p className="truncate text-xs text-ivory/50">{user.email}</p>}
                    </div>
                    <div className="my-1 border-t border-navy-700/60" />
                    {accountItems.map((m) => (
                      <Link key={m.to} to={m.to} role="menuitem" className={menuItem}>
                        {m.label}
                      </Link>
                    ))}
                    <button type="button" role="menuitem" onClick={handleLogout} className={menuItem}>
                      <Icon name="logout" className="h-4 w-4" />
                      {t("nav.logOut")}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className={`rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-400 ${ring}`}
              >
                {t("nav.signIn")}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={`${iconBtn} md:hidden`}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {/* Mobile panel — a scrollable sheet of distinct, bordered sections
          instead of a flat list, so related controls read as one group. */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="flex max-h-[calc(100dvh-4rem)] flex-col gap-3 overflow-y-auto border-t border-navy-700/60 bg-ink px-4 pb-6 pt-4 md:hidden"
        >
          {!isAdmin && searchForm()}

          <nav aria-label="Mobile" className={mSection}>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `${mNavLink} ${isActive ? "bg-gold-500/10 text-gold-400" : "text-ivory/80 hover:bg-navy-700/50 hover:text-ivory"}`}
              >
                <Icon name={navIconFor(l.to)} className="h-5 w-5 shrink-0 opacity-80" />
                <span className="flex-1">{l.label}</span>
                <Icon name="chevronRight" className="h-4 w-4 shrink-0 text-ivory/30" />
              </NavLink>
            ))}
          </nav>

          <div className={mSection}>
            <p className={mSectionLabel}>{t("nav.language")}</p>
            <div className="flex flex-wrap gap-1.5 p-1.5 pt-0">
              {LANGUAGES.map((lang) => {
                const active = isActiveLang(lang.code);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => changeLanguage(lang.code)}
                    aria-pressed={active}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${ring} ${
                      active ? "border-gold-500 bg-gold-500/10 text-gold-400" : "border-navy-700 text-ivory/70 hover:border-navy-700/100"
                    }`}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mx-1.5 border-t border-navy-700/60" />
            <button type="button" onClick={toggleTheme} className={`${mNavLink} w-full text-ivory/80 hover:bg-navy-700/50 hover:text-ivory`}>
              <Icon name={dark ? "sun" : "moon"} className="h-5 w-5 shrink-0 opacity-80" />
              <span className="flex-1 text-left">{themeLabel}</span>
            </button>
          </div>

          <div className={mSection}>
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-xl p-2.5">
                  <Avatar user={user} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ivory">{user.name}</p>
                    {user.email && <p className="truncate text-xs text-ivory/50">{user.email}</p>}
                  </div>
                </div>
                <div className="mx-1.5 border-t border-navy-700/60" />
                {accountItems.map((m) => (
                  <Link key={m.to} to={m.to} className={`${mNavLink} text-ivory/80 hover:bg-navy-700/50 hover:text-ivory`}>
                    <span className="flex-1">{m.label}</span>
                    <Icon name="chevronRight" className="h-4 w-4 shrink-0 text-ivory/30" />
                  </Link>
                ))}
                <button type="button" onClick={handleLogout} className={`${mNavLink} w-full text-ivory/60 hover:bg-navy-700/50 hover:text-ivory`}>
                  <Icon name="logout" className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{t("nav.logOut")}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className={`flex w-full items-center justify-center rounded-xl bg-gold-500 py-3 text-sm font-semibold text-ink transition hover:bg-gold-400 ${ring}`}
              >
                {t("nav.signIn")}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}