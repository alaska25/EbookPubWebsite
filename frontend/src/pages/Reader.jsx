import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import ePub from "epubjs";
import api from "../api/axios.js";

// react-pdf needs a worker; load it from a CDN matching the installed pdfjs-dist version.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Reader() {
  const { id } = useParams();
  const [access, setAccess] = useState(null);
  const [error, setError] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const epubContainerRef = useRef(null);
  const renditionRef = useRef(null);

  useEffect(() => {
    api
      .get(`/books/${id}/access`)
      .then(({ data }) => setAccess(data))
      .catch((err) => setError(err.response?.data?.message || "You don't have access to this book."));
  }, [id]);

  useEffect(() => {
    if (!access || access.fileType !== "epub" || !epubContainerRef.current) return;

    const book = ePub(access.url);
    const rendition = book.renderTo(epubContainerRef.current, {
      width: "100%",
      height: "100%",
    });
    rendition.display();
    renditionRef.current = rendition;

    return () => book.destroy();
  }, [access]);

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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ivory">{access.title}</h1>
        <a
          href={access.url}
          download
          className="rounded-full border border-navy-700 px-4 py-2 text-sm text-ivory/70 hover:border-gold-500 hover:text-gold-400"
        >
          Download
        </a>
      </div>

      {access.fileType === "pdf" ? (
        <div className="rounded-md bg-navy-900 p-4">
          <Document
            file={access.url}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<p className="text-ivory/50">Loading PDF…</p>}
          >
            <Page pageNumber={pageNumber} width={720} />
          </Document>
          {numPages && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="rounded-full border border-navy-700 px-4 py-2 text-sm text-ivory/70 hover:border-gold-500 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-ivory/50">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                disabled={pageNumber >= numPages}
                className="rounded-full border border-navy-700 px-4 py-2 text-sm text-ivory/70 hover:border-gold-500 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            onClick={() => renditionRef.current?.prev()}
            className="rounded-full border border-navy-700 px-4 py-2 text-sm text-ivory/70 hover:border-gold-500"
          >
            ← Prev
          </button>
          <div ref={epubContainerRef} className="mx-4 h-[75vh] w-full rounded-md bg-parchment" />
          <button
            onClick={() => renditionRef.current?.next()}
            className="rounded-full border border-navy-700 px-4 py-2 text-sm text-ivory/70 hover:border-gold-500"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
