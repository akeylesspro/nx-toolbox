import { ReactNode } from "react";
import { Timestamp } from "firebase/firestore";
import { SettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "../ui";
import { timestamp_to_string } from "@/lib/helpers";
interface TableOptionsWarperProps {
    children: ReactNode;
    className?: string;
}
export const TableOptionsWarper = ({ children, className }: TableOptionsWarperProps) => {
    const direction = SettingsStore.direction();
    return (
        <div style={{ direction }} className={cn(`flex justify-start gap-3 `)}>
            {children}
        </div>
    );
};

interface TableButtonProps {
    onClick: () => void;
    title?: string;
    className?: string;
    type: "add" | "edit" | "delete" | "custom";
    children?: ReactNode;
}
export const TableButton = ({ onClick, title, className, type, children }: TableButtonProps) => {
    const icon = {
        add: "fa-regular fa-plus text-2xl",
        edit: "fa-light fa-pen-to-square text-xl",
        delete: "fa-light fa-trash text-xl",
    };
    return (
        <>
            {type === "custom" ? (
                <button className={className} title={title} onClick={onClick}>
                    {children}
                </button>
            ) : type === "add" ? (
                <Button title={title} onClick={onClick}>
                    <i className={cn("fa-regular fa-plus text-2xl", className)}></i>
                </Button>
            ) : (
                <button title={title} onClick={onClick}>
                    <i className={cn(icon[type], className)}></i>
                </button>
            )}
        </>
    );
};

export const TimesUI = ({ timestamp }: { timestamp: any }) => {
    return (
        <div className="_ellipsis " title={timestamp_to_string(timestamp as Timestamp, "DD/MM/YYYY HH:mm:ss")}>
            {timestamp_to_string(timestamp as Timestamp, "DD/MM/YYYY HH:mm:ss")}
        </div>
    );
};
