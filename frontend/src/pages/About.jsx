import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/" className="text-sm text-ivory/50 hover:text-ivory">
        {t("about.backHome")}
      </Link>

      <h1 className="mt-6 font-display text-4xl text-ivory">{t("about.title")}</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-ivory/70">
        <p>{t("about.paragraph1")}</p>

        <p>{t("about.paragraph2")}</p>

        <p>{t("about.paragraph3")}</p>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("about.whatWereAboutHeading")}</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>{t("about.bullet1")}</li>
          <li>{t("about.bullet2")}</li>
          <li>{t("about.bullet3")}</li>
          <li>{t("about.bullet4")}</li>
        </ul>

        <h2 className="font-display text-2xl text-ivory pt-4">{t("about.questionsHeading")}</h2>
        <p>
          {t("about.questionsIntro")}{" "}
          <Link to="/contact" className="text-gold-400 hover:text-gold-300">
            {t("about.contactLinkLabel")}
          </Link>{" "}
          {t("about.questionsOutro")}
        </p>
      </div>
    </div>
  );
}