export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-ivory">Privacy policy</h1>
      <p className="mt-2 text-sm text-ivory/40">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-8 space-y-6 leading-relaxed text-ivory/70">
        <p>
          This policy explains what information Adyoolau collects, how it's used,
          and the choices you have about it.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">Information we collect</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Account details: your name and email address when you register</li>
          <li>Purchase history: which books you've bought or claimed for free</li>
          <li>
            Payment information: handled entirely by PayPal — we never see or store
            your card or bank details ourselves
          </li>
          <li>Newsletter signups: your email address, if you choose to subscribe</li>
          <li>Basic usage data: pages visited and general site activity, used to keep the site working correctly</li>
        </ul>

        <h2 className="font-display text-2xl text-ivory pt-4">How we use it</h2>
        <p>
          We use your information to deliver purchased books to your library,
          respond to support requests, send you the newsletter if you've opted in,
          and keep the platform secure and working properly. We do not sell your
          personal information to third parties.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">Third parties</h2>
        <p>
          We share only what's necessary to operate: PayPal processes payments,
          our hosting and storage providers keep the site and your files running.
          Each of these providers has its own privacy practices governing the data
          they handle on our behalf.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">Your choices</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>You can unsubscribe from the newsletter at any time</li>
          <li>You can request a copy of the personal data we hold about you</li>
          <li>You can request that your account and associated data be deleted</li>
        </ul>
        <p>
          To exercise any of these, email{" "}
          <a href="mailto:support@adyoolau.com" className="text-gold-400 hover:text-gold-300">
            support@adyoolau.com
          </a>
          .
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Continued use of Adyoolau
          after a change means you accept the updated policy.
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">Contact</h2>
        <p>
          Questions about this policy can be sent to{" "}
          <a href="mailto:support@adyoolau.com" className="text-gold-400 hover:text-gold-300">
            support@adyoolau.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}