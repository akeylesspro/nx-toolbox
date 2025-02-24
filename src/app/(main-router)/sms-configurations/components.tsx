"use client";
import { useTranslation } from "react-i18next";
import { CacheStore, PopupsStore, SettingsStore, UserStore } from "@/lib/store";
import { ConfirmForm, Loader, ModularForm, SelectWithSearch, Table, TableButton, TableProps, TimesUI } from "akeyless-client-commons/components";
import {
    Dispatch,
    FormEvent,
    forwardRef,
    memo,
    MouseEvent,
    SetStateAction,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";
import { useAddEditConfiguration, useDeleteConfiguration } from "./hooks";
import { getFormElementValue, timestamp_to_string } from "akeyless-client-commons/helpers";
import { ConfigurationModel, SmsConfigurationItem } from "./helpers";
import { TableOptionsWarper } from "@/components/utils";
import { cn, PRIMARY_BORDER } from "@/lib";
import { Button, Badge } from "@/components";
import { FormElement } from "akeyless-client-commons/types";
import { getClickLocation } from "@/components/popup";
import { ModelItem } from "../car-catalog/helpers";

// smsConfigurations table
interface SmsConfigurationsTableProps {
    data: SmsConfigurationItem[];
}
export const SmsConfigurationsTable = memo(({ data }: SmsConfigurationsTableProps) => {
    const { t } = useTranslation();
    const direction = SettingsStore.direction();
    const isRtl = SettingsStore.isRtl();

    const headers = [t("name"), t("models"), t("configurations_sms"), t("actions")];

    const keysToRender = useMemo(() => ["name", "models_ui", "configurations_ui", "actions"], []);

    const sortKeys = useMemo(() => ["name", "models_number", "configurations_number", "actions"], []);

    const formattedData = useMemo(() => {
        return data.map((configuration) => {
            return {
                ...configuration,
                models_ui: configuration.models.map((c) => `${c.brand} ${c.model}`)?.join(", "),
                models_number: configuration.models?.length,
                configurations_ui: configuration.configurations_sms?.join(", "),
                configurations_number: configuration.configurations_sms?.length,
                actions: (
                    <TableOptionsWarper>
                        <EditConfiguration configuration={configuration} />
                        <DeleteConfiguration configuration={configuration} />
                    </TableOptionsWarper>
                ),
            };
        });
    }, [data, isRtl]);

    const numberMaxData = formattedData.length;
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
        searchInputClassName: "h-10 w-11/12",
        searchContainerClassName: "w-1/4",
        // labels
        searchPlaceHolder: t("search"),
        filterLabel: t("filter_by"),
        sortLabel: t("sort_by"),
        maxRowsLabel1: t("maxRowsLabel1"),
        maxRowsLabel2: t("maxRowsLabel2"),
        optionalElement: <AddConfiguration />,
    };

    return (
        <div className="p-3">
            <div style={{ direction: direction }} className="w-full h-full _center">
                {formattedData.length ? <Table {...tableProps} /> : <Loader size={200} />}
            </div>
        </div>
    );
});
SmsConfigurationsTable.displayName = "SmsConfigurationsTable";

// CRUD buttons
interface PropsWithConfiguration {
    configuration: SmsConfigurationItem;
}
const AddConfiguration = () => {
    const { t } = useTranslation();
    const onClick = useAddEditConfiguration();
    return <TableButton type="add" onClick={() => onClick()} title={t("add_configuration")} />;
};
const EditConfiguration = ({ configuration }: PropsWithConfiguration) => {
    const onClick = useAddEditConfiguration();
    const { t } = useTranslation();
    return <TableButton type="edit" title={t("edit_configuration_title")} onClick={() => onClick(configuration)} />;
};
const DeleteConfiguration = ({ configuration }: PropsWithConfiguration) => {
    const { t } = useTranslation();
    const onDeleteClick = useDeleteConfiguration();
    return (
        <TableButton
            type="delete"
            title={t("delete_configuration").replace("{configuration}", configuration.name)}
            onClick={() => onDeleteClick(configuration)}
        />
    );
};

