import { FormEvent, useCallback, useRef } from "react";
import { ConfirmForm, ModularForm } from "akeyless-client-commons/components";
import { getFormElementValue } from "akeyless-client-commons/helpers";
import { FormElement } from "akeyless-client-commons/types";
import { useTranslation } from "react-i18next";
import { CacheStore, PopupsStore, SettingsStore } from "@/lib/store";
import { CENTER_POPUP_POSITION, PRIMARY_BORDER } from "@/lib";
import {
    addConfiguration,
    SmsConfigurationItem,
    deleteConfiguration,
    updateConfiguration,
    parseConfigurations,
    stringifyConfigurations,
    validateConfiguration,
    ConfigurationModel,
} from "./helpers";
import { ModelsContainer } from "./components";

export const useAddEditConfiguration = () => {
    const { t } = useTranslation();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const smsConfigurationsData = CacheStore.smsConfigurations();
    const direction = SettingsStore.direction();
    const nameValidationError = t("length_error").replace("{entity}", t("name")).replace("{length}", "2");

    const onClick = useCallback(
        (configuration?: SmsConfigurationItem) => {
            const isEdit = !!configuration;
            const headerContent = isEdit ? t("edit_configuration").replace("{configuration}", configuration.name) : t("add_configuration");
            const popupId = isEdit ? "edit_configuration" + configuration.id : "add_configuration";
            const elements: FormElement[] = [
                {
                    type: "input",
                    name: "name",
                    labelContent: t("name"),
                    required: true,
                    minLength: 2,
                    defaultValue: configuration?.name || "",
                    validationError: nameValidationError,
                    placeholder: t("name_placeholder"),
                    containerClassName: "_center w-10/12 gap-2",
                    labelClassName: "w-fit text-lg",
                    validationName: "textNumbers",
                },
                {
                    type: "textarea",
                    name: "configurations_sms",
                    required: true,
                    defaultValue: stringifyConfigurations(configuration?.configurations_sms || []),
                    labelContent: t("configurations_sms"),
                    containerClassName: `w-full `,
                    elementClassName: `${PRIMARY_BORDER} border-2 min-h-32 py-1 `,
                    placeholder: t("configurations_sms_placeholder"),
                },
                {
                    type: "custom",
                    element: <ModelsContainer configurationItem={configuration} />,
                },
            ];
            const submit = async (e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = getFormElementValue(form, "name");
                const models = getFormElementValue(form, "models");
                const smsValue = getFormElementValue(form, "configurations_sms");

                const parsedModels: ConfigurationModel[] = JSON.parse(models);
                const parsedConfiguration = parseConfigurations(smsValue);
                const uniqueModels = Array.from(new Map(parsedModels.map((car) => [`${car.model}-${car.brand}-${car.year}`, car])).values());
                const newData: SmsConfigurationItem = {
                    name,
                    models: uniqueModels,
                    configurations_sms: parsedConfiguration,
                };
                await validateConfiguration({ data: newData, currentConfiguration: configuration, t, smsConfigurationsData });
                if (isEdit) {
                    await updateConfiguration(configuration.id!, newData);
                } else {
                    await addConfiguration(newData);
                }
                deletePopup(popupId);
            };
            const form = (
                <ModularForm
                    direction={direction}
                    buttonContent={t("save")}
                    elements={elements}
                    formClassName="min-w-[800px] flex flex-col items-center justify-center"
                    submitFunction={submit}
                    buttonClassName="bg-[#5f9ea0]"
                />
            );
            addPopup({
                element: form,
                id: popupId,
                type: "custom",
                initialPosition: { top: "60px", left: "60px" },
                headerContent,
            });
        },
        [deletePopup, addPopup, direction, smsConfigurationsData]
    );
    return onClick;
};

export const useDeleteConfiguration = () => {
    const deletePopup = PopupsStore.deletePopup();
    const direction = SettingsStore.direction();
    const addPopup = PopupsStore.addPopup();
    const { t } = useTranslation();

    const onDeleteClick = useCallback(
        (configuration: SmsConfigurationItem) => {
            const onX = async () => {
                deletePopup("delete_configuration " + configuration.id);
            };
            const onV = async () => {
                onX();
                deletePopup("edit_configuration" + configuration.id);
                deleteConfiguration(configuration.id!);
            };

            addPopup({
                element: (
                    <ConfirmForm
                        direction={direction}
                        onV={onV}
                        onX={onX}
                        headline={t("configuration_delete_confirmation").replace("{configuration}", configuration.name)}
                        containerClassName="w-[600px]"
                    />
                ),
                id: "delete_configuration " + configuration.id,
                initialPosition: { top: "60px", left: "60px" },
                type: "custom",
                headerContent: t("delete_configuration").replace("{configuration}", configuration.name),
            });
        },
        [deletePopup, addPopup]
    );

    return onDeleteClick;
};
