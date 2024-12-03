import React, { cloneElement, isValidElement, memo, useCallback, useEffect } from "react";
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

// utility function to compare props
const areEqual = (prevProps: TObject<any>, nextProps: TObject<any>) => {
    const { position: prevPosition, ...prevOtherProps } = prevProps;
    const { position: nextPosition, ...nextOtherProps } = nextProps;
    return isEqual(prevOtherProps, nextOtherProps);
};

// memoize the component
const Wrapper = memo<PopupWrapperProps>(PopupWrapper, areEqual);
Wrapper.displayName = "PopupWrapper ";

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
                    <button title={t("restore")} onClick={() => restorePopup(id)} className="center text-white w-8 h-full hover:bg-gray-500">
                        <i className="fa-light fa-square"></i>
                    </button>
                </div>
                {minimize?.icon && (
                    <div title={minimize?.iconTitle} className="px-1 _center">
                        {minimize.icon}
                    </div>
                )}
            </div>
        </div>
    );
};

const ResizeHandle = memo(({ startResizing, isLtr }: ResizeHandleProps) => {
    return (
        <div
            onMouseDown={startResizing}
            className={`absolute bottom-1 ${
                isLtr ? "left-0 rotate-45 cursor-sw-resize" : "right-0 -rotate-45 cursor-nw-resize"
            } flex flex-col items-center justify-center gap-0.5`}
        >
            <div className="w-2.5 h-[1px] bg-black"></div>
            <div className="w-1.5 h-[1px] bg-black "></div>
        </div>
    );
});
ResizeHandle.displayName = "resizeHandle";

const PopupManager = () => {
    const popups = PopupsStore.popups();
    const addPopup = PopupsStore.addPopup();
    useEffect(() => {
        addPopup({
            id: `test1`,

            type: "info",
            element: <Test text={"maximize and maximize"} />,
            maximize: { enabled: true },
            minimize: { enabled: true, iconTitle: "test3", icon: <i className="fa-regular fa-user mx-1 "></i> },
            resize: true,
        });
        // addPopup({
        //     id: `test2`,
        //     type: "warning",
        //     element: <Test text={"maximize and maximize"} />,
        //     maximize: { enabled: true },
        //     minimize: { enabled: true, iconTitle: "test3", icon: <i className="fa-regular fa-user mx-1 "></i> },
        //     resize: true,
        // });
        // addPopup({
        //     id: `test3`,
        //     type: "error",
        //     element: <Test text={"maximize and maximize"} />,
        //     maximize: { enabled: true },
        //     minimize: { enabled: true, iconTitle: "test3", icon: <i className="fa-regular fa-user mx-1 "></i> },
        //     resize: true,
        // });
        // addPopup({
        //     id: `test4`,
        //     type: "custom",
        //     element: <Test text={"maximize and maximize"} />,
        //     maximize: { enabled: true },
        //     minimize: { enabled: true, iconTitle: "test3", icon: <i className="fa-regular fa-user mx-1 "></i> },
        //     resize: true,
        // });
    }, []);

    return (
        <>
            {popups.map((popupProps) => {
                return <Popup key={popupProps.id} {...popupProps} />;
            })}
        </>
    );
};

const Test = ({ text }: { text: string }) => {
    console.log("rendering test", text);
    return <div className="min-w-[500px] min-h-[500px] w-full h-full ">{text} </div>;
};

export { Wrapper, MinimizePopup, PopupManager, ResizeHandle };
