"use client";
import React, { cloneElement, isValidElement, memo, useCallback, useEffect, useRef } from "react";
import { isEqual } from "lodash";
import { TObject } from "akeyless-types-commons";
import { MinimizePopupProps, PopupWrapperProps, Position, ResizeHandleProps } from "./types";
import { PopupsStore } from "@/lib/store";
import { useTranslation } from "react-i18next";
import Popup from "./Popup";

// core component to wrap the popup element
const PopupWrapper = ({ element, position, exitPopUp }: PopupWrapperProps) => {
    if (isValidElement<{ position: Position; exitPopUp: () => void }>(element) && typeof element.type !== "string") {
        return cloneElement(element, { position, exitPopUp });
    }
    return element;
};

// utility function to compare Wrapper props
const areEqual = (prevProps: TObject<any>, nextProps: TObject<any>) => {
    const { position: prevPosition, element: prevElement, exitPopUp: prevExitPopUp } = prevProps;
    const { position: nextPosition, element: nextElement, exitPopUp: nextExitPopUp } = nextProps;
    return isEqual(prevElement, nextElement) && isEqual(prevExitPopUp, nextExitPopUp);
};

// wrapper component
const Wrapper = memo<PopupWrapperProps>(PopupWrapper, areEqual);
Wrapper.displayName = "PopupWrapper ";

// minimize popup component
const MinimizePopup = ({ id, close, zIndex, headerIcon, headerTitle, minimizedPopups, exitPopUp }: MinimizePopupProps) => {
    const { t } = useTranslation();
    const restorePopup = PopupsStore.restore();

    const getMinimizedPosition = useCallback((): string => {
        const index = minimizedPopups.findIndex((popupId) => popupId === id);
        const popupWidth = 155;
        const leftPosition = index * popupWidth + 5;
        return `${leftPosition}px`;
    }, [minimizedPopups]);
    return (
        <div
            className="absolute bottom-0"
            style={{
                left: getMinimizedPosition(),
                width: "150px",
                height: "30px",
                zIndex,
                pointerEvents: "auto",
            }}
        >
            <div title={headerTitle} className="bg-gray-500 text-white h-full flex items-center justify-between  hover:bg-gray-700  rounded-t-md">
                <div className="h-full flex justify-start items-center">
                    {!close?.noClose && (
                        <button title={t("close")} onClick={exitPopUp} className="center text-white w-8 h-full hover:bg-[#d90d0d]  rounded-tl-md">
                            <i className="fa-solid fa-x"></i>
                        </button>
                    )}
                    <button title={t("restore")} onClick={() => restorePopup(id)} className="center text-white w-8 h-full hover:bg-gray-500">
                        <i className="fa-light fa-square"></i>
                    </button>
                </div>
                {headerIcon && <div className="px-1 _center">{headerIcon}</div>}
            </div>
        </div>
    );
};

// resize handle component
const ResizeHandle = memo(({ startResizing, isRtl }: ResizeHandleProps) => {
    return (
        <div
            onMouseDown={startResizing}
            className={`absolute bottom-1 ${
                isRtl ? "left-0 rotate-45 cursor-sw-resize" : "right-0 -rotate-45 cursor-nw-resize"
            } flex flex-col items-center justify-center gap-0.5`}
        >
            <div className="w-2.5 h-[1px] bg-black"></div>
            <div className="w-1.5 h-[1px] bg-black "></div>
        </div>
    );
});
ResizeHandle.displayName = "resizeHandle";

// popup manager component
const PopupManager = () => {
    const popups = PopupsStore.popups();
    const addPopup = PopupsStore.addPopup();
    const managerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        addPopup({
            id: `test1`,
            type: "info",
            element: <Test text={"maximize and minimize"} />,
            maximize: { enabled: true },
            minimize: { enabled: true },
            resize: true,
            headerIcon: <i className="fa-regular fa-user mx-1 "></i>,
            headerTitle: "test1",
        });
        addPopup({
            id: `test2`,
            type: "info",
            element: <Test text={"maximize and minimize"} />,
            maximize: { enabled: true },
            minimize: { enabled: true },
            resize: true,
            headerIcon: <i className="fa-regular fa-user mx-1 "></i>,
            headerTitle: "test1",
        });
        addPopup({
            id: `test3`,
            type: "info",
            element: <Test text={"maximize and minimize"} />,
            maximize: { enabled: true },
            minimize: { enabled: true },
            resize: true,
            headerIcon: <i className="fa-regular fa-user mx-1 "></i>,
            headerTitle: "test1",
        });
    }, [addPopup]);

    return (
        <div ref={managerRef} className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: "none" }}>
            {popups.map((popupProps) => {
                return <Popup key={popupProps.id} {...popupProps} parentRef={managerRef} />;
            })}
        </div>
    );
};

const Test = ({ text }: { text: string }) => {
    return <div className="min-w-[500px] min-h-[500px] w-full h-full ">{text}</div>;
};

export { Wrapper, MinimizePopup, PopupManager, ResizeHandle };
