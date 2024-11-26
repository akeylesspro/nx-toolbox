"use client";
import { getCameraBoardsTypes } from "@/lib/helpers";
import { CacheStore } from "@/lib/store";
import { useSafeEffect, useSnapshotBulk } from "akeyless-client-commons/hooks";
import React from "react";

export default function InitialCache() {
    const setBoards = CacheStore.setBoards();
    const setCameraBoards = CacheStore.setCameraBoards();
    useSnapshotBulk(
        [
            {
                collectionName: "boards",
                onFirstTime: (data) => {
                    setBoards(data);
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
    useSafeEffect(() => {
        (async () => {
            const cameraBoards = await getCameraBoardsTypes();
            console.log("cameraBoards", cameraBoards);
            setCameraBoards(cameraBoards);
        })();
    }, []);
    return <></>;
}
