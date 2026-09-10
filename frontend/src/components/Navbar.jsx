import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { items } = useCart();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/catalog?search=${encodeURIComponent(query.trim())}` : "/catalog");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-navy-700/60 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="Adyoolau" className="h-10 w-10 rounded-full" />
          <span className="font-display text-xl tracking-wide text-ivory">Adyoolau</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 md:block">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, authors, subjects..."
            className="w-full max-w-md rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
          />
        </form>

        <nav className="ml-auto flex items-center gap-5 text-sm">
          <Link to="/catalog" className="text-ivory/80 hover:text-gold-400">
            Catalog
          </Link>
          {user && (
            <Link to="/library" className="text-ivory/80 hover:text-gold-400">
              My Library
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-ivory/80 hover:text-gold-400">
              Admin
            </Link>
          )}
          <Link to="/cart" className="relative text-ivory/80 hover:text-gold-400">
            Cart
            {items.length > 0 && (
              <span className="absolute -right-3 -top-2 rounded-full bg-gold-500 px-1.5 text-[11px] font-semibold text-ink">
                {items.length}
              </span>
            )}
          </Link>
          {user ? (
            <button onClick={logout} className="text-ivory/80 hover:text-gold-400">
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-gold-500 px-4 py-1.5 text-gold-400 hover:bg-gold-500 hover:text-ink"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
