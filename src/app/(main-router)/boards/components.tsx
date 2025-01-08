"use client";
import { Board, BoardStatus } from "akeyless-types-commons";
import { useTranslation } from "react-i18next";
import { timestamp_to_string } from "@/lib/helpers";
import { CacheStore, SettingsStore } from "@/lib/store";
import { Loader, ModularForm, Table } from "akeyless-client-commons/components";
import { forwardRef, memo, useEffect, useMemo, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { TableProps } from "akeyless-client-commons/types";
import { Button } from "@/components";
import { useAddBoard, useDeleteBoard, useEditBoard, usePrintQR } from "./hooks";
import Image from "next/image";
import { TableButton, TableOptionsWarper, TimesUI } from "@/components/utils";

interface PropsWithBoard {
    board: Board;
}

interface PropsWithBoards {
    data: Board[];
}

export const BoardsTable = memo(({ data }: PropsWithBoards) => {
    const { t } = useTranslation();
    const direction = SettingsStore.direction();
    const isRtl = SettingsStore.isRtl();
    const headers = [t("imei"), t("sim"), t("status"), t("type"), t("comments"), t("created_date"), t("actions")];

    const keysToRender = useMemo(() => ["imei", "sim_ui", "ui_status", "type", "comments", "ui_uploaded", "actions"], []);

    const sortKeys = useMemo(() => ["imei", "sim", "status", "type", "comments", "created_date", "actions"], []);

    const filterableColumns = [
        { header: t("type"), dataKey: "type" },
        { header: t("status"), dataKey: "ui_status" },
    ];

    const formattedData = useMemo(() => {
        return data.map((board) => {
            return {
                ...board,
                actions: (
                    <TableOptionsWarper>
                        <EditBoard board={board} />
                        <DeleteBoard board={board} />
                        <PrintQR board={board} />
                    </TableOptionsWarper>
                ),
                ui_status: t(BoardStatus[board.status]) || "N/A",
                ui_uploaded: <TimesUI timestamp={board.uploaded} />,
                sim_ui: (
                    <div style={{ direction: "ltr" }} className={`w-full ${isRtl ? "text-end" : "text-start"}`}>
                        {board.sim}
                    </div>
                ),
            };
        });
    }, [data, isRtl]);

    const tableProps: TableProps = {
        // settings
        includeSearch: true,
        maxRows: 100,
        // data
        data: formattedData,
        direction: direction,
        headers: headers,
        keysToRender: keysToRender,
        filterableColumns: filterableColumns,
        sortKeys: sortKeys,
        // styles
        headerStyle: { backgroundColor: "cadetblue", height: "40px", fontSize: "18px" },
        containerHeaderClassName: "h-12 justify-between",
        containerClassName: "_full",
        cellClassName: "_ellipsis text-start h-10 px-3",
        tableContainerClass: "flex-1",
        searchInputClassName: "h-10 w-1/4",
        // labels
        searchPlaceHolder: t("search"),
        filterLabel: t("filter_by"),
        sortLabel: t("sort_by"),
        maxRowsLabel1: t("maxRowsLabel1"),
        maxRowsLabel2: t("maxRowsLabel2"),
        optionalElement: <AddBoard />,
    };

    return (
        <div className="p-3">
            <div style={{ direction: direction }} className="w-full h-full _center">
                {formattedData.length ? <Table {...tableProps} /> : <Loader size={200} />}
            </div>
        </div>
    );
});
BoardsTable.displayName = "BoardsTable";

const PrintQR = ({ board }: PropsWithBoard) => {
    const { t } = useTranslation();
    const cameraBoardTypes = CacheStore.cameraBoardTypes();
    const { onPrintClick, PrintableContent } = usePrintQR();
    return (
        <TableButton title={t("print")} type="custom" onClick={() => onPrintClick(board, cameraBoardTypes.includes(board.type))}>
            <Image src={"/images/qr.png"} alt="qr.png" width={23} height={23} />
            <PrintableContent />
        </TableButton>
    );
};

const AddBoard = () => {
    const { t } = useTranslation();
    const { onAddClick, PrintableContent } = useAddBoard();
    return (
        <>
            <TableButton type="add" onClick={onAddClick} title={t("add_board")} />
            <PrintableContent />
        </>
    );
};

const EditBoard = ({ board }: PropsWithBoard) => {
    const onEditClick = useEditBoard();
    const { t } = useTranslation();

    return <TableButton type="edit" title={t("edit_board")} onClick={() => onEditClick(board)} />;
};

const DeleteBoard = ({ board }: PropsWithBoard) => {
    const { t } = useTranslation();
    const onDeleteClick = useDeleteBoard();
    return <TableButton type="delete" title={t("delete_board")} onClick={() => onDeleteClick(board)} />;
};

interface PrintableContentProps {
    imgData: string | null;
    boardState: Board | null;
}
const PrintUi = ({ boardState, imgData }: PrintableContentProps) => {
    return (
        <div className="h-1/2 flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-[90px] h-[90px]" alt="QR Code" src={imgData || undefined} />
            <div className="flex flex-col gap-1 items-center justify-center">
                <div className="max-w-[90px] text-[10px]  break-words">{boardState?.imei}</div>
                <div className="max-w-[90px] text-[10px]  break-words">{boardState?.type}</div>
            </div>
        </div>
    );
};
const PrintableContent = forwardRef<HTMLDivElement, PrintableContentProps>(({ imgData, boardState }, ref) => (
    <div style={{ display: "none" }}>
        <div ref={ref} className="h-full">
            <PrintUi imgData={imgData} boardState={boardState} />
            <PrintUi imgData={imgData} boardState={boardState} />
        </div>
    </div>
));
PrintableContent.displayName = "PrintableContent";

export { PrintableContent };
