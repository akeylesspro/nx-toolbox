"use client";
import { Client } from "akeyless-types-commons";
import { useTranslation } from "react-i18next";
import { CacheStore, SettingsStore } from "@/lib/store";
import { Loader, ModularForm, Table, TableProps, TimesUI } from "akeyless-client-commons/components";
import { FormEvent, memo, useCallback, useMemo, useRef, useState } from "react";
import { FeatureCheckbox, TableButton, TableOptionsWarper, MultiStepForm } from "@/components/utils";
import { useAddClient, useDeleteClient, useEditClient } from "./hooks";
import { Timestamp } from "firebase/firestore";
import { timestamp_to_string } from "akeyless-client-commons/helpers";
import { FormElement } from "akeyless-client-commons/types";

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

    const sortKeys = useMemo(() => ["name", "key", "status_ui", "updated_string", "language_ui", "updated", "actions"], []);

    const formattedData = useMemo(() => {
        return data.map((client) => {
            return {
                ...client,
                status_ui: t(client.status!),
                language_ui: t(client.language || "he"),
                updated_string: client.updated ? timestamp_to_string(client.updated as Timestamp) : "",
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
    const numberMaxData = formattedData?.length;
    const tableProps: TableProps = {
        // settings
        includeSearch: true,
        maxRows: numberMaxData,
        // data
        data: formattedData,
        direction: direction,
        headers: headers,
        keysToRender: keysToRender,
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

/// CRUD buttons
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

/// wizard
interface ClientWizardProps {
    client?: Client;
    elements: FormElement[];
    submitFunction: (event: React.FormEvent<HTMLFormElement>, features: string[]) => Promise<void>;
}
export const ClientWizard = ({ elements, submitFunction, client }: ClientWizardProps) => {
    const direction = SettingsStore.direction();
    const { t } = useTranslation();
    const [activeForm, setActiveForm] = useState<string>("form");
    const [features, setFeatures] = useState<string[]>(client?.features || []);
    const [isLoading, setIsLoading] = useState(false);
    const submitRef = useRef<HTMLButtonElement>(null);

    const submit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            setIsLoading(true);
            try {
                await submitFunction(e, features);
            } catch (error) {
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [features]
    );

    return (
        <MultiStepForm
            options={[
                { key: "form", label: t("client_details") },
                { key: "features", label: t("features") },
            ]}
            ref={submitRef}
            isLoading={isLoading}
            activeChild={activeForm}
            setActiveChild={setActiveForm}
            submitFunction={submit}
        >
            <div className=" flex-1 _center ">
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
        </MultiStepForm>
    );
};

/// features form
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
        const clientTranslation = CacheStore.getFeaturesTranslation()("client");

        return (
            <div style={{ display: display }} className="overflow-auto max-h-[350px] max-w-[700px]">
                <div className="w-full flex  flex-wrap items-center justify-start ">
                    {clientFeatures.map((feature) => (
                        <FeatureCheckbox
                            featureName={clientTranslation["client__" + feature]}
                            defaultCheck={features.includes(feature)}
                            feature={feature}
                            onChecked={onChecked}
                            key={feature}
                            containerClassName="min-w-80"
                        />
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
