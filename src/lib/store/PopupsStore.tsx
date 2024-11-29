import { create } from "zustand";
import { PopUpProps } from "@/components/popup";
import { createSelectors } from "akeyless-client-commons/helpers";

interface PopupsStoreType {
    popups: PopUpProps[];
    addPopup: (props: PopUpProps) => void;
    deletePopup: (id: string) => void;
    bringToFront: (id: string) => void;
    minimize: (id: string) => void;
    maxZIndex: number;
}

export const PopupsStoreBase = create<PopupsStoreType>((set, get) => ({
    popups: [],
    maxZIndex: 10,
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
    minimize: (id) => {},
}));

export const PopupsStore = createSelectors<PopupsStoreType>(PopupsStoreBase);
