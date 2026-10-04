import { lazy, Suspense } from "react";

// Each reader pulls in a large, format-specific library (react-pdf + pdfjs for
// PDFs; epubjs + jszip for EPUBs). Loading them separately means a reader only
// downloads the library for the format they're actually opening.
const PdfViewer = lazy(() => import("./PdfViewer.jsx"));
const EpubViewer = lazy(() => import("./EpubViewer.jsx"));

// Renders a PDF or EPUB given a signed { url, fileType }. Used by both the
// full Reader page (owned books) and the SampleReader page (preview files),
// so the two never drift apart in how they render content.
export default function BookViewer({ url, fileType, downloadable = true }) {
  return (
    <div>
      {downloadable && (
        <div className="mb-4 flex justify-end">
          <a
            href={url}
            download
            className="rounded-full border border-navy-700 px-4 py-2 text-sm text-ivory/70 hover:border-gold-500 hover:text-gold-400"
          >
            Download
          </a>
        </div>
      )}

      <Suspense fallback={<p className="text-ivory/50">Loading reader…</p>}>
        {fileType === "pdf" ? (
          <PdfViewer url={url} />
        ) : (
          <EpubViewer url={url} />
        )}
      </Suspense>
    </div>
  );
}