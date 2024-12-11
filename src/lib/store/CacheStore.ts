import { create } from "zustand";
import { SetState } from "akeyless-client-commons/types";
import { createSelectors, setState } from "akeyless-client-commons/helpers";
import { Board } from "akeyless-types-commons";

export interface CacheStoreType {
    boards: Board[];
    setBoards: SetState<Board[]>;
    boardTypes: string[];
    setBoardTypes: SetState<string[]>;
    cameraBoardTypes: string[];
    setCameraBoardTypes: SetState<string[]>;
}

export const CacheStoreBase = create<CacheStoreType>((set) => ({
    boards: [],
    setBoards: (updater) => setState(updater, set, "boards"),
    boardTypes: [],
    setBoardTypes: (updater) => setState(updater, set, "boardTypes"),
    cameraBoardTypes: [],
    setCameraBoardTypes: (updater) => setState(updater, set, "cameraBoardTypes"),
}));

export const CacheStore = createSelectors<CacheStoreType>(CacheStoreBase);
