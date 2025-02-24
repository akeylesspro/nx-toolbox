"use client";
import { SettingsStore, UserStore } from "@/lib/store";
import { AsideButton, ChangeLanguageButton, ClickableLogo, Logout } from "./global";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

function Aside() {
    return (
        <aside className="min-w-96 flex flex-col justify-between  py-2 border-r-2 border-[#5f9ea0c2]">
            <Header />
            <NavigationButtons />
            <Footer />
        </aside>
    );
}

export default Aside;

const NavigationButtons = () => {
    const userPermissions = UserStore.userPermissions();

    const buttonsToDisplay = useMemo(() => {
        const isSuperAdmin = userPermissions.toolbox?.super_admin;
        const buttons = [];
        if (isSuperAdmin) {
            buttons.push({ content: "boards", to: "/boards" });
            buttons.push({ content: "clients", to: "/clients" });
            buttons.push({ content: "users", to: "/users" });
            buttons.push({ content: "car_catalog", to: "/car-catalog" });
            buttons.push({ content: "sms_configurations", to: "/sms-configurations" });
        }
        if (isSuperAdmin || userPermissions.reports) {
            buttons.push({ content: "reports", to: "/reports" });
        }
        return buttons;
    }, [userPermissions]);
    return (
        <div className="w-full px-4 py-2 flex flex-col gap-2 flex-1">
            {buttonsToDisplay.map((button, index) => {
                return <AsideButton key={button.to + index} content={button.content} to={button.to} />;
            })}
        </div>
    );
};
const Header = () => {
    return (
        <div className="w-full _center border-[#5f9ea0c2] border-b-[2px] pb-4">
            <ClickableLogo />
        </div>
    );
};
const Footer = () => {
    const isRtl = SettingsStore.isRtl();
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-between border-t-[2px] border-[#5f9ea0c2] py-1">
            <Logout />
            <ChangeLanguageButton title={isRtl ? t("english") : t("hebrew")} lang={isRtl ? "en" : "he"} className="px-1 " height={35} width={40} />
        </div>
    );
};
