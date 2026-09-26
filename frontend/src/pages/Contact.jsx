import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-ivory">Contact us</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-ivory/70">
        <p>
          Have a question about an order, a technical issue with the site, or
          feedback about a book? We read every message and try to reply within
          1–2 business days.
        </p>

        <div className="rounded-lg border border-navy-700/60 bg-navy-900 p-6">
          <p className="text-sm uppercase tracking-wide text-gold-500/80">Email</p>
          
          <a href="mailto:support@adyoolau.com"
            className="mt-1 block font-display text-xl text-ivory hover:text-gold-400"
          >
            support@adyoolau.com
          </a>
        </div>

        <h2 className="font-display text-2xl text-ivory pt-4">Before you write in</h2>
        <p>
          A few common questions are answered on our{" "}
          <Link to="/refund-policy" className="text-gold-400 hover:text-gold-300">
            Refund Policy
          </Link>{" "}
          and{" "}
          <Link to="/terms" className="text-gold-400 hover:text-gold-300">
            Terms of Service
          </Link>{" "}
          pages — worth a quick look before reaching out, in case your answer is
          already there.
        </p>

        <p>
          For order-specific issues, it helps to include the email address you used
          to purchase and, if you have it, the order reference shown on your
          checkout confirmation.
        </p>
      </div>
    </div>
  );
}