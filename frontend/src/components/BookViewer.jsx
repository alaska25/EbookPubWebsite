import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import ePub from "epubjs";

// react-pdf needs a worker; load it from a CDN matching the installed pdfjs-dist version.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// How much of the viewport height the PDF page is allowed to fill. Leaves
// room for the download button, page controls, and surrounding page chrome
// so the whole page (not just its top) is visible without excess scrolling.
const MAX_HEIGHT_RATIO = 0.7;

// Renders a PDF or EPUB given a signed { url, fileType }. Used by both the
// full Reader page (owned books) and the SampleReader page (preview files),
// so the two never drift apart in how they render content.
export default function BookViewer({ url, fileType, downloadable = true }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(720);
  // Natural height/width ratio of the loaded PDF page. Kept across page
  // turns (only reset when the document itself changes) so the container
  // doesn't snap to a different size and flash while the next page loads.
  const [pageAspect, setPageAspect] = useState(null);
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 900
  );
  const epubContainerRef = useRef(null);
  const renditionRef = useRef(null);
  const pdfContainerRef = useRef(null);

  useEffect(() => {
    if (fileType !== "epub" || !epubContainerRef.current) return;

    const book = ePub(url);
    const rendition = book.renderTo(epubContainerRef.current, {
      width: "100%",
      height: "100%",
    });
    rendition.display();
    renditionRef.current = rendition;

    return () => book.destroy();
  }, [url, fileType]);

  // Keep the PDF page sized to whatever space its container actually has,
  // instead of a fixed pixel width that looks wrong on different screens.
  useEffect(() => {
    if (!pdfContainerRef.current) return;

    const updateWidth = () => {
      if (pdfContainerRef.current) {
        // Cap at 800px so pages don't stretch too wide on large monitors
        setContainerWidth(Math.min(pdfContainerRef.current.clientWidth, 800));
      }
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(pdfContainerRef.current);

    return () => observer.disconnect();
  }, [url]);

  // Track the viewport height so the height-based cap below stays correct
  // on rotation/resize (e.g. switching between portrait and landscape).
  useEffect(() => {
    const updateHeight = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Reset the known aspect ratio only when the document itself changes
  // (not on every page turn). Most PDFs keep a consistent page aspect
  // ratio throughout, so holding onto the previous value while the next
  // page loads keeps the container size stable instead of snapping to
  // full width and back, which is what caused the flash on "Next".
  useEffect(() => {
    setPageAspect(null);
  }, [url]);

  // Fit-to-screen: render at whichever is smaller of "as wide as the
  // container allows" or "as wide as it can be while still fitting within
  // MAX_HEIGHT_RATIO of the viewport height". Falls back to the plain
  // width-based size until the page has loaded once and we know its
  // natural aspect ratio.
  const maxHeight = viewportHeight * MAX_HEIGHT_RATIO;
  const widthFromHeightCap = pageAspect ? maxHeight / pageAspect : Infinity;
  const pageWidth = Math.min(containerWidth, widthFromHeightCap);

  return (
    <div>
      {downloadable && (
        <div className="mb-4 flex justify-end">
          
            <a href={url}
            download
            className="rounded-full border border-navy-700 px-4 py-2 text-sm text-ivory/70 hover:border-gold-500 hover:text-gold-400"
          >
            Download
          </a>
        </div>
      )}

      {fileType === "pdf" ? (
        <div ref={pdfContainerRef} className="rounded-md bg-navy-900 p-4">
          <div className="flex max-h-[80vh] justify-center overflow-auto">
            <Document
              file={url}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<p className="text-ivory/50">Loading PDF…</p>}
            >
              <Page
                pageNumber={pageNumber}
                width={pageWidth}
                loading={
                  <div
                    style={{
                      width: pageWidth,
                      height: pageAspect ? pageWidth * pageAspect : undefined,
                    }}
                    className="bg-navy-900"
                  />
                }
                onLoadSuccess={(page) => {
                  // Use pdfjs-dist's own viewport API rather than react-pdf's
                  // originalWidth/originalHeight convenience props — those
                  // aren't present in every react-pdf version, and silently
                  // produce NaN (which Math.min then can't clamp against,
                  // so the height cap below does nothing) when missing.
                  const viewport = page.getViewport({ scale: 1 });
                  if (viewport.width && viewport.height) {
                    setPageAspect(viewport.height / viewport.width);
                  }
                }}
              />
            </Document>
          </div>
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