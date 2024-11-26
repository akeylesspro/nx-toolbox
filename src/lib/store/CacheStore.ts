import { create } from "zustand";
import { SetState } from "akeyless-client-commons/types";
import { createSelectors, setState } from "akeyless-client-commons/helpers";
import { Board } from "akeyless-types-commons";

export interface CacheStorType {
    boards: Board[];
    setBoards: SetState<Board[]>;
    cameraBoards: string[];
    setCameraBoards: SetState<string[]>;
}

export const CacheStoreBase = create<CacheStorType>((set) => ({
    boards: [],
    setBoards: (updater) => setState(updater, set, "boards"),
    cameraBoards: [],
    setCameraBoards: (updater) => setState(updater, set, "cameraBoards"),
}));

export const CacheStore = createSelectors<CacheStorType>(CacheStoreBase);
