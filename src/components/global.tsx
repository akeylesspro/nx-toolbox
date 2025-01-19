"use client";
import { deleteCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import { SettingsStore, UserStore } from "@/lib/store";
import { signOut } from "firebase/auth";
import { auth } from "akeyless-client-commons/helpers";
import { Loader } from "akeyless-client-commons/components";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { AsideButtonsProps } from "@/types";
import { Badge, Button } from "./";
import { useDocumentTitle } from "akeyless-client-commons/hooks";
import { israelFlagSvgFun, usFlagSvgFun } from "akeyless-assets-commons";
import { changeLanguage } from "@/lib/helpers";
import { useEffect, useState } from "react";

export const Logout = () => {
    const setActiveUser = UserStore.setActiveUser();
    const direction = SettingsStore.direction();
    const isRtl = SettingsStore.isRtl();
    const { t } = useTranslation();

    const logOut = async () => {
        deleteCookie("token");
        setActiveUser(null);
        await signOut(auth);
    };
    return (
        <Button style={{ direction }} className="bg-inherit " variant={"outline"} onClick={logOut}>
            <i className={`fa-solid fa-arrow-${isRtl ? "right" : "left"}-from-bracket pt-1`}></i>
            {t("logout")}
        </Button>
    );
};

export const AppLoader = () => <Loader size={200} />;

export const QaBadge = () => {
    return (
        <>
            {process.env.NEXT_PUBLIC_MODE === "qa" && (
                <Badge variant={"destructive"} className="py-1 px-5 z-30 fixed left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-4 text-xl">
                    QA environment
                </Badge>
            )}
        </>
    );
};

export const AsideButton = ({ content, to, disabled }: AsideButtonsProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslation();

    return (
        <Button
            disabled={disabled}
            variant={pathname?.includes(to) ? "default" : "secondary"}
            onClick={() => router.push(to)}
            className={"w-full hover:bg-gray-400"}
            title={t(content)}
        >
            {t(content)}
        </Button>
    );
};

export const ClickableLogo = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const [title, setTitle] = useState("");

    useEffect(() => {
        setTitle(t("home"));
    }, [t]);

    return (
        <button onClick={() => router.push("/")} title={title}>
            <Image src="/images/akeyless_logo_big.png" alt="logo" width={200} height={200} />
        </button>
    );
};

export const HomePageMessage = () => {
    const { t } = useTranslation();
    useDocumentTitle(t("home"));

    const activeUser = UserStore.activeUser();
    const direction = SettingsStore.direction();
    return (
        <div className="flex justify-center gap-2 items-start _full pt-16 text-3xl" style={{ direction: direction }}>
            <div>{t("home_message").replace("{name}", `${activeUser?.first_name || ""} ${activeUser?.last_name || ""}`.trim())}</div>
        </div>
    );
};
interface ChangeLanguageButtonProps {
    lang: "en" | "he";
    width?: number;
    height?: number;
    className?: string;
    title?: string;
}
export const ChangeLanguageButton = ({ lang, width, height, className, title }: ChangeLanguageButtonProps) => {
    const { i18n, t } = useTranslation();
    const setDirection = SettingsStore.setDirection();
    const icons = { en: usFlagSvgFun(width, height), he: israelFlagSvgFun(width, height) };
    return (
        <button className={className} title={title} onClick={() => changeLanguage(lang, i18n, setDirection)}>
            {icons[lang]}
        </button>
    );
};
