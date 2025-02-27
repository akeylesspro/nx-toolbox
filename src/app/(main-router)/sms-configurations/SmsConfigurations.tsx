"use client";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "akeyless-client-commons/hooks";
import { SmsConfigurationsTable } from "./components";
import { CacheStore } from "@/lib/store";
import { useCheckPermissions } from "@/lib";

function SmsConfigurations() {
    const { t } = useTranslation();
    useDocumentTitle(t("sms_configurations"));
    useCheckPermissions([{ permission: "super_admin", entity: "toolbox" }]);
    const smsConfigurationsData = CacheStore.smsConfigurations();
    return <SmsConfigurationsTable data={smsConfigurationsData} />;
}

export default SmsConfigurations;
