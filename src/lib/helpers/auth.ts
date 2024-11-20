import { setCookie } from "cookies-next";
import moment from "moment";
import { signInWithPhoneNumber } from "@firebase/auth";
import {
    auth,
    international_israel_phone_format,
    isInternational,
    isInternationalIsraelPhone,
    local_israel_phone_format,
    query_document,
} from "akeyless-client-commons/helpers";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Installer } from "akeyless-types-commons";

export const setAuthCookie = (token: string) => {
    const expiresAt = moment().set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
    if (moment().isAfter(expiresAt)) {
        expiresAt.add(1, "days");
    }
    const maxAge = expiresAt.diff(moment(), "seconds");
    setCookie("token", token, { maxAge, path: "/", secure: true });
};

export const get_user_by_phone = async (phone: string): Promise<Installer | null> => {
    const user = await query_document("technicians", "phone", "==", phone);
    return user as Installer | null;
};

export const onPhoneSubmit = async (input: HTMLInputElement, setTechnician: (t: Installer) => void, setCodeDisplay: (t: boolean) => void) => {
    const inputValue = input.value;
    if (inputValue.length < 10) {
        throw new Error("number_not_valid");
    }
    const appVerifier = window?.recaptchaVerifier || null;

    const loginPhoneNumber = !isInternational(inputValue) ? international_israel_phone_format(inputValue) : inputValue;
    const userPhone = isInternationalIsraelPhone(loginPhoneNumber) ? local_israel_phone_format(loginPhoneNumber) : loginPhoneNumber;
    const user = await get_user_by_phone(userPhone.replace(/[- ]/g, ""));
    if (!user || !user.superTechnician) {
        throw new Error("number_not_in_system");
    }
    setTechnician(user);
    const confirmationResult = await signInWithPhoneNumber(auth, loginPhoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    input.value = "";
    setCodeDisplay(true);
};

export const onCodeSubmit = async (
    input: HTMLInputElement,
    technician: Installer,
    setActiveUser: (t: Installer) => void,
    router: AppRouterInstance
) => {
    const code = input.value;
    const result = await window.confirmationResult.confirm(code);
    const token = await result.user.getIdToken();
    setAuthCookie(token)
    setActiveUser(technician);
    router.push("/");
};
