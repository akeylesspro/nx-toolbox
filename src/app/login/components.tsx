import { UserStore } from "@/lib/store";
import { NxUser } from "akeyless-types-commons";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";
import { onCodeSubmit, onPhoneSubmit } from "./helpers";
import { CodeInput, InternationalPhonePicker, Loader } from "akeyless-client-commons/components";
import { Button, ChangeLanguageButton } from "@/components";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const LoginForm = ({ setError }: { setError: Dispatch<SetStateAction<string>> }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const [codeDisplay, setCodeDisplay] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [phoneValue, setPhoneValue] = useState("");
    const [codeValue, setCodeValue] = useState("");
    const [loginUser, setLoginUser] = useState<NxUser | null>(null);

    const setActiveUser = UserStore.setActiveUser();

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault();
            setIsLoading(true);
            if (codeDisplay) {
                return await onCodeSubmit(codeValue, loginUser!, setActiveUser, router);
            }
            await onPhoneSubmit(phoneValue, setLoginUser, setCodeDisplay);
            setIsLoading(false);
        } catch (error: any) {
            setError(t(error.message || "general error"));
            console.error("error in handleSubmit", error);
            setIsLoading(false);
        }
    };
    return (
        <form className="flex flex-col gap-4 " onSubmit={handleSubmit}>
            {codeDisplay ? (
                <CodeInput codeValue={codeValue} setCodeValue={setCodeValue} />
            ) : (
                <InternationalPhonePicker phoneValue={phoneValue} setPhoneValue={setPhoneValue} placeholder={t("phone_input_placeholder")} />
            )}
            <Button disabled={isLoading} type="submit" className="w-full flex items-end">
                <div>{isLoading ? <Loader size={25} color="#fff" /> : codeDisplay ? t("code_button") : t("phone_button")}</div>
            </Button>
        </form>
    );
};

export const LoginImage = () => {
    return <Image className="fixed top-4 left-4" width={214} height={57} src="/images/akeyless_logo_big.png" alt="akyeless_logo" />;
};

export const Error = ({ error }: { error: string }) => {
    return <>{error && <div className=" text-red-500">{error}</div>}</>;
};

export const Header = () => {
    const { t } = useTranslation();
    return <div className="text-2xl font-semibold ">{t("phone_login_headline")}</div>;
};

export const ChangeLanguageButtons = () => {
    return (
        <div className={`_center gap-2 w-full h-8`}>
            <ChangeLanguageButton lang="en" width={32} height={22} />
            <ChangeLanguageButton lang="he" width={32} height={22} />
        </div>
    );
};
