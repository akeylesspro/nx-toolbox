"use client";
import React, { useEffect } from "react";
import i18n from "@/i18n";

export function GlobalConfig() {
    useEffect(() => {
        const storedLang = localStorage?.getItem("lang") || "he";
        i18n.changeLanguage(storedLang);
    }, []);
    return <></>;
}
