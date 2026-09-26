import { InfoLink, InfoModalHost } from "./InfoModal.jsx";
import Reveal from "./Reveal.jsx";

const LINK_GROUPS = [
  {
    heading: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Refund Policy", to: "/refund-policy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy-policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-navy-700/60 bg-navy-900">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 140% at 12% 0%, rgba(212,169,79,0.08), transparent 55%)",
        }}
        aria-hidden="true"
      />

      <svg
        viewBox="0 0 400 400"
        className="pointer-events-none absolute -bottom-16 -right-16 h-[28rem] w-[28rem] text-gold-500/[0.06] sm:-bottom-20 sm:-right-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M40 90 C 120 60, 170 70, 200 100 L 200 300 C 170 270, 120 260, 40 290 Z" />
        <path d="M360 90 C 280 60, 230 70, 200 100 L 200 300 C 230 270, 280 260, 360 290 Z" />
        <path d="M200 100 L 200 300" />
      </svg>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 text-sm text-ivory/70">
        <Reveal className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <p className="font-display text-2xl text-ivory">Adyoolau</p>
            <p className="mt-3 max-w-sm leading-relaxed text-ivory/60">
              A quiet shelf for serious readers — buy, download, or read your
              next book right in the browser.
            </p>
          </div>

          {/* Link columns */}
          {LINK_GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="font-display text-xs uppercase tracking-widest text-gold-400">
                {group.heading}
              </p>
              <nav className="mt-4 flex flex-col gap-3">
                {group.links.map((link) => (
                  <InfoLink
                    key={link.to}
                    to={link.to}
                    className="text-ivory/70 transition-colors hover:text-gold-400"
                  >
                    {link.label}
                  </InfoLink>
                ))}
              </nav>
            </div>
          ))}
        </Reveal>

        {/* Bottom bar */}
        <Reveal
          delay={150}
          className="mt-12 flex flex-col items-start gap-4 border-t border-navy-700/60 pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-ivory/50">
            &copy; {new Date().getFullYear()} Adyoolau. All rights reserved.
          </p>
        </Reveal>
      </div>

      <InfoModalHost />
    </footer>
  );
}