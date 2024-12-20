import React, { memo, useCallback, useMemo, useRef, useState, useLayoutEffect, useEffect } from "react";
import { ErrorBoundary } from "akeyless-client-commons/components";
import { useTranslation } from "react-i18next";
import { SettingsStore } from "@/lib/store";
import { PopupsStore } from "@/lib/store";
import { useDragAndDrop, useResize } from "./hooks";
import { PopUpProps } from "./types";
import { MinimizePopup, Wrapper, ResizeHandle } from "./components";
import { cn } from "@/lib/utils";

const Popup = memo((props: PopUpProps & { parentRef: React.RefObject<HTMLDivElement> }) => {
    const {
        id,
        element,
        type,
        headerBackground = "#5f9ea0",
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
        headerIcon,
        headerContent,
        headerTitle,
        parentRef,
        className = " ",
        initialPosition,
    } = props;

    const { t } = useTranslation();
    const direction = SettingsStore.direction();
    const isRtl = SettingsStore.isRtl();
    const deletePopup = PopupsStore.deletePopup();
    const bringToFront = PopupsStore.bringToFront();
    const minimizePopup = PopupsStore.minimize();
    const minimizedPopups = PopupsStore.minimizedPopups();
    const contentRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const [minSize, setMinSize] = useState({ width: 300, height: 150 });

    const { isDragging, startDragging, position, setPosition } = useDragAndDrop({
        initialPosition: initialPosition || { top: "0", left: isRtl ? "auto" : "0px", right: isRtl ? "0px" : "auto" },
        parentRef,
        popupRef,
    });
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
        isRtl,
        parentRef,
        popupRef,
    });

    const exitPopUp = useCallback(async () => {
        try {
            const toStopClosing = await close?.onClose?.();
            if (toStopClosing) {
                return;
            }
            deletePopup(id);
        } catch (error) {
            console.error("error in exitPopUp", error);
        }
    }, [deletePopup, JSON.stringify(close?.onClose), id]);

    const maximizePopupHandler = useCallback(() => {
        setSize({
            height: maximize?.height || 600,
            width: maximize?.width || 900,
        });
    }, [setSize, maximize]);

    const borderColor = useMemo(() => {
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
                close={close}
                zIndex={zIndex}
                minimizedPopups={minimizedPopups}
                exitPopUp={exitPopUp}
                headerIcon={headerIcon}
                headerTitle={headerTitle}
            />
        );
    }

    return (
        <div
            ref={popupRef}
            className={cn(`bg-[#fff] absolute flex flex-col rounded-md ${borderColor && "border-2 " + borderColor}`, className)}
            style={{
                direction,
                zIndex,
                boxShadow: "3px 4px 12.1px 0px rgba(0, 0, 0, 0.12)",
                top: position.top,
                right: position.right,
                left: position.left,
                width: size?.width,
                height: size?.height,
                pointerEvents: "auto",
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
                    title={headerTitle}
                    className={`flex items-center justify-between w-full h-8 text-white ${borderColor ? "rounded-t-sm" : "rounded-t-md"} `}
                    onMouseDown={(e) => move && startDragging(e)}
                    style={{
                        direction: "ltr",
                        cursor: !move ? "default" : isDragging ? "grabbing" : "grab",
                        background: headerBackground,
                    }}
                >
                    <div className="flex items-center justify-start h-full ">
                        {!close?.noClose && (
                            <button
                                style={{ pointerEvents: "auto" }}
                                title={t("close")}
                                onClick={exitPopUp}
                                className="_center w-8 h-full hover:bg-[#d90d0d] rounded-tl-md"
                            >
                                <i className="fa-solid fa-x "></i>
                            </button>
                        )}
                        {maximize?.enabled && (
                            <button title={t("maximize")} onClick={maximizePopupHandler} className="center text-white w-8 h-full hover:bg-gray-500">
                                <i className="fa-light fa-square"></i>
                            </button>
                        )}
                        {minimize?.enabled && (
                            <button
                                title={t("minimize")}
                                onClick={() => minimizePopup(id)}
                                className="center text-white w-8 h-full hover:bg-gray-500"
                            >
                                <i className="fa-solid fa-window-minimize"></i>
                            </button>
                        )}
                    </div>
                    {headerContent && <div className={cn("flex-1 h-full _center")}>{headerContent}</div>}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-fit _center" ref={contentRef}>
                    <Wrapper element={element} exitPopUp={exitPopUp} position={position} />
                </div>

                {/* Resize Handle */}
                {resize && <ResizeHandle isRtl={isRtl} startResizing={startResizing} />}
            </ErrorBoundary>
        </div>
    );
});

Popup.displayName = "Popup";

export default Popup;
