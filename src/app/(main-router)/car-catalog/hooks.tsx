import { LanguageOptions } from "akeyless-types-commons";
import { FormEvent, useCallback, useRef } from "react";
import { ConfirmForm, ModularForm } from "akeyless-client-commons/components";
import { getFormElementValue } from "akeyless-client-commons/helpers";
import { FormElement } from "akeyless-client-commons/types";
import { useTranslation } from "react-i18next";
import { PopupsStore, SettingsStore } from "@/lib/store";
import { addBrand, BrandItem, updateBrand } from "./helpers";
import { ModelsContainer, ModelsContainerRef } from "./components";

const initialPosition = { top: "25%", left: "30%" };

export const useAddBrand = () => {
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const deletePopupsGroup = PopupsStore.deletePopupsGroup();
    const { t } = useTranslation();
    const direction = SettingsStore.direction();

    const onAddClick = useCallback(async () => {
        const headerContent = "add_brand";
        const elements: FormElement[] = [
            {
                type: "input",
                name: "brand",
                required: true,
                labelContent: t("brand"),
                containerClassName: "_center w-full",
                validationName: "charts",
            },
            { type: "input", name: "aliases", labelContent: t("aliases"), containerClassName: "_center w-full", validationName: "charts" },
        ];
        const submit = async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = e.currentTarget;
            const brand = getFormElementValue(form, "brand");
            const aliases = getFormElementValue(form, "aliases");

            const parseBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
            const parsedAliases = aliases.split(",").map((alias) => alias.trim());
            const newBrand = {
                brand: parseBrand,
                aliases: parsedAliases,
            };
            console.log(newBrand, "newBrand");
            // await addBrand(newBrand, t);
            // deletePopup("add_brand");
        };
        const form = (
            <ModularForm
                direction={direction}
                buttonContent={t("save")}
                elements={elements}
                formClassName="min-w-[400px]"
                submitFunction={submit}
                buttonClassName="bg-[#5f9ea0]"
            />
        );
        addPopup({
            close: {
                onClose: () => {
                    deletePopupsGroup("add_model");
                    deletePopupsGroup("edit_model");
                },
            },
            element: form,
            id: "add_brand",
            type: "custom",
            initialPosition,
            headerContent: t(headerContent),
        });
    }, [addPopup, deletePopup]);
    return onAddClick;
};

export const useEditBrand = () => {
    const { t } = useTranslation();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const deletePopupsGroup = PopupsStore.deletePopupsGroup();
    const direction = SettingsStore.direction();
    const modelsRef = useRef<ModelsContainerRef>({ updatedModels: [] });
    const onEditClick = useCallback(
        (brand: BrandItem) => {
            const headerContent = t("edit_brand").replace("{brand}", brand.brand!);
            const elements: FormElement[] = [
                {
                    type: "input",
                    name: "brand",
                    required: true,
                    labelContent: t("brand"),
                    containerClassName: "_center w-10/12",
                    props: { title: brand.brand },
                    placeholder: t("brand_placeholder"),
                    defaultValue: brand.brand,
                    validationName: "charts",
                },
                {
                    type: "input",
                    name: "aliases",
                    labelContent: t("aliases"),
                    containerClassName: "_center w-10/12",
                    placeholder: t("aliases_placeholder").replace("{entity}", t("brand")),
                    props: { title: brand.aliases.join(", ") },
                    validationName: "charts",
                    defaultValue: brand.aliases.join(", "),
                },
                { type: "custom", element: <ModelsContainer brand={brand} ref={modelsRef} /> },
            ];
            const submit = async (e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = e.currentTarget;
                const brandInput = getFormElementValue(form, "brand");
                const aliasesInput = getFormElementValue(form, "aliases");
                const parsedBrand = brandInput.charAt(0).toUpperCase() + brandInput.slice(1);
                const parsedAliases = aliasesInput.split(",").map((alias) => alias.trim());
                const updatedBrand = {
                    brand: parsedBrand,
                    aliases: parsedAliases,
                    models: modelsRef.current?.updatedModels,
                };
                console.log(updatedBrand, "updatedBrand");

                // await updateBrand(brand.id!, updatedBrand);
                // deletePopup("edit_brand" + brand.id);
            };
            const form = (
                <ModularForm
                    direction={direction}
                    buttonContent={t("save")}
                    elements={elements}
                    formClassName="min-w-[600px] flex flex-col items-center justify-center"
                    submitFunction={submit}
                    buttonClassName="bg-[#5f9ea0]"
                />
            );
            addPopup({
                close: {
                    onClose: () => {
                        deletePopupsGroup("add_model");
                        deletePopupsGroup("edit_model");
                    },
                },
                element: form,
                id: "edit_brand" + brand.id,
                type: "custom",
                initialPosition,
                headerContent,
            });
        },
        [deletePopup, addPopup, direction]
    );

    return onEditClick;
};

export const useDeleteBrand = () => {
    const deletePopup = PopupsStore.deletePopup();
    const direction = SettingsStore.direction();
    const addPopup = PopupsStore.addPopup();
    const { t } = useTranslation();

    const onDeleteClick = useCallback(
        (brand: BrandItem) => {
            const onX = async () => {
                deletePopup("delete_brand " + brand.id);
            };
            const onV = async () => {
                // await updateBrand(brand.id!, { status: BrandStatus.Deleted });
                onX();
            };

            addPopup({
                element: (
                    <ConfirmForm
                        direction={direction}
                        onV={onV}
                        onX={onX}
                        headline={t("brand_delete_confirmation").replace("{name}", brand.brand!)}
                        containerClassName="w-80 flex flex-col gap-4"
                        buttonsContainerClassName="_center gap-4"
                    />
                ),
                id: "delete_brand " + brand.id,
                initialPosition,
                type: "custom",
                headerContent: t("delete_brand"),
            });
        },
        [deletePopup, addPopup]
    );

    return onDeleteClick;
};
