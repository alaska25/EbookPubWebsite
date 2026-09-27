import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Contact() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/" className="text-sm text-ivory/50 hover:text-ivory">
        {t("contact.backHome")}
      </Link>

      <h1 className="mt-6 font-display text-4xl text-ivory">{t("contact.title")}</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-ivory/70">
        <p>{t("contact.intro")}</p>

        <div className="rounded-lg border border-navy-700/60 bg-navy-900 p-6">
          <p className="text-sm uppercase tracking-wide text-gold-500/80">{t("contact.emailLabel")}</p>

          <a href="mailto:support@adyoolau.com"
            className="mt-1 block font-display text-xl text-ivory hover:text-gold-400"
          >
            support@adyoolau.com
          </a>
        </div>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("contact.beforeYouWriteHeading")}</h2>
        <p>
          {t("contact.beforeYouWriteIntro")}{" "}
          <Link to="/refund-policy" className="text-gold-400 hover:text-gold-300">
            {t("contact.refundPolicyLinkLabel")}
          </Link>{" "}
          {t("contact.and")}{" "}
          <Link to="/terms" className="text-gold-400 hover:text-gold-300">
            {t("contact.termsLinkLabel")}
          </Link>{" "}
          {t("contact.beforeYouWriteOutro")}
        </p>

        <p>{t("contact.orderIssuesNote")}</p>
      </div>
    </div>
  );
}