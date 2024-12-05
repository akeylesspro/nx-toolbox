import { get_all_documents, get_document_by_id } from "akeyless-client-commons/helpers";
import { TObject } from "akeyless-types-commons";

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
