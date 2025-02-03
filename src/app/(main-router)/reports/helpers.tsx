import axios from "axios";
import { biUrl } from "@/lib/helpers";
import { auth } from "akeyless-client-commons/helpers";
import { ReportDataRow, ReportMeta, ReportMetaHeader, TObject } from "akeyless-types-commons";
export interface AvailableReports {
    list: TObject<string>[];
    grouped: TObject<string>;
}
export const getAvailableReports = async (token: string): Promise<AvailableReports> => {
    try {
        const response = await axios({
            method: "GET",
            headers: {
                authorization: "bearer " + token,
            },
            url: biUrl + "/reports/available",
        });
        if (!response.data.success) {
            throw new Error(response.data.error || "reports/available error");
        }
        return response.data.data;
    } catch (error) {
        console.error("error fetching available reports", error);
        return { list: [], grouped: {} };
    }
};

export const getAllReports = async (token: string): Promise<AvailableReports> => {
    try {
        const response = await axios({
            method: "GET",
            headers: {
                authorization: "bearer " + token,
            },
            url: biUrl + "/reports/all",
        });
        if (!response.data.success) {
            throw new Error(response.data.error || "reports/all error");
        }
        return response.data.data;
    } catch (error) {
        console.error("error fetching all reports", error);
        return { list: [], grouped: {} };
    }
};

export interface GenericReport {
    meta: ReportMeta;
    data: ReportDataRow[];
}
export const getReport = async (reportId: string): Promise<GenericReport | null> => {
    try {
        const response = await axios({
            method: "POST",
            headers: {
                authorization: "bearer " + auth.currentUser?.accessToken,
            },
            url: biUrl + "/reports/report/" + reportId,
        });
        if (!response.data.success) {
            throw new Error(response.data.error || `reports/report/${reportId} error`);
        }
        return response.data.data;
    } catch (error) {
        console.log("error fetching available reports", error);
        return null;
    }
};
