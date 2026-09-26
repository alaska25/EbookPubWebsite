export default function RefundPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-ivory">Refund policy</h1>
      <p className="mt-2 text-sm text-ivory/40">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-8 space-y-6 leading-relaxed text-ivory/70">
        <p>
          Because our books are digital products delivered instantly upon purchase,
          our refund policy works a little differently than it would for a physical
          item. Here's how it works.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">
          Eligible for a refund
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>The file you received is corrupted, incomplete, or won't open</li>
          <li>You were charged more than once for the same title by mistake</li>
          <li>
            You purchased the wrong title and haven't opened, read, or downloaded it
            yet, and you contact us within 48 hours of purchase
          </li>
        </ul>

        <h2 className="font-display text-2xl text-ivory pt-4">
          Not eligible for a refund
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Simply changing your mind after reading or downloading a book</li>
          <li>Requests made more than 14 days after purchase</li>
          <li>Dissatisfaction with the writing style or subject matter itself</li>
        </ul>

        <h2 className="font-display text-2xl text-ivory pt-4">
          How to request a refund
        </h2>
        <p>
          Email{" "}
          <a href="mailto:support@adyoolau.com" className="text-gold-400 hover:text-gold-300">
            support@adyoolau.com
          </a>{" "}
          with the email address you purchased under and the title in question.
          We'll review the request and get back to you within 2–3 business days.
          Approved refunds are returned to your original payment method and may
          take 5–10 business days to appear, depending on your bank or PayPal.
        </p>

        <p className="text-sm text-ivory/40">
          This policy doesn't affect any statutory rights you may have under the
          consumer protection laws of your country.
        </p>
      </div>
    </div>
  );
}