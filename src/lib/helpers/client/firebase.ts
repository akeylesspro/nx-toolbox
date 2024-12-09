import {
    collections,
    delete_document,
    fire_base_TIME_TEMP,
    get_all_documents,
    get_document_by_id,
    set_document,
} from "akeyless-client-commons/helpers";
import { TObject } from "akeyless-types-commons";
import { doc, setDoc } from "firebase/firestore";

export const getCameraProtectionsTypes = async () => {
    const data = await get_document_by_id("settings", "protection_features");
    const result = Object.keys(data).reduce<TObject<any>>((acc, key) => {
        if (data[key].camera) {
            acc[key] = { ...data[key] };
        }
        return acc;
    }, {});
    return result;
};

export const getCameraBoardsTypes = async () => {
    const cameraProtections = await getCameraProtectionsTypes();
    const protectionsTypes = await get_all_documents("protectionTypes");
    const filter_data: string[] = protectionsTypes
        .filter((val) => {
            return Object.keys(cameraProtections).includes(val.name);
        })
        .map((val) => val.boardTypes)
        .flat()
        .map((v) => v.name);

    return filter_data;
};

export const updateBoardFB = async (id: string, data: TObject<any>) => {
    try {
        await set_document("boards", id, { ...data, update: fire_base_TIME_TEMP() });
    } catch (error) {
        console.log("error from addBoardFB ", error);
    }
};

export const addBoardFB = async (data: TObject<any>) => {
    try {
        const ref = doc(collections.boards);
        const update: TObject<any> = { ...data, id: ref.id, token: [...ref.id].reverse().join("") };
        await setDoc(ref, update);
        return update;
    } catch (error) {
        console.log("error from addBoardFB ", error);
        return false;
    }
};

