import { useTranslation } from "react-i18next";

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-ivory">{t("terms.title")}</h1>
      <p className="mt-2 text-sm text-ivory/40">
        {t("terms.lastUpdated", { year: new Date().getFullYear() })}
      </p>

      <div className="mt-8 space-y-6 leading-relaxed text-ivory/70">
        <p>{t("terms.intro")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section1.heading")}</h2>
        <p>{t("terms.section1.body")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section2.heading")}</h2>
        <p>{t("terms.section2.body")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section3.heading")}</h2>
        <p>{t("terms.section3.body")}</p>
        <p className="text-sm text-ivory/50">{t("terms.section3.placeholder")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section4.heading")}</h2>
        <p>{t("terms.section4.body")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section5.heading")}</h2>
        <p>{t("terms.section5.body")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section6.heading")}</h2>
        <p>{t("terms.section6.body")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section7.heading")}</h2>
        <p>{t("terms.section7.body")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section8.heading")}</h2>
        <p>{t("terms.section8.body")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section9.heading")}</h2>
        <p>{t("terms.section9.body")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section10.heading")}</h2>
        <p>
          {t("terms.section10.bodyIntro")}{" "}
          <a href="/refund-policy" className="text-gold-400 hover:text-gold-300">
            {t("terms.section10.refundPolicyLinkLabel")}
          </a>
          .
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section11.heading")}</h2>
        <p>{t("terms.section11.body")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section12.heading")}</h2>
        <p>{t("terms.section12.body")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("terms.section13.heading")}</h2>
        <p>
          {t("terms.section13.bodyIntro")}{" "}
          <a href="mailto:support@adyoolau.com" className="text-gold-400 hover:text-gold-300">
            support@adyoolau.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}