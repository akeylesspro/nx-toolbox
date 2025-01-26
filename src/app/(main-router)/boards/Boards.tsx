"use client";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "akeyless-client-commons/hooks";
import { BoardsTable } from "./components";
import { CacheStore } from "@/lib/store";
import { useCheckPermissions } from "@/lib";

function Boards() {
    const { t } = useTranslation();
    useCheckPermissions([{ permission: "super_admin", entity: "toolbox" }]);
    useDocumentTitle(t("boards"));
    const boardsData = CacheStore.boards();
    return <BoardsTable data={boardsData} />;
}

export default Boards;
