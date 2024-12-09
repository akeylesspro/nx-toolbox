import { create } from "zustand";
import { SetState } from "akeyless-client-commons/types";
import { createSelectors, setState } from "akeyless-client-commons/helpers";
import { Board } from "akeyless-types-commons";

export interface CacheStoreType {
    boards: Board[];
    setBoards: SetState<Board[]>;
    boardsTypes: string[];
    setBoardsTypes: SetState<string[]>;
    cameraBoardsTypes: string[];
    setCameraBoardsTypes: SetState<string[]>;
}

export const CacheStoreBase = create<CacheStoreType>((set) => ({
    boards: [],
    setBoards: (updater) => setState(updater, set, "boards"),
    boardsTypes: [],
    setBoardsTypes: (updater) => setState(updater, set, "boardsTypes"),
    cameraBoardsTypes: [],
    setCameraBoardsTypes: (updater) => setState(updater, set, "cameraBoardsTypes"),
}));

export const CacheStore = createSelectors<CacheStoreType>(CacheStoreBase);
