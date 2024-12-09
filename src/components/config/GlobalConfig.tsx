"use client";
import React, { useEffect } from "react";
import i18n from "@/i18n";
import { QaBadge } from "../global";
import { Version } from "akeyless-client-commons/components";
import packageJson from "../../../package.json";
export function GlobalConfig() {
    useEffect(() => {
        const storedLang = localStorage?.getItem("lang") || "he";
        i18n.changeLanguage(storedLang);
    }, []);
    return (
        <>
            <Version version={packageJson.version} className="bottom-1 right-1"/>
            <QaBadge />
        </>
    );
}
