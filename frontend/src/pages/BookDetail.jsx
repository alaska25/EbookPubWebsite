import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import StarRating from "../components/StarRating.jsx";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
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

  const loadReviews = () => {
    api
      .get(`/books/${id}/reviews`)
      .then(({ data }) => setReviews(data))
      .catch(() => {});
  };

  useEffect(loadReviews, [id]);

  const myReview = reviews.find((r) => user && r.user === user._id);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    if (myRating < 1) {
      setReviewError("Choose a star rating first.");
      return;
    }
    if (!myComment.trim()) {
      setReviewError("Write a short review before submitting.");
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/books/${id}/reviews`, { rating: myRating, comment: myComment.trim() });
      setMyRating(0);
      setMyComment("");
      loadReviews();
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not submit your review.");
    } finally {
      setSubmittingReview(false);
    }
  };

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
          <div className="mt-2 flex items-center gap-2">
            <StarRating value={book.avgRating} />
            <span className="text-sm text-ivory/50">
              {book.reviewCount > 0
                ? `${book.avgRating.toFixed(1)} (${book.reviewCount} review${book.reviewCount === 1 ? "" : "s"})`
                : "No reviews yet"}
            </span>
          </div>
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

      <div className="mt-16 border-t border-navy-700/60 pt-10">
        <h2 className="font-display text-2xl text-ivory">Reviews</h2>

        {owned && !myReview && (
          <form onSubmit={handleSubmitReview} className="mt-6 max-w-xl space-y-3">
            <StarRating value={myRating} onChange={setMyRating} size={22} />
            <textarea
              rows={3}
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="What did you think of this book?"
              className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory placeholder:text-ivory/40 focus:border-gold-500"
            />
            {reviewError && <p className="text-sm text-red-400">{reviewError}</p>}
            <button
              type="submit"
              disabled={submittingReview}
              className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
            >
              {submittingReview ? "Posting…" : "Post review"}
            </button>
          </form>
        )}

        {user && !owned && (
          <p className="mt-6 text-sm text-ivory/40">Only readers who own this book can leave a review.</p>
        )}

        <div className="mt-8 space-y-6">
          {reviews.length === 0 ? (
            <p className="text-ivory/50">No reviews yet — be the first to share your thoughts.</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="border-b border-navy-700/40 pb-6">
                <div className="flex items-center gap-3">
                  <StarRating value={r.rating} size={14} />
                  <span className="text-sm font-medium text-ivory">{r.userName}</span>
                  <span className="text-xs text-ivory/40">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ivory/70">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
