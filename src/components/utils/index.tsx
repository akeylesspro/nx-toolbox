import { Dispatch, ForwardedRef, forwardRef, memo, ReactNode, RefObject, SetStateAction, useRef, useState } from "react";
import { SettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "../ui";
import { PRIMARY_BORDER } from "@/lib";
import { useTranslation } from "react-i18next";
import { Loader } from "akeyless-client-commons/components";
interface TableOptionsWarperProps {
    children: ReactNode;
    className?: string;
}
export const TableOptionsWarper = ({ children, className }: TableOptionsWarperProps) => {
    const direction = SettingsStore.direction();
    return (
        <div style={{ direction }} className={cn(`flex justify-start gap-3 `, className)}>
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
                <div className={`_ellipsis max-w-[79%] ${disabled ? "opacity-50" : ""}`}>{featureName}</div>
            </div>
        );
    },
    (prev, next) => {
        return JSON.stringify(prev) === JSON.stringify(next);
    }
);
FeatureCheckbox.displayName = "FeatureCheckbox";

// multiStepForm
interface MultiStepFormProps {
    isLoading: boolean;
    submitFunction: (event: React.FormEvent<HTMLFormElement>, features: string[]) => Promise<void>;
    activeChild: string;
    setActiveChild: Dispatch<SetStateAction<string>>;
    children: ReactNode;
    className?: string;
    options: { key: string; label: string }[];
}

export const MultiStepForm = forwardRef<HTMLButtonElement, MultiStepFormProps>(
    ({ isLoading, activeChild, children, setActiveChild, className, options, ...props }, ref) => {
        return (
            <div className={cn("flex flex-col min-w-[700px] min-h-[500px]", className)}>
                <MultiStepFormHeader options={options} activeChild={activeChild} setActiveChild={setActiveChild} />
                {children}
                <MultiStepFormFooter submitRef={ref} isLoading={isLoading} />
            </div>
        );
    }
);
MultiStepForm.displayName = "multiStepForm";

interface MultiStepFormHeaderProps {
    activeChild: string;
    setActiveChild: Dispatch<SetStateAction<string>>;
    options: { key: string; label: string }[];
}
export const MultiStepFormHeader = memo(({ activeChild, setActiveChild, options }: MultiStepFormHeaderProps) => {
    return (
        <div className={`w-full py-6 flex items-center justify-center  h-8 `}>
            <div className={`w-[95%] flex items-center justify-start gap-1.5 border-b-[2px] ${PRIMARY_BORDER}`}>
                {options?.map((option, index) => {
                    const showLine = index % 2 === 0;
                    const isActive = activeChild === option.key;
                    return (
                        <div key={index} className={`flex items-center gap-1.5 h-full`}>
                            <button
                                onClick={() => setActiveChild(option.key)}
                                className={` ${isActive ? `text-[#5f9ea0] font-bold` : "text-[#00000073]"}  text-[18px] h-7 px-1`}
                            >
                                {option.label}
                            </button>
                            {showLine && <div className="h-6 bg-[#00000076] w-[2px]"></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
MultiStepFormHeader.displayName = "multiStepFormHeader";

interface MultiStepFormFooterProps {
    isLoading: boolean;
    submitRef: ForwardedRef<HTMLButtonElement>;
}
export const MultiStepFormFooter = memo(({ submitRef, isLoading }: MultiStepFormFooterProps) => {
    const { t } = useTranslation();
    return (
        <div className="h-14 w-full flex justify-end items-center p-2 ">
            <Button
                disabled={isLoading}
                onClick={() => {
                    if (typeof submitRef === "object" && submitRef?.current) {
                        submitRef.current.click();
                    }
                }}
            >
                {isLoading ? <Loader size={20} color="#fff" /> : t("save")}
            </Button>
        </div>
    );
});
MultiStepFormFooter.displayName = "multiStepFormFooter";
