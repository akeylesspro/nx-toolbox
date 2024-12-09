"use client";
import { getCameraBoardsTypes } from "@/lib/helpers";
import { CacheStore } from "@/lib/store";
import { useSafeEffect, useSnapshotBulk } from "akeyless-client-commons/hooks";
import React from "react";

export default function InitialCache() {
    const setBoards = CacheStore.setBoards();
    const setCameraBoardsTypes = CacheStore.setCameraBoardsTypes();
    const setBoardsTypes = CacheStore.setBoardsTypes();
    useSafeEffect(() => {
        const init = async () => {
            const cameraBoardsTypes = await getCameraBoardsTypes();
            console.log("cameraBoardsTypes", cameraBoardsTypes);
            setCameraBoardsTypes(cameraBoardsTypes);
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
                    setBoardsTypes(boardTypes);
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
