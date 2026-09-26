import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import BookViewer from "../components/BookViewer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function SampleReader() {
  const { id } = useParams();
  const [sample, setSample] = useState(null);
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const { items, addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get(`/books/${id}/sample`), api.get(`/books/${id}`)])
      .then(([sampleRes, bookRes]) => {
        setSample(sampleRes.data);
        setBook(bookRes.data);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "This book doesn't have a sample available.")
      );
  }, [id]);

  const inCart = book && items.some((b) => b._id === book._id);

  const handleGetFree = async () => {
    if (!user) return navigate("/login");
    await api.post(`/books/${book._id}/claim`);
    navigate(`/read/${book._id}`);
  };

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-ivory/70">{error}</p>
        <button
          onClick={() => navigate(`/book/${id}`, { replace: true })}
          className="mt-6 inline-block text-gold-400 hover:text-gold-300"
        >
          Back to book details
        </button>
      </div>
    );
  }

  if (!sample || !book) {
    return <p className="mx-auto max-w-6xl px-6 py-16 text-ivory/50">Loading sample…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gold-500/80">Sample</p>
          <h1 className="font-display text-2xl text-ivory">{sample.title}</h1>
        </div>
        <button onClick={() => navigate(-1)} className="text-sm text-ivory/50 hover:text-ivory">
          ← Back to book
        </button>
      </div>

      <BookViewer url={sample.url} fileType={sample.fileType} downloadable={false} />

      <div className="mt-8 rounded-md border border-navy-700/60 bg-navy-900/60 px-6 py-5 text-center">
        <p className="mb-4 text-sm text-ivory/60">
          You've reached the end of the sample. Continue reading {book.title}?
        </p>
        <div className="flex justify-center gap-3">
          {book.isFree ? (
            <button
              onClick={handleGetFree}
              className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-medium text-ink hover:bg-gold-400"
            >
              Get for free
            </button>
          ) : (
            <button
              onClick={() => addItem(book)}
              disabled={inCart}
              className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
            >
              {inCart ? "In your cart" : `Add to cart — $${book.price.toFixed(2)}`}
            </button>
          )}
          {!user && (
            <Link
              to="/login"
              className="rounded-full border border-navy-700 px-6 py-2.5 text-sm font-medium text-ivory/70 hover:text-ivory"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}