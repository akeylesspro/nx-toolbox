"use client";
import Image from "next/image";
import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { SettingsStore, UserStore } from "@/lib/store";
import { onCodeSubmit, onPhoneSubmit } from "@/lib/helpers";
import { useValidation } from "akeyless-client-commons/helpers";
import { Loader } from "akeyless-client-commons/components";
import { Installer } from "akeyless-types-commons";
import { Button, ChangeLanguageButton, Input } from "@/components";

const Login = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const isRtl = SettingsStore.isRtl();
    const setDirection = SettingsStore.setDirection();
    const setActiveUser = UserStore.setActiveUser();

    const [error, setError] = useState("");
    const [technician, setTechnician] = useState<Installer | null>(null);
    const [codeDisplay, setCodeDisplay] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem("input") as HTMLInputElement;
            setIsLoading(true);
            if (codeDisplay) {
                await onCodeSubmit(input, technician!, setActiveUser, router);
                return;
            }
            await onPhoneSubmit(input, setTechnician, setCodeDisplay);
            setIsLoading(false);
        } catch (error: any) {
            setError(t(error.message));
            setIsLoading(false);
            console.error("error in handleSubmit", error);
        }
    };

    return (
        <div className="_full _center px-3">
            <Image className="fixed top-4 left-4" width={214} height={57} src="/images/akeyless_logo_big.png" alt="akyeless_logo" />
            <div className="p-6 border w-96  border-gray-200 rounded-lg shadow-md flex flex-col gap-4">
                <div className="text-2xl font-semibold ">{t("phone_login_headline")}</div>
                {error && <div className=" text-red-500">{error}</div>}
                <form className="flex flex-col gap-4 " onSubmit={handleSubmit}>
                    <div className="">
                        <Input
                            name="input"
                            type="text"
                            className={`${isRtl ? "text-end" : "text-start"} ltr`}
                            placeholder={codeDisplay ? t("code_input_placeholder") : t("phone_input_placeholder")}
                            {...useValidation("numbers")}
                        />
                    </div>
                    <Button disabled={isLoading} type="submit" className="w-full flex items-end">
                        <div>{isLoading ? <Loader size={25} color="#fff" /> : codeDisplay ? t("code_button") : t("phone_button")}</div>
                    </Button>
                </form>
                <div className={`_center gap-2 w-full h-8`}>
                    <ChangeLanguageButton lang="en" width={32} height={22} />
                    <ChangeLanguageButton lang="he" width={32} height={22} />
                </div>
            </div>
        </div>
    );
};

export default Login;
