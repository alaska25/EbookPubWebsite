import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-ivory">About Adyoolau</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-ivory/70">
        <p>
          Adyoolau is a small, independent ebook shelf built for readers who want a
          straightforward way to buy, download, and read books without noise or
          clutter. No subscriptions, no algorithmic feeds — just titles worth your
          time, priced fairly, and yours to keep once you buy them.
        </p>

        <p>
          Every book you read here can be enjoyed right in your browser, or
          downloaded as a PDF or EPUB to keep on your own devices. We believe once
          you've bought a book, it's yours — no DRM lock-in, no disappearing titles.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">What we're about</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>A carefully curated catalog rather than an endless, unvetted marketplace</li>
          <li>Fair, transparent pricing with no hidden subscription traps</li>
          <li>Direct support from real people if something goes wrong</li>
          <li>Respect for your time — clean design, no dark patterns</li>
        </ul>

        <h2 className="font-display text-2xl text-ivory pt-4">Questions?</h2>
        <p>
          We'd genuinely like to hear from you — whether it's a question about a
          title, a technical issue, or just feedback on the site. Visit our{" "}
          <Link to="/contact" className="text-gold-400 hover:text-gold-300">
            Contact page
          </Link>{" "}
          to reach us.
        </p>
      </div>
    </div>
  );
}