import { Button } from "@/components";
import { cn, PRIMARY_BORDER } from "@/lib";
import { CacheStore, PopupsStore, SettingsStore, UserStore } from "@/lib/store";
import { memo, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GenericReport, getReport } from "./helpers";
import moment from "moment";
import { displayFormatPhoneNumber, formatCarNumber, renderOnce, timestamp_to_string } from "akeyless-client-commons/helpers";
import { CountryOptions, TObject } from "akeyless-types-commons";
import { Loader, PhoneUI, Table, TableProps, TimesUI } from "akeyless-client-commons/components";
import { CarPlate } from "akeyless-assets-commons";
import { Timestamp } from "firebase/firestore";

/// Header
export const Header = () => {
    const { t } = useTranslation();
    return <div className={`w-full text-center py-2.5 text-4xl font-bold border-b-2 ${PRIMARY_BORDER}`}>{t("reports")}</div>;
};

///  Report groups
export const ReportGroups = () => {
    const availableReports = CacheStore.availableReports();
    return (
        <div className={`w-full overflow-auto flex flex-wrap  gap-4 `}>
            {Object.keys(availableReports).map((groupName, index) => {
                return <ReportGroup key={groupName + index} groupName={groupName} reports={availableReports[groupName]} />;
            })}
        </div>
    );
};

///  Report group
interface ReportGroupProps {
    groupName: string;
    reports: string[];
}
export const ReportGroup = memo(({ groupName, reports }: ReportGroupProps) => {
    const reportsTranslation = CacheStore.getTranslation()("reports");
    const groupNameUi = reportsTranslation["group__" + groupName] || "N/A";
    return (
        <div className={`px-4 py-2 flex flex-col gap-3 max-w-[49%]  ${PRIMARY_BORDER} border-2 rounded-md `}>
            <div className={`border-b-2 ${PRIMARY_BORDER} text-2xl text-center pb-1`}>{groupNameUi}</div>
            <div className={`flex flex-wrap gap-2 `}>
                {reports.map((reportId, index) => {
                    return <ReportButton key={reportId + index} reportId={reportId} />;
                })}
            </div>
        </div>
    );
}, renderOnce);

interface PropsWithReportId {
    reportId: string;
}

/// Report button
export const ReportButton = memo(({ reportId }: PropsWithReportId) => {
    const addPopup = PopupsStore.addPopup();
    const reportsTranslation = CacheStore.getTranslation()("reports");
    const reportName = reportsTranslation["name__" + reportId];
    const reportNameUi = reportName || reportId;
    const onClick = () => {
        addPopup({
            element: <ReportTable reportId={reportId} />,
            id: "report " + reportId,
            type: "custom",
            headerContent: reportNameUi,
            initialPosition: { top: "100px", left: "50px" },
        });
    };
    return (
        <Button title={reportNameUi} disabled={!reportName} onClick={onClick}>
            {reportNameUi}
        </Button>
    );
});
ReportButton.displayName = "ReportButton";

/// Report table
export const ReportTable = memo(({ reportId }: PropsWithReportId) => {
    const { t } = useTranslation();
    const reportsTranslation = CacheStore.getTranslation()("reports");
    const userTimeZone = UserStore.userTimeZone();
    const direction = SettingsStore.direction();
    const isRtl = SettingsStore.isRtl();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const [reportData, setReportData] = useState<GenericReport | null>(null);

    /// get report data
    useEffect(() => {
        (async () => {
            try {
                const data = await getReport(reportId);
                if (!data) {
                    throw new Error("report_server_error");
                }
                setReportData(data);
            } catch (error: any) {
                const errorDisplay = t((error.message || "report_error").replace("{reportId}", reportId));
                console.error("error fetching report", error);
                deletePopup("report " + reportId);
                addPopup({
                    element: <div className="p-16">{errorDisplay}</div>,
                    id: "report error" + reportId,
                    type: "error",
                    headerContent: t("report_error").replace("{reportId}", reportId),
                    initialPosition: { top: "300px", left: "500px" },
                });
            }
        })();
    }, []);

    const headers = reportData?.meta.headers.map((header) => {
        const headerUi = reportsTranslation["header__" + header.name] || header.name;
        return headerUi;
    });

    const keysToRender = reportData?.meta.headers.map((header, index) => {
        const headerType = header.type;
        const headerName = header.name;
        const rule = ["datetime", "car_number", "phone"].includes(headerType);
        let key = rule ? headerName + "_ui" : headerName;
        return key;
    });

    const formattedData = useMemo(() => {
        return reportData?.data.map((row) => {
            const result: TObject<any> = {};
            row.forEach((cell, cellIndex) => {
                const header = reportData.meta.headers[cellIndex];
                const headerType = header.type;
                const headerName = header.name;
                switch (headerType) {
                    case "datetime":
                        result[headerName + "_ui"] = <TimesUI timestamp={new Date(cell)} tz={userTimeZone} direction={direction} />;
                        break;
                    case "car_number":
                        result[headerName + "_ui"] = formatCarNumber(cell);
                        break;
                    case "phone":
                        result[headerName + "_ui"] = <PhoneUI phone={cell} direction={direction} />;
                        break;
                    default:
                        result[headerName] = cell;
                }
            });
            return result;
        });
    }, [reportData, isRtl]);

    const tableProps: TableProps = {
        // settings
        includeSearch: true,
        maxRows: 100,
        // data
        data: formattedData!,
        direction: direction,
        headers: headers!,
        keysToRender: keysToRender!,
        sortKeys: keysToRender,
        // styles
        headerStyle: { backgroundColor: "#5f9ea0", height: "40px", fontSize: "18px" },
        containerHeaderClassName: "h-12 justify-between ",
        containerClassName: "min-w-[1000px] p-4 h-[600px]",
        cellClassName: "_ellipsis text-start h-10  px-2",
        tableContainerClass: "w-full",
        searchInputClassName: "h-10 w-1/4",
        headerCellClassName: "w-10",
        // labels
        searchPlaceHolder: t("search"),
        sortLabel: t("sort_by"),
        maxRowsLabel1: t("maxRowsLabel1"),
        maxRowsLabel2: t("maxRowsLabel2"),
    };

    return reportData ? <Table {...tableProps} /> : <Loader className="w-[1000px]  h-[600px] _center" size={250} />;
});
ReportTable.displayName = "ReportTable";
