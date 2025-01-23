"use client";
import { getCameraBoardTypes } from "@/app/(main-router)/boards/helpers";
import { CacheStore } from "@/lib/store";
import { useSafeEffect, useSnapshotBulk } from "akeyless-client-commons/hooks";
import { TObject } from "akeyless-types-commons";

export default function InitialCache() {
    const setBoards = CacheStore.setBoards();
    const setClients = CacheStore.setClients();
    const setClientsObject = CacheStore.setClientsObject();
    const setUsers = CacheStore.setUsers();
    const setSettings = CacheStore.setSettings();
    const setNxSettings = CacheStore.setNxSettings();
    const setTranslation = CacheStore.setTranslation();
    const setFeatures = CacheStore.setFeatures();
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
                    setBoardTypes((prev) => (prev.includes(data[0].type) ? prev : [...prev, data[0].type]));
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
                    const filterData = data.filter((val) => val.status !== "deleted");
                    setClients(filterData);
                    setClientsObject((prev) => {
                        let newClients = prev;
                        filterData.forEach((v) => {
                            newClients[v.id] = v;
                        });
                        return newClients;
                    });
                },
                onAdd: (data) => {
                    const filterData = data.filter((val) => val.status !== "deleted");
                    setClients((prev) => {
                        return [...prev, ...filterData];
                    });
                    setClientsObject((prev) => {
                        let newClients = prev;
                        filterData.forEach((v) => {
                            newClients[v.id] = v;
                        });
                        return newClients;
                    });
                },
                onModify: (data) => {
                    const filterData = data.filter((val) => val.status !== "deleted");

                    setClients((prev) => {
                        const updatedClients = prev.map((item) => {
                            const updatedItem = filterData.find((v) => v.id === item.id);
                            return updatedItem ? updatedItem : item;
                        });
                        return updatedClients;
                    });
                    setClientsObject((prev) => {
                        let newClients = prev;
                        filterData.forEach((v) => {
                            newClients[v.id] = v;
                        });
                        return newClients;
                    });
                },
                onRemove: (data) => {
                    setClients((prev) => {
                        return prev.filter((item) => !data.some((v) => v.id === item.id));
                    });
                    setClientsObject((prev) => {
                        let newClients = prev;
                        data.forEach((v) => {
                            delete newClients[v.id];
                        });
                        return newClients;
                    });
                },
            },
            // nx-users
            {
                collectionName: "nx-users",
                onFirstTime: (data) => {
                    setUsers(data.filter((v) => v.status !== "deleted"));
                },
                onAdd: (data) => {
                    setUsers((prev) => {
                        return [...prev, ...data.filter((v) => v.status !== "deleted")];
                    });
                },
                onModify: (data) => {
                    setUsers((prev) => {
                        const updatedClients = prev.map((item) => {
                            const updatedItem = data.find((v) => v.id === item.id);
                            return updatedItem ? updatedItem : item;
                        });
                        return updatedClients.filter((v) => v.status !== "deleted");
                    });
                },
                onRemove: (data) => {
                    setUsers((prev) => {
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
            // nx-features
            {
                collectionName: "nx-features",
                onFirstTime: (data) => {
                    delete data[0].id;
                    setFeatures(data[0]);
                },
                onAdd: (data) => {
                    delete data[0].id;
                    setFeatures(data[0]);
                },
                onModify: (data) => {
                    delete data[0].id;
                    setFeatures(data[0]);
                },
                onRemove: (data) => {
                    setFeatures({});
                },
            },
        ],
        "init snapshot"
    );

    return null;
}
