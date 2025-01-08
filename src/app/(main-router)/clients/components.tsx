"use client";
import { Client } from "akeyless-types-commons";
import { useTranslation } from "react-i18next";
import { CacheStore, SettingsStore } from "@/lib/store";
import { Loader, ModularForm, Table } from "akeyless-client-commons/components";
import { Dispatch, FormEvent, memo, RefObject, SetStateAction, useCallback, useMemo, useRef, useState } from "react";
import { FormElement, TableProps } from "akeyless-client-commons/types";
import { Button } from "@/components";
import { TableButton, TableOptionsWarper, TimesUI } from "@/components/utils";
import { useAddClient, useDeleteClient, useEditClient } from "./hooks";

// clients table
interface ClientsTableProps {
    data: Client[];
}
export const ClientsTable = memo(({ data }: ClientsTableProps) => {
    const { t } = useTranslation();
    const direction = SettingsStore.direction();
    const isRtl = SettingsStore.isRtl();

    const headers = [t("name"), t("key"), t("status"), t("language"), t("updated"), t("actions")];

    const keysToRender = useMemo(() => ["name", "key", "status_ui", "language_ui", "updated", "actions"], []);

    const sortKeys = useMemo(() => ["name", "key", "status_ui", "language_ui", "updated", "actions"], []);

    const formattedData = useMemo(() => {
        return data.map((client) => {
            return {
                ...client,
                status_ui: t(client.status!),
                language_ui: t(client.language || "he"),
                updated: <TimesUI timestamp={client.updated} />,
                actions: (
                    <TableOptionsWarper>
                        <EditClient client={client} />
                        <DeleteClient client={client} />
                    </TableOptionsWarper>
                ),
            };
        });
    }, [data, isRtl]);

    const tableProps: TableProps = {
        // settings
        includeSearch: true,
        maxRows: 100,
        // data
        data: formattedData,
        direction: direction,
        headers: headers,
        keysToRender: keysToRender,
        // filterableColumns: filterableColumns,
        sortKeys: sortKeys,
        // styles
        headerStyle: { backgroundColor: "cadetblue", height: "40px", fontSize: "18px" },
        containerHeaderClassName: "h-12 justify-between",
        containerClassName: "_full",
        cellClassName: "_ellipsis text-start h-10 px-3",
        tableContainerClass: "flex-1",
        searchInputClassName: "h-10 w-1/4",
        // labels
        searchPlaceHolder: t("search"),
        filterLabel: t("filter_by"),
        sortLabel: t("sort_by"),
        maxRowsLabel1: t("maxRowsLabel1"),
        maxRowsLabel2: t("maxRowsLabel2"),
        optionalElement: <AddClient />,
    };

    return (
        <div className="p-3">
            <div style={{ direction: direction }} className="w-full h-full _center">
                {formattedData.length ? <Table {...tableProps} /> : <Loader size={200} />}
            </div>
        </div>
    );
});
ClientsTable.displayName = "ClientsTable";

// CRUD buttons
interface PropsWithClient {
    client: Client;
}
const AddClient = () => {
    const { t } = useTranslation();
    const onAddClick = useAddClient();
    return (
        <>
            <TableButton type="add" onClick={onAddClick} title={t("add_client")} />
        </>
    );
};
const EditClient = ({ client }: PropsWithClient) => {
    const onEditClick = useEditClient();
    const { t } = useTranslation();

    return <TableButton type="edit" title={t("edit_client_title")} onClick={() => onEditClick(client)} />;
};
const DeleteClient = ({ client }: PropsWithClient) => {
    const { t } = useTranslation();
    const onDeleteClick = useDeleteClient();
    return <TableButton type="delete" title={t("delete_client")} onClick={() => onDeleteClick(client)} />;
};

// Wizard
interface ClientWizardProps {
    client?: Client;
    elements: FormElement[];
    submitFunction: (event: React.FormEvent<HTMLFormElement>, features: string[]) => Promise<void>;
}
export const ClientWizard = ({ elements, submitFunction, client }: ClientWizardProps) => {
    const direction = SettingsStore.direction();
    const { t } = useTranslation();
    const [activeForm, setActiveForm] = useState<"features" | "form">("form");
    const [features, setFeatures] = useState<string[]>(client?.features || []);
    const [isLoading, setIsLoading] = useState(false);
    const submitRef = useRef<HTMLButtonElement>(null);

    const submit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            try {
                setIsLoading(true);
                await submitFunction(e, features);
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                throw error;
            }
        },
        [features]
    );

    return (
        <div style={{ minWidth: "700px", minHeight: "500px" }} className="flex flex-col w-full">
            <WizardHeader activeForm={activeForm} setActiveForm={setActiveForm} />
            <div className=" flex-1 _center">
                <ModularForm
                    submitRef={submitRef}
                    direction={direction}
                    formClassName={`w-10/12 h-full ${activeForm === "features" ? "hidden" : "flex"}`}
                    buttonClassName="hidden"
                    elements={elements}
                    submitFunction={submit}
                    buttonContent={t("save")}
                />
                <FeaturesForm display={activeForm === "features" ? "flex" : "none"} features={features} setFeatures={setFeatures} />
            </div>
            <WizardFooter submitRef={submitRef} isLoading={isLoading} />
        </div>
    );
};

