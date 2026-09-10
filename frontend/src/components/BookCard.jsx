import { Link } from "react-router-dom";

export default function BookCard({ book }) {
  return (
    <Link to={`/book/${book._id}`} className="group block">
      <div className="aspect-[2/3] overflow-hidden rounded-md bg-navy-800">
        <img
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <h3 className="mt-3 font-display text-base leading-snug text-ivory group-hover:text-gold-400">
        {book.title}
      </h3>
      <p className="text-sm text-ivory/50">{book.author}</p>
      <p className="mt-1 text-sm text-gold-400">{book.isFree ? "Free" : `$${book.price.toFixed(2)}`}</p>
    </Link>
  );
}
