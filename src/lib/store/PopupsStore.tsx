import { create } from "zustand";
import { PopUpProps } from "@/components/popup/types";
import { createSelectors } from "akeyless-client-commons/helpers";

interface PopupsStoreType {
    popups: PopUpProps[];
    maxZIndex: number;
    minimizedPopups: string[];
    addPopup: (props: PopUpProps) => void;
    deletePopup: (id: string) => void;
    deletePopupsGroup: (group: string) => void;
    bringToFront: (id: string) => void;
    minimize: (id: string) => void;
    restore: (id: string) => void;
}

export const PopupsStoreBase = create<PopupsStoreType>((set, get) => ({
    popups: [],
    maxZIndex: 10,
    minimizedPopups: [],
    addPopup: (props) => {
        const newZIndex = get().maxZIndex + 1;
        const popups = get().popups;
        if (props.singleton || popups.some((popup) => popup.id === props.id)) {
            return;
        }
        set((state) => ({
            popups: [
                ...state.popups,
                {
                    ...props,
                    zIndex: newZIndex,
                },
            ],
            maxZIndex: newZIndex,
        }));
    },
    deletePopup: (id) =>
        set((state) => ({
            popups: state.popups.filter((popup) => popup.id !== id),
            minimizedPopups: state.minimizedPopups.filter((popupId) => popupId !== id),
        })),
    deletePopupsGroup: (group) =>
        set((state) => ({
            popups: state.popups.filter((popup) => !popup.id.includes(group)),
            minimizedPopups: state.minimizedPopups.filter((popupId) => !popupId.includes(group)),
        })),
    bringToFront: (id) => {
        const maxZIndex = get().maxZIndex;
        let newZIndex = maxZIndex;
        set((state) => ({
            popups: state.popups.map((popup) => {
                if (popup.id === id && popup.zIndex! < maxZIndex) {
                    newZIndex += 1;
                    return {
                        ...popup,
                        zIndex: newZIndex,
                    };
                }
                return popup;
            }),
            maxZIndex: newZIndex,
        }));
    },
    minimize: (id) => {
        set((state) => {
            const popupIndex = state.popups.findIndex((popup) => popup.id === id);
            if (popupIndex !== -1) {
                if (!state.popups[popupIndex].minimize?.enabled) {
                    return state;
                }
                state.popups[popupIndex].minimize.isMinimized = true;
                return {
                    ...state,
                    minimizedPopups: [...state.minimizedPopups, id],
                };
            }
            return state;
        });
    },
    restore: (id) => {
        set((state) => {
            const popupIndex = state.popups.findIndex((popup) => popup.id === id);
            if (popupIndex !== -1) {
                if (!state.popups[popupIndex].minimize?.enabled) {
                    return state;
                }
                state.popups[popupIndex].minimize.isMinimized = false;
                return {
                    ...state,
                    minimizedPopups: state.minimizedPopups.filter((popupId) => popupId !== id),
                };
            }
            return state;
        });
    },
}));

export const PopupsStore = createSelectors<PopupsStoreType>(PopupsStoreBase);
