"use client";
import { create } from "zustand";
import { createSelectors, setState } from "akeyless-client-commons/helpers";
import { isBrowser } from "@/lib/helpers";

interface SettingsStoreType {
    currentLanguage: "he" | "en";
    isLangHe: boolean;
    direction: "ltr" | "rtl";
    setDirection: (updater?: any) => void;
}

const initialDirection = (): "ltr" | "rtl" => {
    const lang = isBrowser() ? (localStorage.getItem("lang") as "he" | "en" | undefined) : undefined;
    if (lang) {
        return lang == "he" ? "rtl" : "ltr";
    }

    return "rtl";
};
const initialLang = (): "he" | "en" => {
    const lang = isBrowser() ? (localStorage.getItem("lang") as "he" | "en" | undefined) : undefined;
    if (lang) {
        return lang;
    }
    return "he";
};
const initialIsLangHe = (): boolean => {
    const lang = isBrowser() ? (localStorage.getItem("lang") as "he" | "en" | undefined) : undefined;
    if (lang) {
        return lang == "he" ? true : false;
    }

    return true;
};

export const SettingsStoreBase = create<SettingsStoreType>((set, get) => ({
    currentLanguage: initialLang(),
    isLangHe: initialIsLangHe(),
    direction: initialDirection(),
    setDirection: (updater) =>
        set((state) => {
            const newDirection = typeof updater === "function" ? updater(state.direction) : updater;
            return {
                direction: newDirection,
                currentLanguage: newDirection === "rtl" ? "he" : "en",
                isLangHe: newDirection === "rtl",
            };
        }),
}));

export const SettingsStore = createSelectors<SettingsStoreType>(SettingsStoreBase);
