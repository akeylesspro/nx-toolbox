"use client";
import { Board, BoardStatus } from "akeyless-types-commons";
import { useTranslation } from "react-i18next";
import { timestamp_to_string } from "@/lib/helpers";
import { CacheStore, SettingsStore } from "@/lib/store";
import { Loader, Table } from "akeyless-client-commons/components";
import { memo, useMemo } from "react";
import { Timestamp } from "firebase/firestore";
import { usePrintQR } from "./helpers";

interface BoardProps {
    board: Board;
}

interface BoardsProps {
    data: Board[];
}

export const BoardsTable = memo(({ data }: BoardsProps) => {
    const { t } = useTranslation();
    const direction = SettingsStore.direction();

    const headers = [t("imei"), t("sim"), t("status"), t("type"), t("comments"), t("created_date"), t("actions")];

    const keysToRender = ["imei", "sim", "ui_status", "type", "comments", "ui_uploaded", "actions"];

    const sortKeys = ["imei", "sim", "status", "type", "comments", "created_date", "actions"];

    const filterableColumns = [
        { header: t("type"), dataKey: "type" },
        { header: t("status"), dataKey: "ui_status" },
    ];

    const formattedData = useMemo(() => {
        return data.map((val) => {
            return {
                ...val,
                actions: <BoardOptions board={val} />,
                ui_status: t(BoardStatus[val.status]) || "N/A",
                ui_uploaded: (
                    <div className="_ellipsis" title={timestamp_to_string(val.uploaded as Timestamp)} style={{ direction: "ltr" }}>
                        {timestamp_to_string(val.uploaded as Timestamp)}
                    </div>
                ),
            };
        });
    }, [data]);

    return (
        <div style={{ direction: direction }} className="w-full h-full _center">
            {formattedData.length ? (
                <Table
                    headerStyle={{ backgroundColor: "#0f172a", height: "40px" }}
                    containerHeaderClassName="h-12 justify-between px-2"
                    containerClassName="_full"
                    cellClassName="_ellipsis text-start h-10"
                    tableContainerClass="flex-1 "
                    searchInputClassName="h-6"
                    data={formattedData}
                    direction={direction}
                    headers={headers}
                    keysToRender={keysToRender}
                    includeSearch={true}
                    filterableColumns={filterableColumns}
                    sortKeys={sortKeys}
                    searchPlaceHolder={t("search")}
                    filterLabel={t("filter_by")}
                    sortLabel={t("sort_by")}
                    maxRowsLabel1={t("maxRowsLabel1")}
                    maxRowsLabel2={t("maxRowsLabel2")}
                    maxRows={100}
                />
            ) : (
                <Loader size={200} />
            )}
        </div>
    );
});
BoardsTable.displayName = "BoardsTable";

export const BoardOptions = ({ board }: BoardProps) => {
    const cameraBoards = CacheStore.cameraBoards();
    return <div className={`_center gap-3 `}>{cameraBoards.includes(board.type) && <PrintQR board={board} />}</div>;
};

const PrintQR = ({ board }: BoardProps) => {
    const { t } = useTranslation();
    const { onPrintClick, PrintableContent } = usePrintQR(board);
    return (
        <>
            <button className="text-[px]" title={t("print")} onClick={() => onPrintClick()}>
                <i className="fa-light fa-print"></i>
            </button>
            <PrintableContent />
        </>
    );
};
