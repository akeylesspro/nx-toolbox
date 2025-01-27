"use client";
import { Button } from "@/components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";

function ErrorPage({ error }: { error?: string }) {
    const { t } = useTranslation();
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center gap-10">
            <h1 className="text-4xl">{error || t("not_allowed_page")}</h1>
            <Button onClick={() => router.push("/")}>{t("back_to_home_page")}</Button>
        </div>
    );
}

export default ErrorPage;
