"use client";
import { SettingsStore } from "@/lib/store";
import { AsideButton, ChangeLanguageButton, ClickableLogo, Logout } from "./global";
import { useTranslation } from "react-i18next";

function Aside() {
    const isRtl = SettingsStore.isRtl();
    const { t } = useTranslation();
    return (
        <aside className="w-96 flex flex-col justify-between  py-2 border-r-2 border-[gray]">
            <div className="w-full _center border-[gray] border-b-[2px] pb-4">
                <ClickableLogo />
            </div>
            <div className="w-full px-4 py-2 flex flex-col gap-2 flex-1">
                <AsideButton content="boards" to="/boards" />
            </div>
            <div className="flex items-center justify-between border-t-[2px] border-[gray] py-1">
                <Logout />
                <ChangeLanguageButton
                    title={isRtl ? t("english") : t("hebrew")}
                    lang={isRtl ? "en" : "he"}
                    className="px-1 "
                    height={35}
                    width={40}
                />
            </div>
        </aside>
    );
}

export default Aside;
