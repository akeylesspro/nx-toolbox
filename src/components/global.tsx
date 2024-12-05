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
import packageJson from "../../package.json";

export const Logout = () => {
    const router = useRouter();
    const setActiveUser = UserStore.setActiveUser();
    const { t } = useTranslation();

    const logOut = async () => {
        deleteCookie("token");
        setActiveUser(null);
        await signOut(auth);
        router.push("/login");
    };
    return (
        <Button className="bg-inherit" variant={"outline"} onClick={logOut}>
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
    return (
        <button onClick={() => router.push("/")} title={t("home")}>
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
            <div>{t("home_message").replace("{name}", activeUser?.fullName || "")}</div>
        </div>
    );
};

export const Version = () => {
    return <div className="absolute text-black z-30 bottom-0.5 text-xs right-0.5 px-1 ">v{packageJson.version}</div>;
};