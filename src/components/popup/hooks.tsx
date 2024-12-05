import { Position, useDragAndDropProps, UseResizeProps } from "./types";
import { useCallback, useEffect, useState } from "react";

const disableDocumentHover = ()=>{
    document.body.classList.add('disable-hover', 'select-none')

}
const enableDocumentHover = ()=>{
    document.body.classList.remove('disable-hover', 'select-none')
}

export const useDragAndDrop = ({ initialPosition, parentRef, popupRef }: useDragAndDropProps) => {
    const [position, setPosition] = useState<Position>(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const startDragging = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            if (popupRef.current) {
                const popupRect = popupRef.current.getBoundingClientRect();
                setIsDragging(true);
                setOffset({
                    x: e.clientX - popupRect.left,
                    y: e.clientY - popupRect.top,
                });
                disableDocumentHover()
            }
        },
        [popupRef]
    );

    const stopDragging = () => {
        if (isDragging) {
            setIsDragging(false);
            enableDocumentHover();
        }
    };

    const handleMousemove = useCallback(
        (e: MouseEvent) => {
            if (isDragging && parentRef.current && popupRef.current) {
                const parentRect = parentRef.current.getBoundingClientRect();

                const elementWidth = popupRef.current.offsetWidth;
                const elementHeight = popupRef.current.offsetHeight;

                const newLeft = e.clientX - offset.x - parentRect.left;
                const newTop = e.clientY - offset.y - parentRect.top;

                const boundedLeft = Math.max(0, Math.min(parentRef.current.offsetWidth - elementWidth, newLeft));
                const boundedTop = Math.max(0, Math.min(parentRef.current.offsetHeight - elementHeight, newTop));

                setPosition({
                    left: `${boundedLeft}px`,
                    top: `${boundedTop}px`,
                    right: "auto",
                });
            }
        },
        [isDragging, offset, parentRef, popupRef]
    );

    useEffect(() => {
        const handleMouseUp = () => stopDragging();
        window.addEventListener("mousemove", handleMousemove, { passive: true });
        window.addEventListener("mouseup", handleMouseUp, { passive: true });
        return () => {
            window.removeEventListener("mousemove", handleMousemove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleMousemove]);

    return {
        position,
        startDragging,
        stopDragging,
        setPosition,
        isDragging,
    };
};

export const useResize = ({
    resize,
    minWidth,
    minHeight,
    position,
    setPosition,
    isRtl,
    parentRef,
    popupRef,
}: UseResizeProps & {
    parentRef: React.RefObject<HTMLDivElement>;
    popupRef: React.RefObject<HTMLDivElement>;
}) => {
    const [size, setSize] = useState({ width: minWidth, height: minHeight });
    const [isResizing, setIsResizing] = useState(false);
    const [startMouse, setStartMouse] = useState<{ x: number; y: number } | null>(null);
    const [startSize, setStartSize] = useState<{ width: number; height: number } | null>(null);
    const [startPosition, setStartPosition] = useState<Position | null>(null);

    const startResizing = (e: React.MouseEvent) => {
        setStartMouse({ x: e.clientX, y: e.clientY });
        setStartSize({ ...size });
        setStartPosition({ ...position });
        setIsResizing(true);
        disableDocumentHover()
    };

    useEffect(() => {
        setSize({ width: minWidth, height: minHeight });
    }, [minWidth, minHeight]);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !startMouse || !startSize || !startPosition || !parentRef.current || !popupRef.current) {
                return;
            }

            const parentRect = parentRef.current.getBoundingClientRect();
            const popupRect = popupRef.current.getBoundingClientRect();

            let deltaX = e.clientX - startMouse.x;
            let deltaY = e.clientY - startMouse.y;

            let newWidth = startSize.width;
            let newHeight = startSize.height;
            let newLeft = parseFloat(startPosition.left || "0");
            let newRight = parseFloat(startPosition.right || "0");
            if (isRtl) {
                newWidth = startSize.width - deltaX;
                if (newWidth < minWidth) {
                    newWidth = minWidth;
                    deltaX = startSize.width - minWidth;
                }

                const deltaWidth = newWidth - startSize.width;
                newLeft = parseFloat(startPosition.left || "0") - deltaWidth;

                if (newLeft < 0) {
                    newLeft = 0;
                    newWidth = startSize.width + (parseFloat(startPosition.left || "0") - newLeft);
                }

                const maxWidth = parentRect.width - newLeft;
                if (newWidth > maxWidth) {
                    newWidth = maxWidth;
                }
            } else {
                newWidth = startSize.width + deltaX;

                if (newWidth < minWidth) {
                    newWidth = minWidth;
                    deltaX = minWidth - startSize.width;
                }

                const deltaWidth = newWidth - startSize.width;
                newRight = parseFloat(startPosition.right || "0") - deltaWidth;
                if (newRight < 0) {
                    newRight = 0;
                    newWidth = parentRect.width - parseFloat(startPosition.right || "0");
                }

                const maxWidth = parentRect.width - newRight;

                if (newWidth > maxWidth) {
                    newWidth = maxWidth;
                    newRight = parentRect.width - newWidth;
                }
            }

            newHeight = startSize.height + deltaY;

            if (newHeight < minHeight) {
                newHeight = minHeight;
                deltaY = minHeight - startSize.height;
            }

            const maxHeight = parentRect.height - (popupRect.top - parentRect.top);
            if (newHeight > maxHeight) {
                newHeight = maxHeight;
            }

            setSize({
                width: newWidth,
                height: newHeight,
            });

            setPosition((prevPosition: Position) => {
                const updatedPosition = { ...prevPosition };
                if (isRtl) {
                    updatedPosition.left = `${newLeft}px`;
                } else {
                    updatedPosition.right = `${newRight}px`;
                }
                return updatedPosition;
            });
        },
        [isResizing, startMouse, startSize, startPosition, parentRef, popupRef, isRtl, minWidth, minHeight, setPosition]
    );

    const stopResizing = () => {
        setIsResizing(false);
        setStartMouse(null);
        setStartSize(null);
        setStartPosition(null);
        enableDocumentHover();
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove, { passive: true });
            window.addEventListener("mouseup", stopResizing, { passive: true });
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopResizing);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, handleMouseMove]);

    return {
        size,
        setSize,
        startResizing,
    };
};
