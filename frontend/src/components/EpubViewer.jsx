import { useEffect, useRef } from "react";
import ePub from "epubjs";

export default function EpubViewer({ url }) {
  const epubContainerRef = useRef(null);
  const renditionRef = useRef(null);

  useEffect(() => {
    if (!epubContainerRef.current) return;

    const book = ePub(url);
    const rendition = book.renderTo(epubContainerRef.current, {
      width: "100%",
      height: "100%",
    });
    rendition.display();
    renditionRef.current = rendition;

    return () => book.destroy();
  }, [url]);

  return (
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
  );
}