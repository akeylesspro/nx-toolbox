import { query_document, query_document_by_conditions } from "akeyless-server-commons/helpers";
import { Timestamp } from "firebase-admin/firestore";

export const parseFormData = (formData: FormData) => {
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
        data[key] = value.toString();
    });
    return data;
};

export const parseTextToObject = (text: string) => {
    const obj: Record<string, string | null> = {};
    const regex = /([A-Za-z]+): ([^,]+)(?:, |$)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const key = match[1].trim();
        const value = match[2].trim();
        obj[key] = value === "null" ? null : value;
    }
    return obj;
};

export const getOutMessageByConditionsFromDB = async (recipient: string | null, content: string | null) => {
    try {
        const oneHourAgo = Timestamp.fromMillis(Timestamp.now().toMillis() - 3600 * 1000);
        console.log("data from getOutMessageByConditionsFromDB", {oneHourAgo,recipient,content});
        
        return await query_document_by_conditions(
            "nx-sms-out",
            [
                { field_name: "recipient", operator: "==", value: recipient },
                { field_name: "content", operator: "==", value: content },
                { field_name: "status", operator: "==", value: "new" },
                { field_name: "timestamp", operator: ">", value: oneHourAgo },
            ],
            false
        );
    } catch (error) {
        console.error("getOutMessageByConditionsFromDB error", error);
        return null;
    }
};

export const getOutMessageByIdFromDB = async (id: string | null) => {
    if (!id) {
        return null;
    }
    try {
        return await query_document("nx-sms-out", "external_id", "==", id);
    } catch (error) {
        return null;
    }
};
