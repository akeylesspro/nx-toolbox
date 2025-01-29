import axios from "axios";
import { biUrl } from "@/lib/helpers";
import { auth } from "akeyless-client-commons/helpers";
import { TObject } from "akeyless-types-commons";
export interface availableReports {
    list: TObject<string>[];
    grouped: TObject<string>;
}
export const getAvailableReports = async (): Promise<availableReports> => {
    try {
        const response = await axios({
            method: "GET",
            headers: {
                authorization: "bearer " + auth.currentUser.accessToken,
            },
            url: biUrl + "/reports/available",
        });
        return response.data.data;
    } catch (error) {
        console.log("error fetching available reports", error);
        return { list: [], grouped: {} };
    }
};

export interface GenericReport {
    meta: { headers: { name: string; type: string }[] };
    data: string[][];
}
export const getReport = async (reportId: string): Promise<GenericReport | null> => {
    try {
        const response = await axios({
            method: "POST",
            headers: {
                authorization: "bearer " + auth.currentUser.accessToken,
            },
            url: biUrl + "/reports/report/" + reportId,
        });
        return response.data.data;
    } catch (error) {
        console.log("error fetching available reports", error);
        return null;
    }
};
