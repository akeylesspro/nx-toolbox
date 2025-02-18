"use brand";
import { useTranslation } from "react-i18next";
import { PopupsStore, SettingsStore, UserStore } from "@/lib/store";
import { Loader, ModularForm, Table, TableButton, TableProps, TimesUI } from "akeyless-client-commons/components";
import { FormEvent, forwardRef, memo, MouseEvent, useCallback, useImperativeHandle, useMemo, useState } from "react";
import { useAddBrand, useDeleteBrand, useEditBrand } from "./hooks";
import { Timestamp } from "firebase/firestore";
import { getFormElementValue, timestamp_to_string } from "akeyless-client-commons/helpers";
import { BrandItem, ModelItem } from "./helpers";
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

    const headers = [t("brand"), t("aliases"), t("models"), t("updated"), t("actions")];

    const keysToRender = useMemo(() => ["brand", "aliases_ui", "models_ui", "updated_ui", "actions"], []);

    const sortKeys = useMemo(() => ["brand", "aliases_number", "models_number", "updated_string", "actions"], []);

    const formattedData = useMemo(() => {
        return data.map((brand) => {
            return {
                ...brand,
                updated_ui: <TimesUI timestamp={brand.updated} tz={userTimeZone} direction={direction} />,
                updated_string: brand.updated ? timestamp_to_string(brand.updated as Timestamp, { format: "YY/MM/DD HH:mm" }) : "",
                aliases_ui: brand.aliases?.join(", "),
                aliases_number: brand.aliases?.length,
                models_ui: brand.models?.map((v) => v.model).join(", "),
                models_number: brand.models?.length,
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
        searchInputClassName: "h-10 w-1/4",
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
    return <TableButton type="delete" title={t("delete_brand")} onClick={() => onDeleteClick(brand)} />;
};

/// ModelsContainer
interface ModelsContainerProps {
    className?: string;
    brand?: BrandItem;
}
export interface ModelsContainerRef {
    updatedModels: ModelItem[];
}
export const ModelsContainer = forwardRef<ModelsContainerRef, ModelsContainerProps>(({ className, brand, ...props }, ref) => {
    const { t } = useTranslation();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const [models, setModels] = useState<ModelItem[]>(brand?.models || []);

    useImperativeHandle(
        ref,
        () => ({
            updatedModels: [...models],
        }),
        [models]
    );

    const onEditClick = (e: MouseEvent<HTMLDivElement>, model: ModelItem) => {
        const popupId = "edit_model " + model.model;
        const submit = async (newModel: ModelItem) => {
            console.log(newModel, "model");
            setModels(models.map((m) => (m.model.toLocaleLowerCase().trim() === model.model.toLocaleLowerCase().trim() ? newModel : m)));
            deletePopup(popupId);
        };
        const onDelete = (newModel: ModelItem) => {
            setModels(models.filter((m) => m.model !== newModel.model));
            deletePopup(popupId);
        };
        addPopup({
            id: popupId,
            element: <ModelForm model={model} onSubmit={submit} onDelete={onDelete} />,
            type: "custom",
            initialPosition: getClickLocation(e),
            headerContent: t("edit_model").replace("{model}", model.model),
        });
    };

    const onAddClick = (e: MouseEvent<HTMLButtonElement>) => {
        const submit = async (newModel: ModelItem) => {
            console.log(newModel, "model");
            setModels([...models, newModel]);
            deletePopup("add_model");
        };

        addPopup({
            element: <ModelForm onSubmit={submit} />,
            id: "add_model",
            type: "custom",
            initialPosition: getClickLocation(e),
            headerContent: t("add_model"),
        });
    };

    return (
        <div className={cn(`_full flex flex-col items-center gap-3  ${PRIMARY_BORDER} border-[2px] p-1`, className)}>
            <div className={`w-full text-center  text-xl ${PRIMARY_BORDER} border-b-2 `}>{t("models")}</div>
            <div className="_center w-full gap-2 flex-wrap">
                {models.map((model, i) => {
                    return (
                        <Badge
                            onClick={(e) => onEditClick(e, model)}
                            key={model.model + i}
                            title={t("edit_model").replace("{model}", model.model)}
                            className="hover:cursor-pointer"
                        >
                            {model.model}
                        </Badge>
                    );
                })}
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
    onSubmit: (model: ModelItem) => void;
    onDelete?: (model: ModelItem) => void;
}
export const ModelForm = ({ model, onSubmit, onDelete }: ModelForm) => {
    const { t } = useTranslation();
    const direction = SettingsStore.direction();

    const submit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = getFormElementValue(form, "name");
        const aliases = getFormElementValue(form, "aliases");
        const parsedName = name.charAt(0).toUpperCase() + name.slice(1);
        const parsedAliases = aliases.split(",").map((alias) => alias.trim());
        const newModel = {
            model: parsedName,
            aliases: parsedAliases,
        };
        onSubmit(newModel);
    }, []);
    const elements: FormElement[] = [
        {
            type: "input",
            name: "name",
            required: true,
            labelContent: t("name"),
            containerClassName: "_center w-full",
            defaultValue: model?.model || "",
            validationName: "charts",
            placeholder: t("model_placeholder"),
        },
        {
            type: "input",
            name: "aliases",
            required: true,
            labelContent: t("aliases"),
            containerClassName: "_center w-full",
            placeholder: t("aliases_placeholder").replace("{entity}", t("model")),
            defaultValue: model?.aliases.join(", ") || "",
            validationName: "charts",
        },
    ];
    return (
        <div className="flex flex-col items-center  gap-2  py-2">
            {model && onDelete && (
                <Button type="button" className="bg-red-500 w-11/12" onClick={() => onDelete(model)} title={t("delete_model")}>
                    {t("delete_model")}
                </Button>
            )}
            <ModularForm
                formClassName="min-w-[500px]"
                buttonClassName="bg-[#5f9ea0]"
                submitFunction={submit}
                elements={elements}
                direction={direction}
                buttonContent={t("save")}
            />
        </div>
    );
};
