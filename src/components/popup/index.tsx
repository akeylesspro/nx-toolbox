import React, { memo, useCallback, useMemo } from "react";
import Warper from "./Warper";
import { ErrorBoundary } from "akeyless-client-commons/components";
import { useTranslation } from "react-i18next";
import { SettingsStore } from "@/lib/store";
import { PopupsStore } from "@/lib/store";
import { useDraggable, useResizable } from "./hooks";

export interface PopUpProps {
    id: string;
    element: JSX.Element;
    close?: {
        noClose?: boolean;
        onClose?: () => void | Promise<void>;
    };
    top?: string;
    left?: string;
    bottom?: string;
    right?: string;
    headerBackground?: string;
    zIndex?: number;
    dragAndDrop?: boolean;
    resize?: boolean;
    singleton?: boolean;
    minimize?: boolean;
    maximize?: boolean;
}

const Popup = memo(
    ({
        id,
        element,
        right = "465px",
        left = "auto",
        top = "105px",
        bottom,
        headerBackground = "linear-gradient(180deg, #7D7D7D 0%, #495359 73.44%, #364046 100%)",
        zIndex = 10,
        dragAndDrop = true,
        close,
        resize = true,
        singleton = true,
        maximize,
        minimize,
    }: PopUpProps) => {
        const { t } = useTranslation();
        const direction = SettingsStore.direction();
        const deletePopup = PopupsStore.deletePopup();
        const bringToFront = PopupsStore.bringToFront();

        const { isDragging, startDragging, position, setPosition } = useDraggable({
            initialPosition: { top, left, right, bottom },
        });

        const { size, startResizing } = useResizable({
            resize,
            initialWidth: 300,
            initialHeight: 150,
            minWidth: 300,
            minHeight: 150,
            setPosition,
            position,
        });

        const exitPopUp = useCallback(() => {
            deletePopup(id);
            close?.onClose?.();
        }, [deletePopup, close]);

        return (
            <div
                className={`min-h-[150px] min-w-[300px] bg-[#fff] fixed flex flex-col`}
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
                {/* Header */}
                <div
                    className={`flex items-center justify-start w-full h-8`}
                    onMouseDown={(e) => dragAndDrop && startDragging(e)}
                    style={{
                        direction: "ltr",
                        cursor: isDragging ? "grabbing" : "grab",
                        background: headerBackground,
                    }}
                >
                    {!close?.noClose && (
                        <button onClick={exitPopUp} className="center text-white w-8 h-full hover:bg-[#d90d0d]">
                            <i className="fa-solid fa-x"></i>
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 flex justify-center items-center">
                    <ErrorBoundary
                        fallback={
                            <div className="full center">
                                <h1>{t("pop up 2 error ...")}</h1>
                            </div>
                        }
                    >
                        <Warper element={element} exitPopUp={exitPopUp} position={position} />
                    </ErrorBoundary>
                </div>

                {/* Resize Handle */}
                {resize && (
                    <div
                        onMouseDown={startResizing}
                        style={{
                            width: "6px",
                            height: "6px",
                            background: "rgba(0,0,0,0.2)",
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            cursor: "sw-resize",
                        }}
                    />
                )}
            </div>
        );
    }
);
Popup.displayName = "Popup";

export default Popup;
