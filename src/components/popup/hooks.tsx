import { Position, useDragAndDropProps, UseResizeProps } from "./types";
import { useCallback, useEffect, useState } from "react";

export const useDragAndDrop = ({ initialPosition }: useDragAndDropProps) => {
    const [position, setPosition] = useState<Position>(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const startDragging = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            setIsDragging(true);
            setOffset({
                x: e.clientX - e.currentTarget.getBoundingClientRect().left,
                y: e.clientY - e.currentTarget.getBoundingClientRect().top,
            });
        },
        [setIsDragging, setOffset]
    );
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

// export const useResize = ({ resize, initialWidth, initialHeight, minWidth, minHeight, position, setPosition, isLtr }: UseResizeProps) => {
//     const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
//     const [isResizing, setIsResizing] = useState(false);
//     const [startMouse, setStartMouse] = useState<{ x: number; y: number } | null>(null);

//     useEffect(() => {
//         if (isResizing) {
//             window.addEventListener("mousemove", handleMouseMove);
//             window.addEventListener("mouseup", stopResizing);
//         } else {
//             window.removeEventListener("mousemove", handleMouseMove);
//             window.removeEventListener("mouseup", stopResizing);
//         }

//         return () => {
//             window.removeEventListener("mousemove", handleMouseMove);
//             window.removeEventListener("mouseup", stopResizing);
//         };
//     }, [isResizing, startMouse]);

//     useEffect(() => {
//         if (!resize) {
//             return;
//         }
//         const calculatedLeft = window.innerWidth - parseFloat(position.right!) - initialWidth;
//         setPosition({
//             left: `${calculatedLeft}px`,
//             top: position.top,
//             right: "auto",
//         });
//     }, []);

//     const parsePositionValue = (value: string | undefined): number | undefined => {
//         if (!value || value === "auto") {
//             return undefined;
//         }
//         const parsed = parseFloat(value);
//         return isNaN(parsed) ? undefined : parsed;
//     };

//     const startResizing = (e: React.MouseEvent) => {
//         setStartMouse({ x: e.clientX, y: e.clientY });
//         setIsResizing(true);
//     };

//     const handleMouseMove = (e: MouseEvent) => {
//         if (!isResizing || !startMouse) return;

//         let deltaX = e.clientX - startMouse.x;
//         const deltaY = e.clientY - startMouse.y;

//         setSize((prevSize) => {
//             let newWidth = prevSize.width + (isLtr ? -deltaX : deltaX);
//             const newHeight = Math.max(minHeight, prevSize.height + deltaY);

//             if (newWidth < minWidth) {
//                 deltaX = isLtr ? prevSize.width - minWidth : minWidth - prevSize.width;
//                 newWidth = minWidth;
//             }

//             setPosition((prevPosition) => {
//                 const updatedPosition = { ...prevPosition };

//                 if (isLtr) {
//                     const leftValue = parsePositionValue(prevPosition.left);
//                     if (leftValue !== undefined) {
//                         updatedPosition.left = `${leftValue + deltaX}px`;
//                     }
//                 } else {
//                     const rightValue = parsePositionValue(prevPosition.right);
//                     if (rightValue !== undefined) {
//                         updatedPosition.right = `${rightValue - deltaX}px`;
//                     }
//                 }
//                 return updatedPosition;
//             });

//             return {
//                 width: newWidth,
//                 height: newHeight,
//             };
//         });

//         setStartMouse({ x: e.clientX, y: e.clientY });
//     };

//     const stopResizing = () => {
//         setIsResizing(false);
//         setStartMouse(null);
//     };

//     return {
//         size,
//         setSize,
//         startResizing,
//     };
// };



export const useResize = ({
    resize,

    minWidth,
    minHeight,
    position,
    setPosition,
    isLtr,
}: UseResizeProps) => {
    const [size, setSize] = useState({ width: minWidth, height: minHeight });
    const [isResizing, setIsResizing] = useState(false);
    const [startMouse, setStartMouse] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        setSize({ width: minWidth, height: minHeight });
    }, [minWidth, minHeight]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isResizing, startMouse]);

    useEffect(() => {
        if (!resize) {
            return;
        }
        const calculatedLeft = window.innerWidth - parseFloat(position.right!) - minWidth;
        setPosition({
            left: `${calculatedLeft}px`,
            top: position.top,
            right: "auto",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const parsePositionValue = (value: string | undefined): number | undefined => {
        if (!value || value === "auto") {
            return undefined;
        }
        const parsed = parseFloat(value);
        return isNaN(parsed) ? undefined : parsed;
    };

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault();
        setStartMouse({ x: e.clientX, y: e.clientY });
        setIsResizing(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing || !startMouse) return;

        let deltaX = e.clientX - startMouse.x;
        const deltaY = e.clientY - startMouse.y;

        setSize((prevSize) => {
            let newWidth = prevSize.width + (isLtr ? -deltaX : deltaX);
            let newHeight = prevSize.height + deltaY;

            if (newWidth < minWidth) {
                deltaX = isLtr ? prevSize.width - minWidth : minWidth - prevSize.width;
                newWidth = minWidth;
            }

            if (newHeight < minHeight) {
                newHeight = minHeight;
            }

            setPosition((prevPosition: Position) => {
                const updatedPosition = { ...prevPosition };

                if (isLtr) {
                    const leftValue = parsePositionValue(prevPosition.left);
                    if (leftValue !== undefined) {
                        updatedPosition.left = `${leftValue + deltaX}px`;
                    }
                } else {
                    const rightValue = parsePositionValue(prevPosition.right);
                    if (rightValue !== undefined) {
                        updatedPosition.right = `${rightValue - deltaX}px`;
                    }
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
        setSize,
        startResizing,
    };
};
