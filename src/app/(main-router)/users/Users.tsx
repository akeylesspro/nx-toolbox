"use client";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "akeyless-client-commons/hooks";
import { UsersTable } from "./components";
import { CacheStore } from "@/lib/store";
import { useCheckPermissions } from "@/lib";

function Users() {
    const { t } = useTranslation();
    useDocumentTitle(t("users"));
    useCheckPermissions([{ permission: "super_admin", entity: "toolbox" }]);
    const data = CacheStore.users();

    return <UsersTable data={data} />;
}

export default Users;
