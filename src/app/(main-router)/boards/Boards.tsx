"use client";
import { Board } from "akeyless-types-commons";
import { useEffect, useState } from "react";
import { get_all_documents } from "akeyless-client-commons/helpers";
import { useTranslation } from "react-i18next";
import { useDocumentTitle, useSnapshotBulk } from "akeyless-client-commons/hooks";
import { BoardsTable } from "./comps";
import { CacheStore } from "@/lib/store";

function Boards() {
    const { t } = useTranslation();
    useDocumentTitle(t("boards"));
    const boardsData = CacheStore.boards();

    return (
        <div>
            <BoardsTable data={boardsData} />
        </div>
    );
}

export default Boards;
