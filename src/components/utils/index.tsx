import { memo, ReactNode } from "react";
import { Timestamp } from "firebase/firestore";
import { SettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "../ui";
import { timestamp_to_string } from "@/lib/helpers";
import { PRIMARY_COLOR } from "@/lib";
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
        <div className="_ellipsis" title={timestamp_to_string(timestamp as Timestamp, "DD/MM/YYYY HH:mm:ss")}>
            {timestamp_to_string(timestamp as Timestamp, "DD/MM/YYYY HH:mm:ss")}
        </div>
    );
};

interface FeatureCheckboxProps {
    feature: string;
    onChecked: (name: string) => void;
    defaultCheck: boolean;
    featureName: string;
    containerClassName?: string;
    disabled?: boolean;
    title?: string;
}

export const FeatureCheckbox = memo(
    ({ feature, onChecked, defaultCheck, featureName, containerClassName, title, disabled = false }: FeatureCheckboxProps) => {
        const isRtl = SettingsStore.isRtl();
        return (
            <div
                title={title || featureName}
                className={cn(
                    `transition-colors cursor-default duration-300 h-10 flex items-center px-2 ${
                        disabled ? "hover:bg-[#5f9ea078]" : `hover:bg-[#5f9ea0]`
                    }  justify-start gap-3 rounded-xl`,
                    containerClassName
                )}
            >
                <input
                    type="checkbox"
                    defaultChecked={defaultCheck}
                    onChange={() => !disabled && onChecked(feature)}
                    className={` ${
                        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }  appearance-none w-9 focus:outline-none checked:bg-[#0080009b] h-5 bg-gray-300 rounded-full after:inline-block after:rounded-full after:bg-[#0000005b] after:h-4 after:w-4 ${"checked:after:bg-[#fff]"} ${
                        isRtl ? "checked:after:-translate-x-full" : "checked:after:-translate-x-[-15px]"
                    } shadow-inner transition-all duration-300 before:mr-0.5`}
                    disabled={disabled}
                />
                <div className={`ellipsis max-w-[79%] ${disabled ? "opacity-50" : ""}`}>{featureName}</div>
            </div>
        );
    },
    (prev, next) => {
        return prev.defaultCheck === next.defaultCheck && prev.disabled === next.disabled && prev.title === next.title;
    }
);
FeatureCheckbox.displayName = "FeatureCheckbox";
