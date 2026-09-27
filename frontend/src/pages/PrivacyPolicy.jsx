import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-ivory">{t("privacyPolicy.title")}</h1>
      <p className="mt-2 text-sm text-ivory/40">
        {t("privacyPolicy.lastUpdated", { year: new Date().getFullYear() })}
      </p>

      <div className="mt-8 space-y-6 leading-relaxed text-ivory/70">
        <p>{t("privacyPolicy.intro")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("privacyPolicy.infoWeCollectHeading")}</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>{t("privacyPolicy.infoWeCollect.item1")}</li>
          <li>{t("privacyPolicy.infoWeCollect.item2")}</li>
          <li>{t("privacyPolicy.infoWeCollect.item3")}</li>
          <li>{t("privacyPolicy.infoWeCollect.item4")}</li>
          <li>{t("privacyPolicy.infoWeCollect.item5")}</li>
        </ul>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("privacyPolicy.howWeUseItHeading")}</h2>
        <p>{t("privacyPolicy.howWeUseItBody")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("privacyPolicy.thirdPartiesHeading")}</h2>
        <p>{t("privacyPolicy.thirdPartiesBody")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("privacyPolicy.dataRetentionHeading")}</h2>
        <p>{t("privacyPolicy.dataRetentionBody")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("privacyPolicy.yourChoicesHeading")}</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>{t("privacyPolicy.yourChoices.item1")}</li>
          <li>{t("privacyPolicy.yourChoices.item2")}</li>
          <li>{t("privacyPolicy.yourChoices.item3")}</li>
          <li>{t("privacyPolicy.yourChoices.item4")}</li>
          <li>{t("privacyPolicy.yourChoices.item5")}</li>
        </ul>
        <p>
          {t("privacyPolicy.exerciseChoicesIntro")}{" "}
          <a href="mailto:support@adyoolau.com" className="text-gold-400 hover:text-gold-300">
            support@adyoolau.com
          </a>
          . {t("privacyPolicy.exerciseChoicesOutro")}
        </p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("privacyPolicy.childrensPrivacyHeading")}</h2>
        <p>{t("privacyPolicy.childrensPrivacyBody")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("privacyPolicy.changesHeading")}</h2>
        <p>{t("privacyPolicy.changesBody")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("privacyPolicy.contactHeading")}</h2>
        <p>
          {t("privacyPolicy.contactBody")}{" "}
          <a href="mailto:support@adyoolau.com" className="text-gold-400 hover:text-gold-300">
            support@adyoolau.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}