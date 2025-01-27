"use client";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "akeyless-client-commons/hooks";
import { ClientsTable } from "./components";
import { CacheStore } from "@/lib/store";
import { useCheckPermissions } from "@/lib";

function Clients() {
    const { t } = useTranslation();
    useDocumentTitle(t("clients"));
    const clientsData = CacheStore.clients();
    useCheckPermissions([{ permission: "super_admin", entity: "toolbox" }]);
    return <ClientsTable data={clientsData} />;
}

export default Clients;
