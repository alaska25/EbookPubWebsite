import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import BookViewer from "../components/BookViewer.jsx";

export default function Reader() {
  const { id } = useParams();
  const [access, setAccess] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/books/${id}/access`)
      .then(({ data }) => setAccess(data))
      .catch((err) => setError(err.response?.data?.message || "You don't have access to this book."));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-ivory/70">{error}</p>
        <Link to="/library" className="mt-6 inline-block text-gold-400 hover:text-gold-300">
          Back to my library
        </Link>
      </div>
    );
  }

  if (!access) {
    return <p className="mx-auto max-w-6xl px-6 py-16 text-ivory/50">Loading reader…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ivory">{access.title}</h1>
      </div>

      <BookViewer url={access.url} fileType={access.fileType} downloadable />
    </div>
  );
}