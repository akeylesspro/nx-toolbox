import { Position } from "@/types";
import { useEffect, useState } from "react";

interface useDraggableProps {
    initialPosition: Position;
}

export const useDraggable = ({ initialPosition }: useDraggableProps) => {
    const [position, setPosition] = useState<Position>(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const startDragging = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setOffset({
            x: e.clientX - e.currentTarget.getBoundingClientRect().left,
            y: e.clientY - e.currentTarget.getBoundingClientRect().top,
        });
    };

    const stopDragging = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    };

    const handleMousemove = (e: MouseEvent) => {
        if (isDragging) {
            const newLeft = e.clientX - offset.x;
            const newTop = e.clientY - offset.y;

            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            const elementWidth = offset.x;
            const elementHeight = offset.y;

            const boundedLeft = Math.max(0, Math.min(screenWidth - elementWidth, newLeft));
            const boundedTop = Math.max(0, Math.min(screenHeight - elementHeight, newTop));

            setPosition({
                left: `${boundedLeft}px`,
                top: `${boundedTop}px`,
                right: "auto",
            });
        }
    };

    useEffect(() => {
        const handleMouseUp = () => stopDragging();
        window.addEventListener("mousemove", handleMousemove, { passive: true });
        window.addEventListener("mouseup", handleMouseUp, { passive: true });
        return () => {
            window.removeEventListener("mousemove", handleMousemove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, offset]);

    return {
        position,
        startDragging,
        stopDragging,
        setPosition,
        isDragging,
    };
};

interface UseResizableProps {
    resize: boolean;
    initialWidth: number;
    initialHeight: number;
    minWidth: number;
    minHeight: number;
    setPosition: React.Dispatch<React.SetStateAction<Position>>;
    position: Position;
}

export const useResizable = ({ resize, initialWidth, initialHeight, minWidth, minHeight, position, setPosition }: UseResizableProps) => {
    // if (!resize) {
    //     return {};
    // }
    const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
    const [isResizing, setIsResizing] = useState(false);
    const [startMouse, setStartMouse] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", stopResizing);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, startMouse]);

    useEffect(() => {
        const calculatedLeft = window.innerWidth - parseFloat(position.right!) - initialWidth;
        setPosition({
            left: `${calculatedLeft}px`,
            top: position.top,
            right: "auto",
        });
    }, []);

    const parsePositionValue = (value: string | undefined): number | undefined => {
        if (!value || value === "auto") {
            return undefined;
        }
        const parsed = parseFloat(value);
        return isNaN(parsed) ? undefined : parsed;
    };

    const startResizing = (e: React.MouseEvent) => {
        setStartMouse({ x: e.clientX, y: e.clientY });
        setIsResizing(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing || !startMouse) return;

        let deltaX = e.clientX - startMouse.x;
        const deltaY = e.clientY - startMouse.y;

        setSize((prevSize) => {
            let newWidth = prevSize.width - deltaX;
            const newHeight = Math.max(minHeight, prevSize.height + deltaY);

            if (newWidth < minWidth) {
                deltaX = prevSize.width - minWidth;
                newWidth = minWidth;
            }

            setPosition((prevPosition) => {
                const updatedPosition = { ...prevPosition };

                const leftValue = parsePositionValue(prevPosition.left);

                const rightValue = parsePositionValue(prevPosition.right);

                if (leftValue !== undefined) {
                    // אם 'left' מוגדר
                    const newLeft = leftValue + deltaX;
                    updatedPosition.left = `${newLeft}px`;
                } else if (rightValue !== undefined) {
                    // אם 'right' מוגדר
                    const newRight = rightValue - deltaX;
                    updatedPosition.right = `${newRight}px`;
                } else {
                    // אם אף אחד מהם לא מוגדר, נניח ש-left הוא 0
                    const newLeft = deltaX;
                    updatedPosition.left = `${newLeft}px`;
                    updatedPosition.right = "auto";
                }

                return updatedPosition;
            });

            return {
                width: newWidth,
                height: newHeight,
            };
        });

        setStartMouse({ x: e.clientX, y: e.clientY });
    };

    const stopResizing = () => {
        setIsResizing(false);
        setStartMouse(null);
    };

    return {
        size,
        startResizing,
    };
};
