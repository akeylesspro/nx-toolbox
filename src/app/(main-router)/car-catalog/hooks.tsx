import { LanguageOptions } from "akeyless-types-commons";
import { FormEvent, useCallback } from "react";
import { ConfirmForm, ModularForm } from "akeyless-client-commons/components";
import { getFormElementValue } from "akeyless-client-commons/helpers";
import { FormElement } from "akeyless-client-commons/types";
import { useTranslation } from "react-i18next";
import { PopupsStore, SettingsStore } from "@/lib/store";
import { addBrand, BrandItem, updateBrand } from "./helpers";

const initialPosition = { top: "25%", left: "30%" };

export const useAddBrand = () => {
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
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
            { type: "input", name: "models", labelContent: t("models"), containerClassName: "_center w-full", validationName: "charts" },
        ];
        const submit = async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = e.currentTarget;
            const brand = getFormElementValue(form, "brand");
            const aliases = getFormElementValue(form, "aliases");
            const models = getFormElementValue(form, "models");

            const parseBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
            const parsedAliases = aliases.split(",").map((alias) => alias.trim());
            const parsedModels = models.split(",").map((model) => model.trim());
            const newBrand = {
                brand: parseBrand,
                aliases: parsedAliases,
                models: parsedModels,
            };
            console.log(newBrand, "newBrand");
            // await addBrand(newBrand, t);
            deletePopup("add_brand");
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
        addPopup({ element: form, id: "add_brand", type: "custom", initialPosition, headerContent: t(headerContent) });
    }, [addPopup, deletePopup]);
    return onAddClick;
};

export const useEditBrand = () => {
    const { t } = useTranslation();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();

    const onEditClick = useCallback(
        (brand: BrandItem) => {
            const headerContent = t("edit_brand").replace("{brand}", brand.brand!);
            const elements: FormElement[] = [];
            const submit = async (e: FormEvent<HTMLFormElement>, features: string[]) => {
                e.preventDefault();
                const form = e.currentTarget;
                const brandInput = getFormElementValue(form, "brand");
                const aliases = getFormElementValue(form, "aliases");
                const models = getFormElementValue(form, "models");
                const modelAliases = getFormElementValue(form, "modelAliases");

                const updatedBrand = {
                    brand: brandInput,
                    aliases,
                    modelAliases,
                    models,
                };
                await updateBrand(brand.id!, updatedBrand);
                deletePopup("edit_brand" + brand.id);
            };
            const form = <></>;
            addPopup({
                element: form,
                id: "edit_brand" + brand.id,
                type: "custom",
                initialPosition,
                headerContent,
            });
        },
        [deletePopup, addPopup]
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
