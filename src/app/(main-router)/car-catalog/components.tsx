"use client";
import { useTranslation } from "react-i18next";
import { PopupsStore, SettingsStore, UserStore } from "@/lib/store";
import { ConfirmForm, Loader, ModularForm, Table, TableButton, TableProps, TimesUI } from "akeyless-client-commons/components";
import { FormEvent, forwardRef, memo, MouseEvent, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useAddBrand, useDeleteBrand, useEditBrand } from "./hooks";
import { getFormElementValue, timestamp_to_string } from "akeyless-client-commons/helpers";
import { BrandItem, getModelName, ModelItem, parseAliases, uppercaseName, stringifyAliases, validateModel } from "./helpers";
import { TableOptionsWarper } from "@/components/utils";
import { cn, PRIMARY_BORDER } from "@/lib";
import { Button, Badge } from "@/components";
import { FormElement } from "akeyless-client-commons/types";
import { getClickLocation } from "@/components/popup";

// carCatalog table
interface CarCatalogTableProps {
    data: BrandItem[];
}
export const CarCatalogTable = memo(({ data }: CarCatalogTableProps) => {
    const { t } = useTranslation();
    const direction = SettingsStore.direction();
    const isRtl = SettingsStore.isRtl();
    const userTimeZone = UserStore.userTimeZone();

    const headers = [t("brand"), t("aliases"), t("models"), t("actions")];

    const keysToRender = useMemo(() => ["brand", "aliases_ui", "models_ui", "actions"], []);

    const sortKeys = useMemo(() => ["brand", "aliases_number", "models_number", "actions"], []);

    const formattedData = useMemo(() => {
        return data.map((brand) => {
            return {
                ...brand,
                aliases_ui: brand.aliases?.join(", "),
                aliases_number: brand.aliases?.length,
                models_ui: brand.models?.map((v) => v.model).join(", "),
                models_number: brand.models?.length,
                modelsAliases: brand.models
                    ?.map((m) => m.aliases)
                    .flat()
                    .join(", "),
                actions: (
                    <TableOptionsWarper>
                        <EditBrand brand={brand} />
                        <DeleteBrand brand={brand} />
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
        optionalElement: <AddBrand />,
    };

    return (
        <div className="p-3">
            <div style={{ direction: direction }} className="w-full h-full _center">
                {formattedData.length ? <Table {...tableProps} /> : <Loader size={200} />}
            </div>
        </div>
    );
});
CarCatalogTable.displayName = "CarCatalogTable";

// CRUD buttons
interface PropsWithBrand {
    brand: BrandItem;
}
const AddBrand = () => {
    const { t } = useTranslation();
    const onAddClick = useAddBrand();

    return (
        <>
            <TableButton type="add" onClick={onAddClick} title={t("add_brand")} />
        </>
    );
};
const EditBrand = ({ brand }: PropsWithBrand) => {
    const onEditClick = useEditBrand();
    const { t } = useTranslation();

    return <TableButton type="edit" title={t("edit_brand_title")} onClick={() => onEditClick(brand)} />;
};
const DeleteBrand = ({ brand }: PropsWithBrand) => {
    const { t } = useTranslation();
    const onDeleteClick = useDeleteBrand();
    return <TableButton type="delete" title={t("delete_brand").replace("{brand}", brand.brand)} onClick={() => onDeleteClick(brand)} />;
};

/// ModelsContainer
interface ModelsContainerProps {
    closeAllPopups: () => void;
    className?: string;
    brand?: BrandItem;
}
export interface ModelsContainerRef {
    updatedModels: ModelItem[];
    updatedBrandName?: string;
    setBrandInputValue?: (name: string) => void;
}
export const ModelsContainer = forwardRef<ModelsContainerRef, ModelsContainerProps>(({ className, brand, closeAllPopups, ...props }, ref) => {
    const { t } = useTranslation();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const direction = SettingsStore.direction();
    const [models, setModels] = useState<ModelItem[]>(brand?.models || []);
    const [updatedBrandName, setUpdatedBrandName] = useState("");
    const [brandInputValue, setBrandInputValue] = useState(brand?.brand || "");
    const modelLengthError = t("car_catalog_length_error").replace("{entity}", t("model")).replace("{length}", "2");

    useImperativeHandle(
        ref,
        () => ({
            updatedModels: models,
            updatedBrandName,
            setBrandInputValue: (b) => setBrandInputValue(b),
        }),
        [models, updatedBrandName, brandInputValue]
    );

    const onAddClick = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            const submit = async (newModel: ModelItem) => {
                const { validBrandName, validModelName } = await validateModel({
                    t,
                    newModel,
                    models,
                    brandInputValue: uppercaseName(brandInputValue),
                    modelLengthError,
                });
                const newModels = [...models, { ...newModel, model: validModelName }];

                setModels(newModels);
                setUpdatedBrandName(validBrandName);
                deletePopup("add_model");
            };

            addPopup({
                element: <ModelForm onSubmit={submit} />,
                id: "add_model",
                type: "custom",
                initialPosition: getClickLocation(e),
                headerContent: t("add_model"),
            });
        },
        [models, brandInputValue]
    );

    const onEditClick = useCallback(
        (e: MouseEvent<HTMLDivElement>, oldModel: ModelItem, index: number) => {
            const popupId = "edit_model " + oldModel.model;

            const submit = async (newModel: ModelItem) => {
                if (getModelName(newModel) === getModelName(oldModel)) {
                    if (stringifyAliases(newModel.aliases) === stringifyAliases(oldModel.aliases)) {
                        deletePopup(popupId);
                        console.log("no changes");
                        return;
                    }
                    deletePopup(popupId);
                    const newModels = models.map((m) => (getModelName(m) === getModelName(oldModel) ? newModel : m));
                    setModels(newModels);
                    return;
                }

                const { validBrandName, validModelName } = await validateModel({
                    t,
                    newModel,
                    models,
                    brandInputValue: uppercaseName(brandInputValue),
                    modelLengthError,
                    index,
                });

                const newModels = models.map((m) => (getModelName(m) === getModelName(oldModel) ? { ...newModel, model: validModelName } : m));
                setUpdatedBrandName(validBrandName);
                setModels(newModels);
                deletePopup(popupId);
            };
            addPopup({
                id: popupId,
                element: <ModelForm model={oldModel} onSubmit={submit} />,
                type: "custom",
                initialPosition: getClickLocation(e),
                headerContent: t("edit_model").replace("{model}", oldModel.model),
            });
        },
        [models, brandInputValue]
    );

    const onDeleteClick = useCallback(
        (e: MouseEvent<HTMLButtonElement>, model: ModelItem) => {
            e.stopPropagation();
            const popupId = "delete_model " + model.model;
            const onX = () => {
                deletePopup("edit_model " + model.model);
                deletePopup(popupId);
            };
            const onV = () => {
                setModels(models.filter((m) => m.model !== model.model));
                onX();
            };
            const form = <ConfirmForm onV={onV} onX={onX} direction={direction} headline={t("delete_model_confirmation")} />;
            addPopup({
                element: form,
                id: popupId,
                type: "custom",
                initialPosition: getClickLocation(e),
                headerContent: t("delete_model").replace("{model}", model.model),
            });
        },
        [models]
    );

    return (
        <div className={cn(`_full flex flex-col items-center gap-3  ${PRIMARY_BORDER} border-[2px] p-1`, className)}>
            <div className={`w-full text-center text-xl pb-1 ${PRIMARY_BORDER} border-b-2 `}>
                {t("models")}
                <span className="text-red-500">*</span>
            </div>
            <div className="_center w-full gap-2 flex-wrap">
                {models.length < 1 ? (
                    <div className="text-lg">{t("models_placeholder")}</div>
                ) : (
                    models.map((model, index) => {
                        return (
                            <Badge
                                onClick={(e) => onEditClick(e, model, index)}
                                key={model.model + index}
                                title={stringifyAliases(model.aliases)}
                                className="hover:cursor-pointer text-sm flex gap-2"
                            >
                                {model.model}
                                <button
                                    title={t("delete_model").replace("{model}", model.model)}
                                    type="button"
                                    onClick={(e) => onDeleteClick(e, model)}
                                >
                                    <i className="fa-regular fa-xmark hover:text-red-500 text-lg pt-1"></i>
                                </button>
                            </Badge>
                        );
                    })
                )}
            </div>
            <div className="w-full flex justify-end items-end ">
                <Button className="h-fit py-2 px-3" onClick={onAddClick} type="button" title={t("add_model")}>
                    <i className="fa-solid fa-plus "></i>
                </Button>
            </div>
        </div>
    );
});
ModelsContainer.displayName = "ModelsContainer";

/// ModelForm
interface ModelForm {
    model?: ModelItem;
    onSubmit: (model: ModelItem) => Promise<void>;
}
export const ModelForm = ({ model, onSubmit }: ModelForm) => {
    const { t } = useTranslation();
    const direction = SettingsStore.direction();
    const modelLengthError = t("car_catalog_length_error").replace("{entity}", t("model")).replace("{length}", "2");

    const submit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = e.currentTarget;
            const name = getFormElementValue(form, "name");
            const aliases = getFormElementValue(form, "aliases");
            const parsedName = uppercaseName(name);
            const parsedAliases = parseAliases(aliases);
            const newModel = {
                model: parsedName,
                aliases: parsedAliases.some((v) => v.toLocaleLowerCase() === name.toLocaleLowerCase()) ? parsedAliases : [...parsedAliases, name],
            };
            await onSubmit(newModel);
        },
        [onSubmit]
    );

    const elements: FormElement[] = [
        {
            type: "input",
            name: "name",
            required: true,
            labelContent: t("name"),
            labelClassName: "text-lg w-fit",
            containerClassName: "_center w-10/12",
            defaultValue: model?.model || "",
            validationError: modelLengthError,
            validationName: "charts",
            placeholder: t("model_placeholder"),
        },
        {
            type: "textarea",
            name: "aliases",
            labelContent: t("aliases"),
            containerClassName: "w-full",
            elementClassName: `${PRIMARY_BORDER} border-2`,
            placeholder: t("aliases_placeholder").replace("{entity}", t("model")),
            defaultValue: model ? stringifyAliases(model.aliases) : "",
        },
    ];
    return (
        <ModularForm
            formClassName="min-w-[500px] items-center"
            buttonClassName="bg-[#5f9ea0]"
            submitFunction={submit}
            elements={elements}
            direction={direction}
            buttonContent={t("save")}
        />
    );
};
