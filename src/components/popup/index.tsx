import React, { memo, useCallback } from "react";
import { MinimizePopup, Warper } from "./Comps";
import { ErrorBoundary } from "akeyless-client-commons/components";
import { useTranslation } from "react-i18next";
import { SettingsStore } from "@/lib/store";
import { PopupsStore } from "@/lib/store";
import { useDragAndDrop, useResize } from "./hooks";
import { PopUpProps } from "./types";

const Popup = memo(
    ({
        id,
        element,
        type,
        right = "465px",
        left = "auto",
        top = "105px",
        bottom,
        headerBackground = "linear-gradient(180deg, #7D7D7D 0%, #495359 73.44%, #364046 100%)",
        zIndex = 10,
        dragAndDrop = true,
        close,
        resize,
        errorMsg,
        maximize,
        minimize,
    }: PopUpProps) => {
        const { t } = useTranslation();
        const direction = SettingsStore.direction();
        const deletePopup = PopupsStore.deletePopup();
        const bringToFront = PopupsStore.bringToFront();
        const minimizePopup = PopupsStore.minimize();
        const minimizedPopups = PopupsStore.minimizedPopups();

        const { isDragging, startDragging, position, setPosition } = useDragAndDrop({
            initialPosition: { top, left, right, bottom },
        });

        const { size, setSize, startResizing } = useResize({
            resize,
            initialWidth: 300,
            minWidth: 300,
            initialHeight: 150,
            minHeight: 150,
            setPosition,
            position,
        });

        const exitPopUp = useCallback(() => {
            deletePopup(id);
            close?.onClose?.();
        }, [deletePopup, close]);

        const maximizePopup = useCallback(() => {
            setSize({ height: maximize?.height || 600, width: maximize?.width || 900 });
        }, [setSize]);

        if (minimize?.isMinimized) {
            return (
                <MinimizePopup
                    id={id}
                    type={type}
                    close={close}
                    minimize={minimize}
                    zIndex={zIndex}
                    minimizedPopups={minimizedPopups}
                    exitPopUp={exitPopUp}
                />
            );
        }

        return (
            <div
                className={`min-h-[150px] min-w-[300px] bg-[#fff] fixed flex flex-col rounded-md`}
                style={{
                    boxShadow: "3px 4px 12.1px 0px rgba(0, 0, 0, 0.12)",
                    top: position.top,
                    right: position.right,
                    left: position.left,
                    direction,
                    zIndex,
                    width: size?.width,
                    height: size?.height,
                }}
                onMouseDown={() => bringToFront(id)}
            >
                <ErrorBoundary
                    fallback={
                        <div className="full center">
                            <h1>{errorMsg || t("popup_error").replace("{id}", id)}</h1>
                        </div>
                    }
                >
                    {/* Header */}
                    <div
                        className={`flex items-center justify-start w-full h-8 rounded-t-md`}
                        onMouseDown={(e) => dragAndDrop && startDragging(e)}
                        style={{
                            direction: "ltr",
                            cursor: !dragAndDrop ? "default" : isDragging ? "grabbing" : "grab",
                            background: headerBackground,
                        }}
                    >
                        {!close?.noClose && (
                            <button title={t("close")} onClick={exitPopUp} className="center text-white w-8 h-full hover:bg-[#d90d0d] rounded-tl-md">
                                <i className="fa-solid fa-x"></i>
                            </button>
                        )}
                        {maximize?.enable && (
                            <button title={t("maximize")} onClick={() => maximizePopup()} className="center text-white w-8 h-full hover:bg-gray-500">
                                <i className="fa-light fa-square"></i>
                            </button>
                        )}
                        {minimize?.enable && (
                            <button
                                title={t("minimize")}
                                onClick={() => minimizePopup(id)}
                                className="center text-white w-8 h-full hover:bg-gray-500"
                            >
                                <i className="fa-solid fa-window-minimize"></i>
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex justify-center items-center">
                        <Warper element={element} exitPopUp={exitPopUp} position={position} />
                    </div>

                    {/* Resize Handle */}
                    {resize && (
                        <div
                            title={t("resize")}
                            onMouseDown={startResizing}
                            style={{
                                width: "6px",
                                height: "6px",
                                background: "rgba(0,0,0,0.2)",
                                position: "absolute",
                                bottom:"-2px",
                                left: "-2px",
                                cursor: "sw-resize",
                            }}
                        />
                    )}
                </ErrorBoundary>
            </div>
        );
    }
);
Popup.displayName = "Popup";

export default Popup;
