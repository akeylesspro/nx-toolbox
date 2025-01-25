import { create } from "zustand";
import { SetState } from "akeyless-client-commons/types";
import { createSelectors, setState } from "akeyless-client-commons/helpers";
import { Board, Client, NxUser, TObject } from "akeyless-types-commons";
import { SettingsStoreBase } from "./SettingsStore";

export interface CacheStoreType {
    boards: Board[];
    setBoards: SetState<Board[]>;
    clients: Client[];
    setClients: SetState<Client[]>;
    clientsObject: TObject<Client>;
    setClientsObject: SetState<TObject<Client>>;
    users: NxUser[];
    setUsers: SetState<NxUser[]>;
    boardTypes: string[];
    setBoardTypes: SetState<string[]>;
    cameraBoardTypes: string[];
    setCameraBoardTypes: SetState<string[]>;
    settings: TObject<any>;
    setSettings: SetState<TObject<any>>;
    nxSettings: TObject<any>;
    setNxSettings: SetState<TObject<any>>;
    translation: TObject<any>;
    setTranslation: SetState<TObject<any>>;
    features: TObject<any>;
    setFeatures: SetState<TObject<any>>;
    getFeaturesByScope: (scope: string) => string[];
    getTranslation: (entity: string) => TObject<any> | null;
    getFeatureTranslation: (dictionary: string, key: string) => string;
    getFeaturesTranslation: (dictionary: string) => TObject<string>;
}

export const CacheStoreBase = create<CacheStoreType>((set, get) => ({
    boards: [],
    setBoards: (updater) => setState(updater, set, "boards"),
    clients: [],
    setClients: (updater) => setState(updater, set, "clients"),
    clientsObject: {},
    setClientsObject: (updater) => setState(updater, set, "clientsObject"),
    users: [],
    setUsers: (updater) => setState(updater, set, "users"),
    settings: {},
    setSettings: (updater) => setState(updater, set, "settings"),
    nxSettings: {},
    setNxSettings: (updater) => setState(updater, set, "nxSettings"),
    translation: {},
    setTranslation: (updater) => setState(updater, set, "translation"),
    features: {},
    setFeatures: (updater) => setState(updater, set, "features"),
    boardTypes: [],
    setBoardTypes: (updater) => setState(updater, set, "boardTypes"),
    cameraBoardTypes: [],
    setCameraBoardTypes: (updater) => setState(updater, set, "cameraBoardTypes"),
    getFeaturesByScope: (scope: string) => {
        const { features } = get();
        return features[scope];
    },
    getTranslation: (entity) => {
        const { translation } = get();
        const { currentLanguage } = SettingsStoreBase.getState();
        const entityTranslation = translation[entity];
        if (!entityTranslation) {
            return null;
        }
        return entityTranslation[currentLanguage] || null;
    },
    getFeatureTranslation: (dictionary, key) => {
        const featuresTranslation = get().getTranslation("features");
        if (!featuresTranslation) {
            return "N/A";
        }

        return featuresTranslation[`${dictionary}__${key}`] || "N/A";
    },
    getFeaturesTranslation: (dictionary) => {
        const featuresTranslation = get().getTranslation("features");
        if (!featuresTranslation) {
            return {};
        }
        const result: TObject<string> = {};
        Object.entries(featuresTranslation).forEach(([key, value]) => {
            if (key.startsWith(dictionary)) {
                result[key] = value;
            }
        });
        return result;
    },
}));

export const CacheStore = createSelectors<CacheStoreType>(CacheStoreBase);
