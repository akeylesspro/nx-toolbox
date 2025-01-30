import { Button } from "@/components";
import { cn, PRIMARY_BORDER } from "@/lib";
import { CacheStore, PopupsStore, SettingsStore, UserStore } from "@/lib/store";
import { memo, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GenericReport, getReport } from "./helpers";
import moment from "moment";
import { displayFormatPhoneNumber, formatCarNumber, renderOnce, timestamp_to_string } from "akeyless-client-commons/helpers";
import { CountryOptions, Geo, ReportMetaDataType, TObject } from "akeyless-types-commons";
import { BooleanUi, GeoUi, GeoUiProps, Loader, NumberUI, PhoneUI, Table, TableProps, TimesUI } from "akeyless-client-commons/components";
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
    useEffect(() => {
        console.log("availableReports", availableReports);
    }, [availableReports]);
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
    const currentLanguage = SettingsStore.currentLanguage();
    const reportsTranslation = CacheStore.getTranslation()("reports");
    const groupNameUi = reportsTranslation["group__" + groupName] || groupName;
    return (
        <div className={`px-4 py-2 flex flex-col gap-3 w-80   ${PRIMARY_BORDER} border-2 rounded-md h-80 `}>
            <div className={`border-b-2 ${PRIMARY_BORDER} text-2xl text-center pb-1`}>{groupNameUi}</div>
            <div className={`flex flex-wrap gap-2 justify-center max-h-full overflow-auto`}>
                {reports.map((reportId, index) => {
                    return <ReportButton key={reportId + index} reportId={reportId} />;
                })}
            </div>
        </div>
    );
}, renderOnce);
ReportGroup.displayName = "ReportGroup";

interface PropsWithReportId {
    reportId: string;
}

/// Report button
export const ReportButton = memo(({ reportId }: PropsWithReportId) => {
    const addPopup = PopupsStore.addPopup();
    const { t } = useTranslation();
    const currentLanguage = SettingsStore.currentLanguage();
    const reportsTranslation = CacheStore.getTranslation()("reports");
    const reportName = reportsTranslation["name__" + reportId];
    const reportNameUi = reportName || reportId;
    const onClick = () => {
        addPopup({
            element: <ReportTable reportId={reportId} />,
            id: "report " + reportId,
            type: "custom",
            headerContent: reportNameUi,
            headerIcon: t("reports"),
            initialPosition: { top: "10px", left: "10px" },
            className: "w-[98%] h-[98%] ",
            contentClassName: "w-full h-[90%] p-4",
            minimize: { enabled: true },
        });
    };
    return (
        <Button className="w-full mx-2 " title={reportNameUi} disabled={!reportName} onClick={onClick}>
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
        const headerUi = reportsTranslation["header__" + header.name] || header.name.replace("_", " ");
        return headerUi;
    });
    const sortKeys = reportData?.meta.headers.map((header) => header.name);
    const keysToRender = reportData?.meta.headers.map((header, index) => {
        const headerType = header.type;
        const headerName = header.name;
        const rule = (["datetime", "date", "time", "car_number", "phone", "number", "geo", "boolean", ""] as ReportMetaDataType[]).includes(
            headerType
        );
        const key = rule ? headerName + "_ui" : headerName;
        return key;
    });

    const formattedData = useMemo(() => {
        return reportData?.data.map((row) => {
            const result: TObject<any> = {};
            row.forEach((cell, cellIndex) => {
                const header = reportData.meta.headers[cellIndex];
                const headerType = header.type;
                const headerName = header.name;
                if ([null, ""].includes(cell as any)) {
                    result[headerName + "_ui"] = "";
                    result[headerName] = "";
                    return;
                }
                result[headerName] = cell;
                switch (headerType) {
                    case "datetime":
                        result[headerName + "_ui"] = <TimesUI timestamp={new Date(cell as Date)} tz={userTimeZone} direction={direction} />;
                        break;
                    case "date":
                        result[headerName + "_ui"] = (
                            <TimesUI timestamp={new Date(cell as Date)} tz={userTimeZone} format="DD/MM/YYYY" direction={direction} />
                        );
                        break;
                    case "time":
                        result[headerName + "_ui"] = (
                            <TimesUI timestamp={new Date(cell as Date)} tz={userTimeZone} format="hh:mm:ss" direction={direction} />
                        );
                        break;
                    case "car_number":
                        result[headerName + "_ui"] = formatCarNumber(cell as string);
                        break;
                    case "phone":
                        result[headerName + "_ui"] = <PhoneUI phone={cell as string} direction={direction} />;
                        break;
                    case "boolean":
                        result[headerName + "_ui"] = <BooleanUi value={Boolean(cell)} />;
                        break;
                    case "geo":
                        result[headerName + "_ui"] = <GeoUi value={cell as GeoUiProps["value"]} />;
                        break;
                    case "number":
                        result[headerName + "_ui"] = <NumberUI number={cell as string} direction={direction} />;
                        // result[headerName + "_ui"] = <NumberUI number={cell as string | number} direction={direction} />;
                        break;
                    default:
                        break;
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
        sortKeys: sortKeys,
        // styles
        containerHeaderClassName: "h-12 justify-between",
        containerClassName: "_full ",
        tableContainerClass: "_full",
        cellClassName: "_ellipsis text-start p-1 text-sl text-xs w-fit max-w-[20px]",
        headerCellClassName: "px-0.5 text-sm w-fit max-w-[20px]",
        headerClassName: " bg-[#5f9ea0] h-8 ",
        searchInputClassName: "h-10 w-1/4",
        zebraStriping: {},
        // labels
        searchPlaceHolder: t("search"),
        sortLabel: t("sort_by"),
        maxRowsLabel1: t("maxRowsLabel1"),
        maxRowsLabel2: t("maxRowsLabel2"),
    };

    return reportData ? <Table {...tableProps} /> : <Loader className="w-[1000px]  h-[600px] _center" size={250} />;
});
ReportTable.displayName = "ReportTable";
