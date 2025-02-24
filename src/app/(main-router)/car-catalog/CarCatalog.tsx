"use client";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "akeyless-client-commons/hooks";
import { CarCatalogTable } from "./components";
import { CacheStore } from "@/lib/store";
import { useCheckPermissions } from "@/lib";

function CarCatalog() {
    const { t } = useTranslation();
    useDocumentTitle(t("carCatalog"));
    const carCatalogData = CacheStore.carCatalog();
    useCheckPermissions([{ permission: "super_admin", entity: "toolbox" }]);
    return <CarCatalogTable data={carCatalogData} />;
}

export default CarCatalog;
