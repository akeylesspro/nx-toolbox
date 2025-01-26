"use client";
import { TObject } from "akeyless-types-commons";
import React, { useEffect } from "react";
import { NotActiveTable } from "./components";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "akeyless-client-commons/hooks";
import { useCheckPermissions } from "@/lib";

function NotActiveDevices({ data }: { data: TObject<any>[] }) {
    const { t } = useTranslation();
    useDocumentTitle(t("not_active_cars"));
    useCheckPermissions([
        { permission: "online_vehicles", entity: "reports" },
        { permission: "super_admin", entity: "toolbox" },
    ]);
    return <NotActiveTable data={data} />;
}

export default NotActiveDevices;
