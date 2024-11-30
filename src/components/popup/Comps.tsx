import React, { cloneElement, isValidElement, memo, useCallback } from "react";
import { isEqual } from "lodash";
import { TObject } from "akeyless-types-commons";
import { MinimizePopupProps, PopupWrapperProps, Position } from "./types";
import { PopupsStore } from "@/lib/store";
import { useTranslation } from "react-i18next";

// core component to wrap the popup element
const PopupWrapper = ({ element, position, exitPopUp }: PopupWrapperProps) => {
    if (isValidElement<{ position: Position; exitPopUp: () => void }>(element) && typeof element.type !== "string") {
        return cloneElement(element, { position, exitPopUp });
    }
    return element;
};

// utility function to compare props
const areEqual = (prevProps: TObject<any>, nextProps: TObject<any>) => {
    const { position: prevPosition, ...prevOtherProps } = prevProps;
    const { position: nextPosition, ...nextOtherProps } = nextProps;
    return isEqual(prevOtherProps, nextOtherProps);
};

// memoize the component
const Warper = memo<PopupWrapperProps>(PopupWrapper, areEqual);
Warper.displayName = "PopupWarper";

const MinimizePopup = ({ id, type, close, zIndex, minimize, minimizedPopups, exitPopUp }: MinimizePopupProps) => {
    const { t } = useTranslation();
    const restorePopup = PopupsStore.restore();
    const getMinimizedPosition = useCallback((): string => {
        const index = minimizedPopups.findIndex((popupId) => popupId === id);
        const popupWidth = 135;
        const leftPosition = index * popupWidth + 10;
        return `${leftPosition}px`;
    }, [minimizedPopups]);
    return (
        <div
            className="fixed bottom-0"
            style={{
                left: getMinimizedPosition(),
                width: "130px",
                height: "30px",
                zIndex,
            }}
        >
            <div className="bg-gray-500 text-white h-full flex items-center justify-between  hover:bg-gray-700  rounded-t-md">
                <div className="h-full flex justify-start items-center">
                    {!close?.noClose && (
                        <button title={t("close")} onClick={exitPopUp} className="center text-white w-8 h-full hover:bg-[#d90d0d]  rounded-tl-md">
                            <i className="fa-solid fa-x"></i>
                        </button>
                    )}
                    <button title={t("restore")}  onClick={() => restorePopup(id)} className="center text-white w-8 h-full hover:bg-gray-500">
                        <i className="fa-light fa-square"></i>
                    </button>
                </div>
                <div title={minimize?.iconTitle} className="px-1 _center">
                    {minimize?.icon || type}
                </div>
            </div>
        </div>
    );
};

export { Warper, MinimizePopup };
