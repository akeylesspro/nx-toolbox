import { LanguageOptions } from "akeyless-types-commons";
import { FormEvent, useCallback, useRef } from "react";
import { ConfirmForm, ModularForm } from "akeyless-client-commons/components";
import { getFormElementValue } from "akeyless-client-commons/helpers";
import { FormElement } from "akeyless-client-commons/types";
import { useTranslation } from "react-i18next";
import { CacheStore, PopupsStore, SettingsStore } from "@/lib/store";
import { addBrand, BrandItem, parseAliases, parseName, updateBrand, validateBrand } from "./helpers";
import { ModelsContainer, ModelsContainerRef } from "./components";
import { PRIMARY_BORDER } from "@/lib";

const initialPosition = { top: "25%", left: "30%" };

export const useAddBrand = () => {
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const deletePopupsGroup = PopupsStore.deletePopupsGroup();
    const { t } = useTranslation();
    const direction = SettingsStore.direction();
    const carCatalog = CacheStore.carCatalog();

    const modelsRef = useRef<ModelsContainerRef>({ updatedModels: [] });
    const brandValidationError = t("length_error").replace("{entity}", t("brand")).replace("{length}", "2");
    const onAddClick = useCallback(async () => {
        const headerContent = "add_brand";
        const elements: FormElement[] = [
            {
                type: "input",
                name: "brand",
                required: true,
                labelContent: t("brand"),
                minLength: 2,
                validationError: brandValidationError,
                placeholder: t("brand_placeholder"),
                containerClassName: "_center w-10/12 gap-2",
                labelClassName: "w-fit text-lg",
                validationName: "charts",
            },
            {
                type: "textarea",
                name: "aliases",
                labelContent: t("aliases"),
                containerClassName: `w-full`,
                elementClassName: `${PRIMARY_BORDER} border-2`,
                placeholder: t("aliases_placeholder").replace("{entity}", t("brand")),
            },
            { type: "custom", element: <ModelsContainer ref={modelsRef} /> },
        ];
        const submit = async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = e.currentTarget;
            const brand = getFormElementValue(form, "brand");
            const aliases = getFormElementValue(form, "aliases");
            const parsedBrand = parseName(brand);
            const parsedAliases = parseAliases(aliases);
            const models = modelsRef.current?.updatedModels;
            await validateBrand({ brand, brandValidationError, carCatalog, t, models });

            const newBrand = {
                brand: parsedBrand,
                aliases: parsedAliases,
                models,
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
            id: "add_brand",
            type: "custom",
            initialPosition,
            headerContent: t(headerContent),
        });
    }, [addPopup, deletePopup, carCatalog, modelsRef]);
    return onAddClick;
};

export const useEditBrand = () => {
    const { t } = useTranslation();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const deletePopupsGroup = PopupsStore.deletePopupsGroup();
    const direction = SettingsStore.direction();
    const modelsRef = useRef<ModelsContainerRef>({ updatedModels: [] });
    const brandValidationError = t("length_error").replace("{entity}", t("brand")).replace("{length}", "2");
    const carCatalog = CacheStore.carCatalog();

    const onEditClick = useCallback(
        (brand: BrandItem) => {
            const headerContent = t("edit_brand").replace("{brand}", brand.brand!);
            const elements: FormElement[] = [
                {
                    type: "input",
                    name: "brand",
                    required: true,
                    labelContent: t("brand"),
                    containerClassName: "_center w-10/12 gap-2",
                    labelClassName: "w-fit text-lg",
                    minLength: 2,
                    validationError: brandValidationError,
                    props: { title: brand.brand },
                    placeholder: t("brand_placeholder"),
                    defaultValue: brand.brand,
                    validationName: "charts",
                },
                {
                    type: "textarea",
                    name: "aliases",
                    labelContent: t("aliases"),
                    containerClassName: `w-full ${PRIMARY_BORDER}`,
                    elementClassName: `${PRIMARY_BORDER} border-2 `,
                    placeholder: t("aliases_placeholder").replace("{entity}", t("brand")),
                    props: { title: brand.aliases.join(", ") },
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
                const models = modelsRef.current?.updatedModels;

                await validateBrand({ brand: brandInput, brandValidationError, carCatalog, t, models, brandId: brand.id });
                const updatedBrand = {
                    brand: parsedBrand,
                    aliases: parsedAliases,
                    models,
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
        [deletePopup, addPopup, carCatalog, modelsRef]
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
                        headline={t("brand_delete_confirmation").replace("{name}", brand.brand)}
                        containerClassName="w-80"
                    />
                ),
                id: "delete_brand " + brand.id,
                initialPosition,
                type: "custom",
                headerContent: t("delete_brand").replace("{brand}", brand.brand),
            });
        },
        [deletePopup, addPopup]
    );

    return onDeleteClick;
};
