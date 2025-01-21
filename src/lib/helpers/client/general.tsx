import { FetchDataOptions } from "@/types";
import { i18n } from "i18next";
import { Timestamp } from "firebase/firestore";
import moment from "moment";
import { baseUrl, isBrowser } from "../global";

export const changeLanguage = (lang: string, i18n: i18n, setDirection: (updater: "ltr" | "rtl") => void) => {
    localStorage.setItem("lang", lang);
    if (lang === "en") {
        setDirection("ltr");
        i18n.changeLanguage(lang);
    } else {
        setDirection("rtl");
        i18n.changeLanguage("he");
    }
};

export const fetchData = async ({ url, token, method = "GET", data }: FetchDataOptions) => {
    try {
        const headers: Record<string, string> = {};
        if (!token) {
            throw new Error("Token is required for server-side requests");
        }
        headers["Cookie"] = `token=${token}`;

        const response = await fetch(`${baseUrl()}/${url}`, {
            method: data ? "POST" : method,
            headers,
            body: data ? JSON.stringify(data) : undefined,
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

export function timestamp_to_string(firebaseTimestamp: Timestamp, format: string = "DD-MM-YYYY HH:mm:ss"): string {
    const timestamp = new Timestamp(firebaseTimestamp?.seconds, firebaseTimestamp?.nanoseconds);
    return moment(timestamp.toDate()).utc().format(format);
}

