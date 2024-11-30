"use client";
import React, { useEffect } from "react";
import i18n from "@/i18n";
import PopupsManager from "../popup/PopupsManager";
import { QaBadge } from "../global";

export function GlobalConfig() {
    useEffect(() => {
        const storedLang = localStorage?.getItem("lang") || "he";
        i18n.changeLanguage(storedLang);
    }, []);
    return (
        <>
            
            <PopupsManager />
            <QaBadge />
        </>
    );
}
