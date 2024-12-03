
import React, { memo, useCallback, useMemo, useRef, useState, useLayoutEffect } from "react";
import { ErrorBoundary } from "akeyless-client-commons/components";
import { useTranslation } from "react-i18next";
import { SettingsStore } from "@/lib/store";
import { PopupsStore } from "@/lib/store";
import { useDragAndDrop, useResize } from "./hooks";
import { PopUpProps } from "./types";
import { MinimizePopup, Wrapper, ResizeHandle } from "./comps";

const Popup = memo((props: PopUpProps) => {
    const {
        id,
        element,
        type,
        right = "465px",
        left = "auto",
        top = "100px",
        bottom,
        headerBackground = "linear-gradient(180deg, #7D7D7D 0%, #495359 73.44%, #364046 100%)",
        zIndex = 10,
        errorMsg,
        move = true,
        close = {
            noClose: false,
        },
        resize = false,
        maximize = {
            enabled: false,
        },
        minimize = {
            enabled: false,
        },
    } = props;

    const { t } = useTranslation();
    const direction = SettingsStore.direction();
    const isLtr = SettingsStore.isLtr();
    const deletePopup = PopupsStore.deletePopup();
    const bringToFront = PopupsStore.bringToFront();
    const minimizePopup = PopupsStore.minimize();
    const minimizedPopups = PopupsStore.minimizedPopups();

    const { isDragging, startDragging, position, setPosition } = useDragAndDrop({
        initialPosition: { top, left, right, bottom },
    });

    const [minSize, setMinSize] = useState({ width: 300, height: 150 });
    const contentRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (contentRef.current) {
            const contentWidth = contentRef.current.offsetWidth;
            const contentHeight = contentRef.current.offsetHeight;

            if (contentWidth > minSize.width || contentHeight > minSize.height) {
                setMinSize({
                    width: contentWidth + 5,
                    height: contentHeight + 45,
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { size, setSize, startResizing } = useResize({
        resize,
        minWidth: minSize.width,
        minHeight: minSize.height,
        setPosition,
        position,
        isLtr,
    });

    const exitPopUp = useCallback(async () => {
        const toStopClosing = await close?.onClose?.();
        if (toStopClosing) {
            return;
        }
        deletePopup(id);
    }, [deletePopup, close, id]);

    const maximizePopupHandler = useCallback(() => {
        setSize({
            height: maximize?.height || 600,
            width: maximize?.width || 900,
        });
    }, [setSize, maximize]);

    const border = useMemo(() => {
        switch (type) {
            case "info":
                return "border-blue-500";
            case "warning":
                return "border-yellow-500";
            case "error":
                return "border-red-500";
            default:
                return "";
        }
    }, [type]);

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
            className={`bg-[#fff] fixed flex flex-col rounded-md ${border && "border-2 " + border}`}
            style={{
                direction,
                zIndex,
                boxShadow: "3px 4px 12.1px 0px rgba(0, 0, 0, 0.12)",
                top: position.top,
                right: position.right,
                left: position.left,
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
                    className={`flex items-center justify-start w-full h-8 ${border ? "rounded-t-sm" : "rounded-t-md"} `}
                    onMouseDown={(e) => move && startDragging(e)}
                    style={{
                        direction: "ltr",
                        cursor: !move ? "default" : isDragging ? "grabbing" : "grab",
                        background: headerBackground,
                    }}
                >
                    {!close?.noClose && (
                        <button title={t("close")} onClick={exitPopUp} className="center text-white w-8 h-full hover:bg-[#d90d0d] rounded-tl-md">
                            <i className="fa-solid fa-x"></i>
                        </button>
                    )}
                    {maximize?.enabled && (
                        <button title={t("maximize")} onClick={maximizePopupHandler} className="center text-white w-8 h-full hover:bg-gray-500">
                            <i className="fa-light fa-square"></i>
                        </button>
                    )}
                    {minimize?.enabled && (
                        <button title={t("minimize")} onClick={() => minimizePopup(id)} className="center text-white w-8 h-full hover:bg-gray-500">
                            <i className="fa-solid fa-window-minimize"></i>
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-fit _center" ref={contentRef}>
                    <Wrapper element={element} exitPopUp={exitPopUp} position={position} />
                </div>

                {/* Resize Handle */}
                {resize && <ResizeHandle isLtr={isLtr} startResizing={startResizing} />}
            </ErrorBoundary>
        </div>
    );
});

Popup.displayName = "Popup";

export default Popup;
