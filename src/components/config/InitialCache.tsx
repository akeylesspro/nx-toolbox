"use client";
import { getCameraBoardTypes } from "@/app/(main-router)/boards/helpers";
import { CacheStore } from "@/lib/store";
import { useSafeEffect, useSnapshotBulk } from "akeyless-client-commons/hooks";
import React from "react";

export default function InitialCache() {
    const setBoards = CacheStore.setBoards();
    const setCameraBoardTypes = CacheStore.setCameraBoardTypes();
    const setBoardTypes = CacheStore.setBoardTypes();
    useSafeEffect(() => {
        const init = async () => {
            const cameraBoardTypes = await getCameraBoardTypes();
            console.log("cameraBoardTypes", cameraBoardTypes);
            setCameraBoardTypes(cameraBoardTypes);
        };
        init();
    }, []);
    useSnapshotBulk(
        [
            {
                collectionName: "boards",
                onFirstTime: (data) => {
                    setBoards(data);
                    const boardTypes = Array.from(new Set(data.map((v) => v.type as string)));
                    setBoardTypes(boardTypes);
                },
                onAdd: (data) => {
                    setBoards((prev) => {
                        return [...prev, ...data];
                    });
                },
                onModify: (data) => {
                    setBoards((prev) => {
                        const updatedBoards = prev.map((item) => {
                            const updatedItem = data.find((v) => v.id === item.id);
                            return updatedItem ? updatedItem : item;
                        });
                        return updatedBoards;
                    });
                },
                onRemove: (data) => {
                    setBoards((prev) => {
                        return prev.filter((item) => !data.some((v) => v.id === item.id));
                    });
                },
            },
        ],
        "init snapshot"
    );
    return null;
}
