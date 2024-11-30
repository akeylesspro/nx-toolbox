export interface PopUpProps {
    id: string;
    element: JSX.Element;
    type: "info" | "error" | "warning" | "interaction";
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
    errorMsg?: string;
    minimize?: {
        enable?: boolean;
        isMinimized?: boolean;
        icon?: React.ReactNode;
        iconTitle?: string;
    };
    maximize?: {
        enable?: boolean;
        height?: number;
        width?: number;
    };
}

export interface useDragAndDropProps {
    initialPosition: Position;
}

export interface UseResizeProps {
    initialWidth: number;
    initialHeight: number;
    minWidth: number;
    minHeight: number;
    setPosition: React.Dispatch<React.SetStateAction<Position>>;
    position: Position;
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
