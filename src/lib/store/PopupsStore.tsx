import { create } from "zustand";
import { PopUpProps } from "@/components/popup/types";
import { createSelectors } from "akeyless-client-commons/helpers";

interface PopupsStoreType {
    popups: PopUpProps[];
    maxZIndex: number;
    minimizedPopups: string[];
    addPopup: (props: PopUpProps) => void;
    deletePopup: (id: string) => void;
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
    bringToFront: (id) => {
        const newZIndex = get().maxZIndex + 1;
        set((state) => ({
            popups: state.popups.map((popup) =>
                popup.id === id
                    ? {
                          ...popup,
                          zIndex: newZIndex,
                      }
                    : popup
            ),
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