interface WizardHeaderProps {
    activeForm: "features" | "form";
    setActiveForm: Dispatch<SetStateAction<"features" | "form">>;
}
export const WizardHeader = memo(({ activeForm, setActiveForm }: WizardHeaderProps) => {
    const { t } = useTranslation();
    return (
        <div className=" w-full px-2 flex items-center justify-start gap-2 h-8  ">
            <button
                onClick={() => setActiveForm("form")}
                className={` ${activeForm === "form" ? "text-[#5f9ea0]" : "text-[#00000076]"} font-bold text-[16px]`}
            >
                {t("client_details")}
            </button>
            <div className="h-6 bg-[#00000076] w-[1px]"></div>
            <button
                onClick={() => setActiveForm("features")}
                className={` ${activeForm === "features" ? "text-[#5f9ea0]" : "text-[#00000076]"} font-bold text-lg`}
            >
                {t("features")}
            </button>
        </div>
    );
});
WizardHeader.displayName = "WizardHeader";

interface WizardFooterProps {
    isLoading: boolean;
    submitRef: RefObject<HTMLButtonElement>;
}
export const WizardFooter = memo(({ submitRef, isLoading }: WizardFooterProps) => {
    const { t } = useTranslation();
    return (
        <div className="h-10 w-full flex justify-end items-center px-2">
            <Button disabled={isLoading} onClick={() => submitRef.current?.click()}>
                {isLoading ? <Loader size={20} color="#fff" /> : t("save")}
            </Button>
        </div>
    );
});
WizardFooter.displayName = "WizardFooter";

// features form
interface FeaturesFormProps {
    display: string | undefined;
    setFeatures: React.Dispatch<React.SetStateAction<string[]>>;
    features: string[];
}
export const FeaturesForm = memo(
    ({ display, setFeatures, features }: FeaturesFormProps) => {
        const clientFeatures = CacheStore.getFeaturesByScope()("client");
        const onChecked = useCallback(
            (feature: string) => {
                setFeatures((prev) => {
                    if (prev.includes(feature)) {
                        return prev.filter((v) => v !== feature);
                    }
                    return [...prev, feature];
                });
            },
            [setFeatures]
        );

        return (
            <div style={{ display: display }} className="overflow-auto max-h-[320px]">
                <div className="w-full flex  flex-wrap items-center justify-start ">
                    {clientFeatures.map((feature) => (
                        <CheckBox defaultCheck={features.includes(feature.name)} name={feature.name} onChecked={onChecked} key={feature.name} />
                    ))}
                </div>
            </div>
        );
    },
    (prev, next) => {
        return JSON.stringify(prev) === JSON.stringify(next);
    }
);
FeaturesForm.displayName = "FeaturesForm";

interface CheckBoxProps {
    name: string;
    onChecked: (name: string) => void;
    defaultCheck: boolean;
}
export const CheckBox = memo(
    ({ name, onChecked, defaultCheck }: CheckBoxProps) => {
        const featuresTranslation = CacheStore.getFeaturesTranslation()("features", name);
        const isRtl = SettingsStore.isRtl();
        return (
            <div
                title={featuresTranslation}
                className={`transition-colors duration-300 w-80 h-10 flex items-center px-2 hover:bg-[#a1824a] justify-start gap-3 rounded-xl`}
            >
                <input
                    type="checkbox"
                    defaultChecked={defaultCheck}
                    onChange={() => onChecked(name)}
                    className={`cursor-pointer appearance-none w-9 focus:outline-none checked:bg-[#0080009b] h-5 bg-gray-300 rounded-full after:inline-block after:rounded-full after:bg-[#0000005b] after:h-4 after:w-4 checked:after:bg-[#fff] ${
                        isRtl ? "checked:after:-translate-x-full" : "checked:after:-translate-x-[-15px]"
                    } shadow-inner transition-all duration-300 before:mr-0.5`}
                />
                <div className="ellipsis max-w-[79%]">{featuresTranslation}</div>
            </div>
        );
    },
    (prev, next) => {
        return prev.defaultCheck === next.defaultCheck;
    }
);
CheckBox.displayName = "CheckBox";
