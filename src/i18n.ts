import i18n from "i18next";
import { initReactI18next } from "react-i18next";

async function initI18next() {
    if (typeof window !== "undefined") {
        const { default: HttpBackend } = await import("i18next-http-backend");
        i18n.use(HttpBackend);
    }
    await i18n.use(initReactI18next).init({
        fallbackLng: "he",
        interpolation: { escapeValue: false },
        backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
        initImmediate: false,
    });
}

initI18next();

export default i18n;
