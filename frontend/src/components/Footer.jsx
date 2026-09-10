export default function Footer() {
  return (
    <footer className="mt-24 border-t border-navy-700/60 bg-navy-900">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-ivory/50">
        <p className="font-display text-lg text-ivory/80">Adyoolau</p>
        <p className="mt-2 max-w-md">
          A quiet shelf for serious readers — buy, download, or read your next book
          right in the browser.
        </p>
        <p className="mt-6">&copy; {new Date().getFullYear()} Adyoolau. All rights reserved.</p>
      </div>
    </footer>
  );
}
