import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import StarRating from "../components/StarRating.jsx";
import BackButton from "../components/BackButton.jsx";

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
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [claimingFree, setClaimingFree] = useState(false);
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

  const startEditing = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setReviewError("");
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment("");
  };

  const handleUpdateReview = async (reviewId) => {
    setReviewError("");
    if (editRating < 1) {
      setReviewError("Choose a star rating first.");
      return;
    }
    if (!editComment.trim()) {
      setReviewError("Write a short review before saving.");
      return;
    }
    setSubmittingReview(true);
    try {
      await api.put(`/books/${id}/reviews/${reviewId}`, {
        rating: editRating,
        comment: editComment.trim(),
      });
      cancelEditing();
      loadReviews();
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not save your changes.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Delete your review?")) return;
    try {
      await api.delete(`/books/${id}/reviews/${reviewId}`);
      loadReviews();
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not delete your review.");
    }
  };

  if (loading) return <p className="mx-auto max-w-6xl px-6 py-16 text-ivory/50">Loading…</p>;
  if (!book) return <p className="mx-auto max-w-6xl px-6 py-16 text-ivory/50">Book not found.</p>;

  const inCart = items.some((b) => b._id === book._id);
  const handleRead = () => navigate(`/read/${book._id}`);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addItem(book);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleGetFree = async () => {
    if (!user) return navigate("/login");
    setClaimingFree(true);
    try {
      await api.post(`/books/${book._id}/claim`);
      setOwned(true);
    } finally {
      setClaimingFree(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-8">
      {/* Goes back to wherever the visitor came from (catalog, home
          carousel, search…). Falls back to the catalog if the page was
          opened directly, e.g. from a shared link. */}
      <BackButton fallback="/catalog" className="mb-8" />

      {/* Top Section: Main Book Information Grid */}
      <div className="grid gap-12 md:grid-cols-[280px,1fr]">
        <div className="w-full">
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="aspect-[2/3] w-full rounded-md object-cover shadow-2xl shadow-black/50"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm uppercase tracking-wide text-gold-500/80">{book.category}</p>
            {book.fileType && (
              <span className="rounded-full border border-navy-700 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-ivory/60">
                {book.fileType}
              </span>
            )}
          </div>
          <h1 className="mt-1.5 font-display text-4xl text-ivory">{book.title}</h1>
          {book.subtitle && <p className="mt-1 text-xl text-ivory/70">{book.subtitle}</p>}
          <p className="mt-1 text-lg text-ivory/60">by {book.author}</p>

          <div className="mt-1.5 flex items-center gap-2">
            <StarRating value={book.avgRating} />
            <span className="text-sm text-ivory/50">
              {book.reviewCount > 0
                ? `${book.avgRating.toFixed(1)} (${book.reviewCount} review${book.reviewCount === 1 ? "" : "s"})`
                : "No reviews yet"}
            </span>
          </div>

          {/* Price + purchase action, right under the rating so the
              CTA is visible without scrolling. "Read sample" now sits
              alongside it as a lighter, secondary action instead of a
              full-width button competing with "Add to cart". */}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span className="font-display text-3xl font-semibold text-gold-400">
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
                disabled={claimingFree}
                className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
              >
                {claimingFree ? "Adding…" : "Get for free"}
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={inCart || addingToCart}
                className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
              >
                {inCart ? "In your cart" : addingToCart ? "Adding…" : "Add to cart"}
              </button>
            )}

            {!owned && book.sampleFileType && (
              <button
                onClick={() => navigate(`/sample/${book._id}`)}
                className="text-sm font-medium text-gold-400 underline-offset-4 hover:text-gold-300 hover:underline"
              >
                Read sample
              </button>
            )}
          </div>

          {!user && <p className="mt-2 text-sm text-ivory/40">Sign in to buy or read this title.</p>}

          {/* Book details row — always shows Format/Category (already
              hinted at by the badges above, but spelled out here for
              scannability), plus page count / publish year when the
              book record has them. */}
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ivory/60">
            {book.fileType && (
              <div className="flex gap-1.5">
                <dt className="text-ivory/40">Format:</dt>
                <dd>{book.fileType.toUpperCase()}</dd>
              </div>
            )}
            {book.category && (
              <div className="flex gap-1.5">
                <dt className="text-ivory/40">Category:</dt>
                <dd>{book.category}</dd>
              </div>
            )}
            {book.pageCount && (
              <div className="flex gap-1.5">
                <dt className="text-ivory/40">Length:</dt>
                <dd>{book.pageCount} pages</dd>
              </div>
            )}
            {book.publishedAt && (
              <div className="flex gap-1.5">
                <dt className="text-ivory/40">Published:</dt>
                <dd>{new Date(book.publishedAt).getFullYear()}</dd>
              </div>
            )}
          </dl>

          {/* Typography Description View Box */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ivory/80 whitespace-pre-line tracking-wide">
            {book.description}
          </p>

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

      {/* Bottom Section: Customer Reviews Feed Layout */}
      <div className="mt-16 border-t border-navy-700/60 pt-10">
        <h2 className="font-display text-2xl text-ivory">Reviews</h2>

        {/* Dynamic Submission Form for verified buyers */}
        {owned && !myReview && (
          <form onSubmit={handleSubmitReview} className="mt-6 max-w-xl space-y-3">
            <StarRating value={myRating} onChange={setMyRating} size={22} />
            <textarea
              rows={3}
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="What did you think of this book?"
              className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory placeholder:text-ivory/40 focus:border-gold-500 outline-none"
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

        {/* Dynamic Reviews Loops Feed List */}
        <div className="mt-8 space-y-6">
          {reviews.length === 0 ? (
            <p className="text-ivory/50">No reviews yet — be the first to share your thoughts.</p>
          ) : (
            reviews.map((r) => {
              const isMine = user && r.user === user._id;
              const isEditing = editingReviewId === r._id;

              return (
                <div key={r._id} className="border-b border-navy-700/40 pb-6">
                  {isEditing ? (
                    <div className="max-w-xl space-y-3">
                      <StarRating value={editRating} onChange={setEditRating} size={22} />
                      <textarea
                        rows={3}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500 outline-none"
                      />
                      {reviewError && <p className="text-sm text-red-400">{reviewError}</p>}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdateReview(r._id)}
                          disabled={submittingReview}
                          className="rounded-full bg-gold-500 px-5 py-2 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
                        >
                          {submittingReview ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="rounded-full border border-navy-700 px-5 py-2 text-sm font-medium text-ivory/70 hover:text-ivory"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-ivory">{r.userName}</p>
                          <StarRating value={r.rating} size={16} />
                        </div>
                        <span className="text-xs text-ivory/40">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-ivory/70">{r.comment}</p>
                      {isMine && (
                        <div className="mt-2 flex gap-4">
                          <button
                            onClick={() => startEditing(r)}
                            className="text-xs text-gold-400 hover:text-gold-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(r._id)}
                            className="text-xs text-ivory/40 hover:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}