import { useTranslation } from "react-i18next";

export default function RefundPolicy() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-ivory">{t("refundPolicy.title")}</h1>
      <p className="mt-2 text-sm text-ivory/40">
        {t("refundPolicy.lastUpdated", { year: new Date().getFullYear() })}
      </p>

      <div className="mt-8 space-y-6 leading-relaxed text-ivory/70">
        <p>{t("refundPolicy.intro")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("refundPolicy.ebooksHeading")}</h2>

        <h3 className="font-display text-lg text-ivory pt-2">{t("refundPolicy.eligibleHeading")}</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>{t("refundPolicy.ebooks.eligible1")}</li>
          <li>{t("refundPolicy.ebooks.eligible2")}</li>
          <li>{t("refundPolicy.ebooks.eligible3")}</li>
        </ul>

        <h3 className="font-display text-lg text-ivory pt-2">{t("refundPolicy.notEligibleHeading")}</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>{t("refundPolicy.ebooks.notEligible1")}</li>
          <li>{t("refundPolicy.ebooks.notEligible2")}</li>
          <li>{t("refundPolicy.ebooks.notEligible3")}</li>
        </ul>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("refundPolicy.templatesHeading")}</h2>

        <h3 className="font-display text-lg text-ivory pt-2">{t("refundPolicy.eligibleHeading")}</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>{t("refundPolicy.templates.eligible1")}</li>
          <li>{t("refundPolicy.templates.eligible2")}</li>
          <li>{t("refundPolicy.templates.eligible3")}</li>
        </ul>

        <h3 className="font-display text-lg text-ivory pt-2">{t("refundPolicy.notEligibleHeading")}</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>{t("refundPolicy.templates.notEligible1")}</li>
          <li>{t("refundPolicy.templates.notEligible2")}</li>
          <li>{t("refundPolicy.templates.notEligible3")}</li>
        </ul>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("refundPolicy.howToRequestHeading")}</h2>
        <p>
          {t("refundPolicy.howToRequestIntro")}{" "}
          <a href="mailto:support@adyoolau.com" className="text-gold-400 hover:text-gold-300">
            support@adyoolau.com
          </a>{" "}
          {t("refundPolicy.howToRequestBody")}
        </p>

        <p className="text-sm text-ivory/40">{t("refundPolicy.statutoryRightsNote")}</p>
      </div>
    </div>
  );
}