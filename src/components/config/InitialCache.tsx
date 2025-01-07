"use client";
import { getCameraBoardTypes } from "@/app/(main-router)/boards/helpers";
import { CacheStore } from "@/lib/store";
import { useSafeEffect, useSnapshotBulk } from "akeyless-client-commons/hooks";
import { TObject } from "akeyless-types-commons";

export default function InitialCache() {
    const setBoards = CacheStore.setBoards();
    const setClients = CacheStore.setClients();
    const setSettings = CacheStore.setSettings();
    const setNxSettings = CacheStore.setNxSettings();
    const setTranslation = CacheStore.setTranslation();
    const setCameraBoardTypes = CacheStore.setCameraBoardTypes();
    const setBoardTypes = CacheStore.setBoardTypes();

    useSafeEffect(() => {
        const init = async () => {
            const cameraBoardTypes = await getCameraBoardTypes();
            setCameraBoardTypes(cameraBoardTypes);
        };
        init();
    }, []);

    useSnapshotBulk(
        [
            // boards
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
            // nx-clients
            {
                collectionName: "nx-clients",
                onFirstTime: (data) => {
                    setClients(data.filter((v) => v.status !== "deleted"));
                },
                onAdd: (data) => {
                    setClients((prev) => {
                        return [...prev, ...data.filter((v) => v.status !== "deleted")];
                    });
                },
                onModify: (data) => {
                    if (data) {
                    }
                    setClients((prev) => {
                        const updatedClients = prev.map((item) => {
                            const updatedItem = data.find((v) => v.id === item.id);
                            return updatedItem ? updatedItem : item;
                        });
                        return updatedClients.filter((v) => v.status !== "deleted");
                    });
                },
                onRemove: (data) => {
                    setClients((prev) => {
                        return prev.filter((item) => !data.some((v) => v.id === item.id));
                    });
                },
            },
            // settings
            {
                collectionName: "settings",
                onFirstTime: (data) => {
                    const settings: TObject<any> = {};
                    data.forEach((v) => {
                        settings[v.id] = v;
                    });
                    setSettings(settings);
                },
                onAdd: (data) => {
                    setSettings((prev) => {
                        const update = { ...prev };
                        data.forEach((v) => {
                            update[v.id] = v;
                        });
                        return update;
                    });
                },
                onModify: (data) => {
                    setSettings((prev) => {
                        const update = { ...prev };
                        data.forEach((v) => {
                            update[v.id] = v;
                        });
                        return update;
                    });
                },
                onRemove: (data) => {
                    setSettings((prev) => {
                        const update = { ...prev };
                        data.forEach((v) => {
                            delete update[v.id];
                        });
                        return update;
                    });
                },
            },
            // nx-settings
            {
                collectionName: "nx-settings",
                onFirstTime: (data) => {
                    const update: TObject<any> = {};
                    data.forEach((v) => {
                        update[v.id] = v;
                    });
                    setNxSettings(update);
                },
                onAdd: (data) => {
                    setNxSettings((prev) => {
                        const update = { ...prev };
                        data.forEach((v) => {
                            update[v.id] = v;
                        });
                        return update;
                    });
                },
                onModify: (data) => {
                    setNxSettings((prev) => {
                        const update = { ...prev };
                        data.forEach((v) => {
                            update[v.id] = v;
                        });
                        return update;
                    });
                },
                onRemove: (data) => {
                    setNxSettings((prev) => {
                        const update = { ...prev };
                        data.forEach((v) => {
                            delete update[v.id];
                        });
                        return update;
                    });
                },
            },
            // nx-translations
            {
                collectionName: "nx-translations",
                onFirstTime: (data) => {
                    const update: TObject<any> = {};
                    data.forEach((v) => {
                        update[v.id] = v;
                    });
                    setTranslation(update);
                },
                onAdd: (data) => {
                    setTranslation((prev) => {
                        const update = { ...prev };
                        data.forEach((v) => {
                            update[v.id] = v;
                        });
                        return update;
                    });
                },
                onModify: (data) => {
                    setTranslation((prev) => {
                        const update = { ...prev };
                        data.forEach((v) => {
                            update[v.id] = v;
                        });
                        return update;
                    });
                },
                onRemove: (data) => {
                    setTranslation((prev) => {
                        const update = { ...prev };
                        data.forEach((v) => {
                            delete update[v.id];
                        });
                        return update;
                    });
                },
            },
        ],
        "init snapshot"
    );

    return null;
}
