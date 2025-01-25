import { MultipleSelectorOption } from "akeyless-client-commons/components";
import {
    add_document,
    collections,
    fire_base_TIME_TEMP,
    local_israel_phone_format,
    query_document,
    set_document,
} from "akeyless-client-commons/helpers";
import { NxUser, TObject } from "akeyless-types-commons";
import { doc, setDoc } from "firebase/firestore";

export const updateUser = async (id: string, data: TObject<any>) => {
    try {
        const updatedUser: TObject<any> = { ...data, updated: fire_base_TIME_TEMP() };
        if (updatedUser.id) {
            delete updatedUser.id;
        }
        await set_document("nx-users", id, { ...data, updated: fire_base_TIME_TEMP() });
    } catch (error) {
        console.error("error from updateUser ", error);
        throw "error from updateUser";
    }
};

export const addUser = async (data: TObject<any>) => {
    try {
        
        const created = fire_base_TIME_TEMP();
        const updated = fire_base_TIME_TEMP();
        const newUserData = {
            ...data,
            status: "active",
            created,
            updated,
        };
        console.log("new User", newUserData);
        await add_document("nx-users", newUserData);
    } catch (error) {
        console.error("error from addUser ", error);
        throw "error from addUser";
    }
};

export const onSearchClients = async (query: string, options: any[]) => {
    const result = options.filter((op) => {
        return op.label.toLocaleLowerCase().includes(query) || op.key.toLocaleLowerCase().includes(query);
    });
    return (result.length ? result : options) as MultipleSelectorOption[];
};
