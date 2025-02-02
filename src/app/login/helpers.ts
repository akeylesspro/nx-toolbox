import { setCookie } from "cookies-next";
import moment from "moment";
import { signInWithPhoneNumber } from "@firebase/auth";
import { auth, fire_base_TIME_TEMP, local_israel_phone_format, query_document } from "akeyless-client-commons/helpers";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { NxUser, TObject } from "akeyless-types-commons";
import { parsePermissions } from "akeyless-client-commons/helpers";
import { set_document } from "akeyless-client-commons/helpers";

export const setAuthCookie = (token: string) => {
    const expiresAt = moment().set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
    if (moment().isAfter(expiresAt)) {
        expiresAt.add(1, "days");
    }
    const maxAge = expiresAt.diff(moment(), "seconds");
    setCookie("token", token, { maxAge, path: "/", secure: true });
};

export const get_user_by_phone = async (phone: string): Promise<NxUser | null> => {
    const phones = [phone, local_israel_phone_format(phone)];
    const user = await query_document("nx-users", "phone_number", "in", phones);
    return user;
};

export const onPhoneSubmit = async (
    phone: string,
    setLoginUser: (t: NxUser) => void,
    setCodeDisplay: (t: boolean) => void,
    setUserPermissions: (t: TObject<any>) => void
) => {
    if (phone.length < 10) {
        throw new Error("number_not_valid");
    }
    const appVerifier = window?.recaptchaVerifier || null;
    const user = await get_user_by_phone(phone.replace(/[- ]/g, ""));
    if (!user) {
        throw new Error("number_not_in_system");
    }
    const userPermissions = parsePermissions(user);
    if (!userPermissions.toolbox) {
        throw new Error("user_not_allowed");
    }
    setUserPermissions(userPermissions);
    setLoginUser(user);
    const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
    window.confirmationResult = confirmationResult;
    setCodeDisplay(true);
};

export const onCodeSubmit = async (code: string, loginUser: NxUser, setActiveUser: (t: NxUser) => void, router: AppRouterInstance) => {
    const result = await window.confirmationResult.confirm(code);
    const token = await result.user.getIdToken();
    await set_document("nx-users", loginUser.id!, { last_login: fire_base_TIME_TEMP() });
    setAuthCookie(token);
    setActiveUser(loginUser);
    router.push("/");
};
