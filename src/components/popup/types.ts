export interface PopUpProps {
    id: string;
    element: JSX.Element;
    type: "info" | "error" | "warning" | "custom";
    close?: {
        noClose?: boolean;
        onClose?: () => void | boolean | Promise<void | boolean>;
    };
    top?: string;
    left?: string;
    bottom?: string;
    right?: string;
    headerBackground?: string;
    zIndex?: number;
    move?: boolean;
    resize?: boolean;
    singleton?: boolean;
    errorMsg?: string;
    minimize?: {
        enabled?: boolean;
        isMinimized?: boolean;
        icon?: React.ReactNode;
        iconTitle?: string;
    };
    maximize?: {
        enabled?: boolean;
        height?: number;
        width?: number;
    };
}

export interface useDragAndDropProps {
    initialPosition: Position;
}

export interface UseResizeProps {
    resize: boolean;
    minWidth: number;
    minHeight: number;
    position: Position;
    setPosition: React.Dispatch<React.SetStateAction<Position>>;
    isLtr: boolean;
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

export type MinimizePopupProps = Pick<PopUpProps, "id" | "type" | "zIndex" | "close" | "minimize"> & {
    exitPopUp: () => void;
    minimizedPopups: string[];
};

export interface ResizeHandleProps {
    startResizing: (e: React.MouseEvent) => void;
    isLtr: boolean;
}
