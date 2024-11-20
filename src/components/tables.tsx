"use client";
import { timestamp_to_string } from "@/lib/helpers";
import { SettingsStore } from "@/lib/store";
import { Loader, Table } from "akeyless-client-commons/components";
import { BoardStatus, TObject } from "akeyless-types-commons";
import { memo } from "react";
import { useTranslation } from "react-i18next";

interface BardsTableProps {
    data: TObject<any>[];
}

export const BoardsTable = memo(({ data }: BardsTableProps) => {
    const { t } = useTranslation();
    const direction = SettingsStore.direction();

    const headers = [t("imei"), t("sim"), t("status"), t("type"), t("comments"), t("created_date"), t("actions")];

    const keysToRender = ["imei", "sim", "ui_status", "type", "comments", "ui_uploaded", "actions"];

    const sortKeys = ["imei", "sim", "status", "type", "comments", "created_date", "actions"];

    // filter
    const filterableColumns = [
        { header: t("type"), dataKey: "type" },
        { header: t("status"), dataKey: "ui_status" },
    ];

    const formattedData = data.map((val) => {
        return {
            ...val,
            actions: <div className={`center gap-3 bg-red-500`}></div>,
            ui_status: t(BoardStatus[val.status]) || "N/A",
            ui_uploaded: (
                <div className="_ellipsis" title={timestamp_to_string(val.uploaded)} style={{ direction: "ltr" }}>
                    {timestamp_to_string(val.uploaded)}
                </div>
            ),
        };
    });
    console.log("formattedData", formattedData);

    return (
        <div style={{ direction: direction }} className="w-full h-full _center">
            {formattedData.length ? (
                <Table
                    // headerStyle={{ backgroundColor: "#0f172a",te }}
                    containerClassName="_full"
                    tableContainerClass=""
                    data={formattedData}
                    direction={direction}
                    cellStyle={{ textAlign: "start", direction: "ltr" }}
                    headers={headers}
                    keysToRender={keysToRender}
                    includeSearch={true}
                    filterableColumns={filterableColumns}
                    sortKeys={sortKeys}
                    searchPlaceHolder={t("search")}
                    filterLabel={t("filter_by")}
                    sortLabel={t("sort_by")}
                />
            ) : (
                <Loader size={200} />
            )}
        </div>
    );
});
BoardsTable.displayName = "BoardsTable";
