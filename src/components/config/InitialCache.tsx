"use client";
import { getCameraBoardTypes } from "@/app/(main-router)/boards/helpers";
import { getAvailableReports } from "@/app/(main-router)/reports/helpers";
import { CacheStore, UserStore } from "@/lib/store";
import { auth } from "akeyless-client-commons/helpers";
import { useSafeEffect, useSnapshotBulk } from "akeyless-client-commons/hooks";
import { OnSnapshotConfig } from "akeyless-client-commons/types";
import { TObject } from "akeyless-types-commons";
import { useMemo, useRef } from "react";
import moment from "moment-timezone";

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
    const setAvailableReports = CacheStore.setAvailableReports();
    const userPermissions = UserStore.userPermissions();
    const setUserTimeZone = UserStore.setUserTimeZone();

    const pushedRef = useRef<string[]>([]);

    useSafeEffect(() => {
        const init = async () => {
            const [cameraBoardTypes, availableReports] = await Promise.all([getCameraBoardTypes(), getAvailableReports()]);
            const userTimeZone = moment.tz.guess();
            setCameraBoardTypes(cameraBoardTypes);
            setAvailableReports(availableReports.grouped);
            setUserTimeZone(userTimeZone);
        };
        init();
    }, []);
    
    const bulk = useMemo(() => {
        if (Object.keys(userPermissions).length === 0) {
            return [];
        }
        const isSuperAdmin = userPermissions.toolbox?.super_admin;
        const result: OnSnapshotConfig[] = [];
        // settings
        if (!pushedRef.current.includes("settings")) {
            result.push({
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
            });
            pushedRef.current.push("settings");
        }
        // nx-settings
        if (!pushedRef.current.includes("nx-settings")) {
            result.push({
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
            });
            pushedRef.current.push("nx-settings");
        }
        // nx-translations
        if (!pushedRef.current.includes("nx-translations")) {
            result.push({
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
            });
            pushedRef.current.push("nx-translations");
        }
        /// boards
        if (isSuperAdmin && !pushedRef.current.includes("boards")) {
            result.push({
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
            });
            pushedRef.current.push("boards");
        }
        /// nx-clients
        if (isSuperAdmin && !pushedRef.current.includes("nx-clients")) {
            result.push({
                collectionName: "nx-clients",
                onFirstTime: (data) => {
                    const filterData = data.filter((val) => val.status !== "deleted");
                    setClients(filterData);
                    setClientsObject((prev) => {
                        const newClients = prev;
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
                        const newClients = prev;
                        filterData.forEach((v) => {
                            newClients[v.id] = v;
                        });
                        return newClients;
                    });
                },
                onModify: (data) => {
                    setClients((prev) => {
                        const updatedClients = prev.map((item) => {
                            const updatedItem = data.find((v) => v.id === item.id);
                            return updatedItem ? updatedItem : item;
                        });
                        return updatedClients.filter((val) => val.status !== "deleted");
                    });

                    setClientsObject((prev) => {
                        const newClients = prev;
                        data.forEach((v) => {
                            if (v.status === "deleted") {
                                delete newClients[v.id];
                                return;
                            }
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
                        const newClients = prev;
                        data.forEach((v) => {
                            delete newClients[v.id];
                        });
                        return newClients;
                    });
                },
            });
            pushedRef.current.push("nx-clients");
        }
        // nx-users
        if (isSuperAdmin && !pushedRef.current.includes("nx-users")) {
            result.push({
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
            });
            pushedRef.current.push("nx-users");
        }
        // nx-features
        if (isSuperAdmin && !pushedRef.current.includes("nx-features")) {
            result.push({
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
            });
            pushedRef.current.push("nx-features");
        }

        return result;
    }, [userPermissions, JSON.stringify(pushedRef.current)]);
    useSnapshotBulk(bulk, "init snapshot");

    return null;
}
