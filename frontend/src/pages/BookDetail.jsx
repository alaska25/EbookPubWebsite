import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false);
  const { user } = useAuth();
  const { items, addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/books/${id}`)
      .then(({ data }) => setBook(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    api
      .get("/auth/library")
      .then(({ data }) => setOwned(data.some((b) => b._id === id)))
      .catch(() => {});
  }, [user, id]);

  if (loading) return <p className="mx-auto max-w-6xl px-6 py-16 text-ivory/50">Loading…</p>;
  if (!book) return <p className="mx-auto max-w-6xl px-6 py-16 text-ivory/50">Book not found.</p>;

  const inCart = items.some((b) => b._id === book._id);

  const handleRead = () => navigate(`/read/${book._id}`);

  const handleGetFree = async () => {
    if (!user) return navigate("/login");
    await api.post(`/books/${book._id}/claim`);
    setOwned(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-[280px,1fr]">
        <img
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          className="aspect-[2/3] w-full rounded-md object-cover shadow-2xl shadow-black/50"
        />
        <div>
          <p className="text-sm uppercase tracking-wide text-gold-500/80">{book.category}</p>
          <h1 className="mt-2 font-display text-4xl text-ivory">{book.title}</h1>
          <p className="mt-2 text-lg text-ivory/60">by {book.author}</p>
          <p className="mt-6 max-w-xl leading-relaxed text-ivory/70">{book.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="font-display text-2xl text-gold-400">
              {book.isFree ? "Free" : `$${book.price.toFixed(2)}`}
            </span>

            {owned ? (
              <button
                onClick={handleRead}
                className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400"
              >
                Read now
              </button>
            ) : book.isFree ? (
              <button
                onClick={handleGetFree}
                className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400"
              >
                Get for free
              </button>
            ) : (
              <button
                onClick={() => addItem(book)}
                disabled={inCart}
                className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
              >
                {inCart ? "In your cart" : "Add to cart"}
              </button>
            )}

            {!user && <span className="text-sm text-ivory/40">Sign in to buy or read this title.</span>}
          </div>

          {!user && (
            <p className="mt-4 text-sm text-ivory/50">
              <Link to="/login" className="text-gold-400 hover:text-gold-300">
                Sign in
              </Link>{" "}
              or{" "}
              <Link to="/register" className="text-gold-400 hover:text-gold-300">
                create an account
              </Link>{" "}
              to add this to your library.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
