import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { createSelectors, setState } from "akeyless-client-commons/helpers";
import { DecodedUser } from "@/types";
import { Installer } from "akeyless-types-commons";
import { isInternationalIsraelPhone, local_israel_phone_format } from "akeyless-client-commons/helpers";
import { SetState } from "akeyless-client-commons/types";
import { getCookie } from "cookies-next";

export interface UserStorType {
    activeUser: Installer | null;
    setActiveUser: SetState<Installer | null>;
}

function get_user_by_token(token?: string): Installer | null {
    const user = token ? (jwtDecode(token) as DecodedUser) : null;
    if (user) {
        const userPhone = isInternationalIsraelPhone(user.phone_number) ? local_israel_phone_format(user.phone_number) : user.phone_number;
        return { id: user.user_id, phone: userPhone };
    }
    return null;
}

export const UserStoreBase = create<UserStorType>((set) => ({
    activeUser: get_user_by_token(getCookie("token")),
    setActiveUser: (updater) => setState(updater, set, "activeUser"),
}));

export const UserStore = createSelectors<UserStorType>(UserStoreBase);