interface ModelsContainerProps {
    configurationItem?: SmsConfigurationItem;
}
export const ModelsContainer = memo(
    ({ configurationItem }: ModelsContainerProps) => {
        const { t } = useTranslation();

        const [models, setModels] = useState<ConfigurationModel[]>(configurationItem?.models || []);
        const onAddClick = () => {
            setModels([...models, { brand: "", model: "", year: "" }]);
        };
        return (
            <div className={`w-full flex flex-col gap-4 ${PRIMARY_BORDER} border-2 p-2`}>
                <div className={`w-full text-center text-xl pb-1 ${PRIMARY_BORDER} border-b-2 `}>
                    {t("models")}
                    <span className="text-red-500">*</span>
                </div>
                <div className="w-full flex flex-col gap-3 overflow-auto max-h-32">
                    {models.length < 1 ? (
                        <div className="text-lg">{t("models_placeholder")}</div>
                    ) : (
                        models.map((model, index) => {
                            return (
                                <ModelRow key={index} index={index} setModels={setModels} brand={model.brand} model={model.model} year={model.year} />
                            );
                        })
                    )}
                </div>
                <div className="w-full flex justify-end items-end ">
                    <Button className="h-fit py-2 px-3" onClick={onAddClick} type="button" title={t("add_model")}>
                        <i className="fa-solid fa-plus "></i>
                    </Button>
                </div>
                <input value={JSON.stringify(models)} name="models" type="hidden" />
            </div>
        );
    },
    (p, n) => JSON.stringify(p) === JSON.stringify(n)
);
ModelsContainer.displayName = "ModelsContainer";

interface ModelRowProps {
    brand?: string;
    model?: string;
    year?: string;
    index: number;
    setModels: Dispatch<SetStateAction<ConfigurationModel[]>>;
}
export const ModelRow = memo(({ brand, model, year, index, setModels }: ModelRowProps) => {
    const { t } = useTranslation();
    const carCatalog = CacheStore.carCatalog();
    const [selectedBrand, setSelectedBrand] = useState(brand || "");
    const [selectedModel, setSelectedModel] = useState(model || "");
    const [selectedYear, setSelectedYear] = useState(year || "");

    useEffect(() => {
        setModels((prev) => {
            const newModels = prev.map((m, i) => (i === index ? { model: selectedModel, year: selectedYear, brand: selectedBrand } : m));
            return newModels;
        });
    }, [selectedModel, selectedYear, selectedBrand]);

    const modelOptions = useMemo(() => {
        return (carCatalog.find((c) => c.brand === selectedBrand)?.models || []).map((m) => ({
            label: m.model,
            value: m.model,
            aliases: JSON.stringify(m.aliases),
        }));
    }, [carCatalog, selectedBrand]);

    const yearsOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 41 }, (_, i) => (currentYear - i).toString()).map((y) => ({ label: y, value: y }));
    }, []);

    const onBrandChange = (brand: string) => {
        setSelectedBrand(brand);
        setSelectedModel("");
    };

    const onModelChange = (model: string) => {
        setSelectedModel(model);
    };

    const onYearChange = (year: string) => {
        setSelectedYear(year);
    };
    const onDeleteClick = () => {
        setModels((prev) => prev.filter((_, i) => i !== index));
    };
    return (
        <div className="w-full flex gap-3 justify-start items-center px-2">
            <SelectWithSearch
                labelContent={t("brand")}
                placeholder={t("select_entity").replace("{entity}", t("brand"))}
                sortDirection="abc"
                value={selectedBrand}
                onChange={(brand) => onBrandChange(brand)}
                options={carCatalog.map((c) => ({ label: c.brand, value: c.brand, aliases: JSON.stringify(c.aliases) }))}
                notFoundLabel={t("entity_not_found").replace("{entity}", t("brand"))}
            />
            <SelectWithSearch
                labelContent={t("model")}
                placeholder={t("select_entity").replace("{entity}", t("model"))}
                sortDirection="abc"
                value={selectedModel}
                onChange={(model) => onModelChange(model)}
                options={modelOptions}
                notFoundLabel={t("entity_not_found").replace("{entity}", t("model"))}
            />
            <SelectWithSearch
                labelContent={t("year")}
                placeholder={t("select_entity").replace("{entity}", t("year"))}
                value={selectedYear}
                onChange={(year) => onYearChange(year)}
                options={yearsOptions}
                notFoundLabel={t("entity_not_found").replace("{entity}", t("year"))}
            />
            <button title={t("delete_model").replace(" - {model}", "")} type="button" onClick={onDeleteClick}>
                {<i className="fa-light fa-trash text-xl text-red-500" />}
            </button>
        </div>
    );
});
