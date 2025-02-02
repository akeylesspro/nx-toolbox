"use client";
import { useCheckPermissions } from "@/lib";
import React from "react";
import { Header, ReportGroups } from "./components";
import { CacheStore, SettingsStore } from "@/lib/store";
import { Loader } from "akeyless-client-commons/components";

function Reports() {
    useCheckPermissions([{ entity: "reports" }, { permission: "super_admin", entity: "toolbox" }]);
    const direction = SettingsStore.direction();
    const availableReports = CacheStore.availableReports();
    return Object.keys(availableReports).length > 0 ? (
        <div style={{ direction }} className="_full flex flex-col items-center gap-6 p-4">
            <Header />
            <ReportGroups />
        </div>
    ) : (
        <Loader size={200} />
    );
}

export default Reports;
