import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/catalog?search=${encodeURIComponent(query.trim())}` : "/catalog");
    setMenuOpen(false);
  };

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
              placeholder="Search titles, authors, subjects..."
              className="w-full max-w-md rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
            />
          </form>
        )}

        {/* Desktop nav: unchanged, just hidden below md: */}
        <nav className="ml-auto hidden items-center gap-5 text-sm md:flex">
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
            <Link to="/catalog" className="text-ivory/80 hover:text-gold-400">Catalog</Link>
          )}
          {user && !isAdmin && (
            <Link to="/library" className="text-ivory/80 hover:text-gold-400">My Library</Link>
          )}
          {isAdmin && <Link to="/admin" className="text-ivory/80 hover:text-gold-400">Admin</Link>}
          {!isAdmin && (
            <Link to="/cart" data-cart-target className="relative text-ivory/80 hover:text-gold-400">
              Cart
              {items.length > 0 && (
                <span className="absolute -right-3 -top-2 rounded-full bg-gold-500 px-1.5 text-[11px] font-semibold text-ink">
                  {items.length}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <button onClick={logout} className="text-ivory/80 hover:text-gold-400">Log out</button>
          ) : (
            <Link to="/login" className="rounded-full border border-gold-500 px-4 py-1.5 text-gold-400 hover:bg-gold-500 hover:text-ink">
              Sign in
            </Link>
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
                placeholder="Search titles, authors, subjects..."
                className="w-full rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
              />
            </form>
          )}
          <div className="flex flex-col gap-4 text-sm">
            <button
              onClick={() => { toggleTheme(); }}
              className="flex items-center gap-2 text-ivory/80"
            >
              {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            </button>
            {!isAdmin && (
              <Link to="/catalog" onClick={() => setMenuOpen(false)} className="text-ivory/80">Catalog</Link>
            )}
            {user && !isAdmin && (
              <Link to="/library" onClick={() => setMenuOpen(false)} className="text-ivory/80">My Library</Link>
            )}
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-ivory/80">Admin</Link>}
            {user ? (
              <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-ivory/80">
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-fit rounded-full border border-gold-500 px-4 py-1.5 text-gold-400"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}