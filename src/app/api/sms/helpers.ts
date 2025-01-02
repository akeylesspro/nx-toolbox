import { query_document, query_document_by_conditions } from "akeyless-server-commons/helpers";
import { Timestamp } from "firebase-admin/firestore";
import { OutSms, OutSmsStatus } from "./types";
import { logger } from "akeyless-server-commons/managers";

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

export const getOutSmsByContent = async (recipient: string, content: string): Promise<OutSms | null> => {
    try {
        const oneHourAgo = Timestamp.fromMillis(Timestamp.now().toMillis() - 3600 * 1000);
        return (await query_document_by_conditions(
            "nx-sms-out",
            [
                { field_name: "recipient", operator: "==", value: recipient },
                { field_name: "content", operator: "==", value: content },
                { field_name: "status", operator: "==", value: OutSmsStatus.NEW },
                { field_name: "timestamp", operator: ">", value: oneHourAgo },
            ],
            false
        )) as OutSms;
    } catch (error) {
        console.error("getOutSmsByContent  error", error);
        return null;
    }
};

export const getOutSmsById = async (id: string): Promise<OutSms | null> => {
    try {
        return (await query_document("nx-sms-out", "external_id", "==", id)) as OutSms;
    } catch (error) {
        logger.error("getOutSmsById error", error);
        return null;
    }
};
