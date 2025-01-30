export interface PopUpProps {
    id: string;
    element: JSX.Element;
    type: "info" | "error" | "warning" | "custom";
    close?: {
        noClose?: boolean;
        onClose?: () => void | boolean | Promise<void | boolean>;
    };
    initialPosition?: Position;
    className?: string;
    headerBackground?: string;
    zIndex?: number;
    move?: boolean;
    resize?: boolean;
    singleton?: boolean;
    errorMsg?: string;
    minimize?: {
        enabled?: boolean;
        isMinimized?: boolean;
    };
    headerIcon?: React.ReactNode;
    headerContent?: React.ReactNode;
    headerTitle?: string;
    maximize?: {
        enabled?: boolean;
        height?: number;
        width?: number;
    };
    contentClassName?: string;
}

export interface useDragAndDropProps {
    initialPosition: Position;
    parentRef: React.RefObject<HTMLDivElement>;
    popupRef: React.RefObject<HTMLDivElement>;
}

export interface UseResizeProps {
    resize: boolean;
    minWidth: number;
    minHeight: number;
    position: Position;
    setPosition: React.Dispatch<React.SetStateAction<Position>>;
    isRtl: boolean;
}

export interface Position {
    top?: string;
    left?: string;
    bottom?: string;
    right?: string;
}

export interface PopupWrapperProps {
    element: JSX.Element;
    position: Position;
    exitPopUp: () => void | Promise<void>;
}

export type MinimizePopupProps = Pick<PopUpProps, "id" | "zIndex" | "close" | "headerIcon" | "headerTitle"> & {
    exitPopUp: () => void;
    minimizedPopups: string[];
};

export interface ResizeHandleProps {
    startResizing: (e: React.MouseEvent) => void;
    isRtl: boolean;
}
