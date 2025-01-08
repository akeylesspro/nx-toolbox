"use client";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "akeyless-client-commons/hooks";
import { ClientsTable } from "./components";
import { CacheStore } from "@/lib/store";
import { useEffect } from "react";

function Clients() {
    const { t } = useTranslation();
    useDocumentTitle(t("clients"));
    const clientsData = CacheStore.clients();
    useEffect(() => {
        console.log("clientsData", clientsData);
    }, [clientsData]);
    return <ClientsTable data={clientsData} />;
}

export default Clients;
