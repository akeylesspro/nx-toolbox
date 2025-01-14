import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { createSelectors, setState } from "akeyless-client-commons/helpers";
import { DecodedUser } from "@/types";
import { NxUser } from "akeyless-types-commons";
import { SetState } from "akeyless-client-commons/types";
import { getCookie } from "cookies-next";

export interface UserStorType {
    activeUser: NxUser | null;
    setActiveUser: SetState<NxUser | null>;
}

function get_user_by_token(token?: string): NxUser | null {
    const user = token ? jwtDecode<DecodedUser>(token) : null;
    if (user) {
        return { id: user.user_id, phone_number: user.phone_number };
    }
    return null;
}

export const UserStoreBase = create<UserStorType>((set) => ({
    activeUser: get_user_by_token(getCookie("token") as string),
    setActiveUser: (updater) => setState(updater, set, "activeUser"),
}));

export const UserStore = createSelectors<UserStorType>(UserStoreBase);
