export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-ivory">Terms of service</h1>
      <p className="mt-2 text-sm text-ivory/40">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-8 space-y-6 leading-relaxed text-ivory/70">
        <p>
          These terms govern your use of Adyoolau. By creating an account or making
          a purchase, you agree to them.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">1. Your account</h2>
        <p>
          You're responsible for keeping your account credentials secure and for
          any activity that happens under your account. Let us know right away if
          you believe your account has been compromised.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">2. Purchases and licensing</h2>
        <p>
          When you buy a book, you're purchasing a personal license to read and
          download it for your own use. Books are not transferable and may not be
          resold, redistributed, or shared publicly. You may keep your downloaded
          copies indefinitely, including if your account is later closed.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">3. Free titles</h2>
        <p>
          Free books are offered under the same personal-use license as paid
          titles. Claiming a free book adds it to your library the same way a
          purchase would.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">4. Reviews</h2>
        <p>
          Only readers who own a title may leave a review for it. Reviews should
          reflect your genuine opinion of the book. We reserve the right to remove
          reviews that are abusive, spam, or unrelated to the book itself.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">5. Availability</h2>
        <p>
          We aim to keep the site and your library available at all times, but we
          don't guarantee uninterrupted access and aren't liable for temporary
          outages beyond our control.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">6. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Continuing to use Adyoolau
          after a change means you accept the updated terms.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">7. Contact</h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a href="mailto:support@adyoolau.com" className="text-gold-400 hover:text-gold-300">
            support@adyoolau.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}