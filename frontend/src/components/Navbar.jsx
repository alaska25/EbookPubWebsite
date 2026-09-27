import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuthModal } from "../context/AuthModalContext.jsx";
import logo from "../assets/logo.png";

const LANGUAGES = [
  { code: "en", label: "EN", flag: "🇺🇸", name: "English" },
  { code: "es", label: "ES", flag: "🇪🇸", name: "Español" },
  { code: "pt", label: "PT", flag: "🇧🇷", name: "Português" },
  { code: "ja", label: "JA", flag: "🇯🇵", name: "日本語" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { openLogin } = useAuthModal();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/catalog?search=${encodeURIComponent(query.trim())}` : "/catalog");
    setMenuOpen(false);
  };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setLangMenuOpen(false);
    setMenuOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language)
    ?? LANGUAGES.find((l) => i18n.language?.startsWith(l.code))
    ?? LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 border-b border-navy-700/60 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          <img src={logo} alt="Adyoolau" className="h-10 w-10 rounded-full" />
          <span className="font-display text-xl tracking-wide text-ivory">Adyoolau</span>
        </Link>

        {!isAdmin && (
          <form onSubmit={handleSearch} className="hidden flex-1 md:block">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("nav.searchPlaceholder")}
              className="w-full max-w-md rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
            />
          </form>
        )}

        {/* Desktop nav: unchanged, just hidden below md: */}
        <nav className="ml-auto hidden items-center gap-5 text-sm md:flex">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen((v) => !v)}
              onBlur={() => setTimeout(() => setLangMenuOpen(false), 150)}
              aria-label="Change language"
              aria-haspopup="listbox"
              aria-expanded={langMenuOpen}
              className="flex items-center gap-1.5 rounded-full border border-navy-700 py-1.5 pl-3 pr-2.5 text-sm text-ivory/80 hover:border-gold-500/60"
            >
              <span className="text-base leading-none">{currentLang.flag}</span>
              <span className="text-xs font-medium tracking-wide text-ivory/60">{currentLang.label}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`h-3 w-3 text-ivory/40 transition-transform ${langMenuOpen ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {langMenuOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-navy-700 bg-navy-900 py-1 shadow-xl shadow-black/40"
              >
                {LANGUAGES.map((lang) => {
                  const active = i18n.language === lang.code || i18n.language?.startsWith(lang.code);
                  return (
                    <button
                      key={lang.code}
                      role="option"
                      aria-selected={active}
                      onMouseDown={() => changeLanguage(lang.code)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-navy-700/50 ${
                        active ? "text-gold-400" : "text-ivory/80"
                      }`}
                    >
                      <span className="text-base leading-none">{lang.flag}</span>
                      <span className="flex-1">{lang.name}</span>
                      {active && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-full border border-navy-700 p-2 text-ivory/70 hover:border-gold-500 hover:text-gold-400"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
          {!isAdmin && (
            <Link to="/catalog" className="text-ivory/80 hover:text-gold-400">{t("nav.catalog")}</Link>
          )}
          {!isAdmin && (
            <Link to="/templates" className="text-ivory/80 hover:text-gold-400">{t("nav.templates")}</Link>
          )}
          {user && !isAdmin && (
            <Link to="/library" className="text-ivory/80 hover:text-gold-400">{t("nav.myLibrary")}</Link>
          )}
          {isAdmin && <Link to="/admin" className="text-ivory/80 hover:text-gold-400">{t("nav.admin")}</Link>}
          {!isAdmin && (
            <Link to="/cart" data-cart-target className="relative text-ivory/80 hover:text-gold-400">
              {t("nav.cart")}
              {items.length > 0 && (
                <span className="absolute -right-3 -top-2 rounded-full bg-gold-500 px-1.5 text-[11px] font-semibold text-ink">
                  {items.length}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <button onClick={logout} className="text-ivory/80 hover:text-gold-400">{t("nav.logOut")}</button>
          ) : (
            <button
              onClick={openLogin}
              className="rounded-full border border-gold-500 px-4 py-1.5 text-gold-400 hover:bg-gold-500 hover:text-ink"
            >
              {t("nav.signIn")}
            </button>
          )}
        </nav>

        {/* Mobile: cart badge + hamburger toggle, visible below md: */}
        <div className="ml-auto flex items-center gap-4 md:hidden">
          {!isAdmin && (
            <Link to="/cart" data-cart-target className="relative text-ivory/80">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.593 2.649-6.75H5.106M7.5 14.25L5.106 5.272M7.5 14.25L5.106 5.272m0 0L4.5 2.25M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {items.length > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-gold-500 px-1.5 text-[10px] font-semibold text-ink">
                  {items.length}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="rounded-full border border-navy-700 p-2 text-ivory/70"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className="border-t border-navy-700/60 px-6 py-4 md:hidden">
          {!isAdmin && (
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("nav.searchPlaceholder")}
                className="w-full rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
              />
            </form>
          )}
          <div className="flex flex-col gap-4 text-sm">
            {/* Language switcher (mobile) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ivory/40">{t("nav.language")}</span>
              <div className="flex items-center gap-2">
                {LANGUAGES.map((lang) => {
                  const active = i18n.language === lang.code || i18n.language?.startsWith(lang.code);
                  return (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                        active
                          ? "border-gold-500 text-gold-400"
                          : "border-navy-700 text-ivory/70"
                      }`}
                    >
                      <span className="text-base leading-none">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => { toggleTheme(); }}
              className="flex items-center gap-2 text-ivory/80"
            >
              {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            </button>
            {!isAdmin && (
              <Link to="/catalog" onClick={() => setMenuOpen(false)} className="text-ivory/80">{t("nav.catalog")}</Link>
            )}
            {!isAdmin && (
              <Link to="/templates" onClick={() => setMenuOpen(false)} className="text-ivory/80">{t("nav.templates")}</Link>
            )}
            {user && !isAdmin && (
              <Link to="/library" onClick={() => setMenuOpen(false)} className="text-ivory/80">{t("nav.myLibrary")}</Link>
            )}
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-ivory/80">{t("nav.admin")}</Link>}
            {user ? (
              <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-ivory/80">
                {t("nav.logOut")}
              </button>
            ) : (
              <button
                onClick={() => { openLogin(); setMenuOpen(false); }}
                className="w-fit rounded-full border border-gold-500 px-4 py-1.5 text-gold-400"
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