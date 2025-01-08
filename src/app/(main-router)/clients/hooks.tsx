import { Client, ClientStatus, LanguageOptions } from "akeyless-types-commons";
import { FormEvent, useCallback } from "react";
import { ConfirmForm } from "akeyless-client-commons/components";
import { useTranslation } from "react-i18next";
import { FormElement } from "akeyless-client-commons/types";
import { PopupsStore, SettingsStore } from "@/lib/store";
import { addClient, updateClient } from "./helpers";
import { ClientWizard } from "./components";

const initialPosition = { top: "25%", left: "30%" };

export const useAddClient = () => {
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const { t } = useTranslation();
    const onAddClick = useCallback(async () => {
        const headerContent = "add_client";
        const elements: FormElement[] = [
            // status
            {
                type: "select",
                name: "status",
                labelContent: t("status"),
                containerClassName: "_center w-full",
                required: true,
                options: [
                    { value: ClientStatus.Active, label: t("active") },
                    { value: ClientStatus.Suspended, label: t("suspended") },
                ],
                optionsContainerClassName: "max-h-80",
            },
            // name
            {
                type: "input",
                name: "name",
                containerClassName: "_center w-full",
                labelContent: t("name"),
                validationName: "textNumbers",
                required: true,
                minLength: 4,
                validationError: t("client_name_error"),
                placeholder: t("client_name_placeholder"),
            },
            // key
            {
                type: "input",
                name: "key",
                containerClassName: "_center w-full",
                labelContent: t("key"),
                validationName: "textNumbers",
                required: true,
                minLength: 4,
                validationError: t("client_key_error"),
                placeholder: t("client_key_placeholder"),
            },
            // language
            {
                type: "select",
                name: "language",
                labelContent: t("language"),
                containerClassName: "_center w-full",
                options: [
                    { value: LanguageOptions.He, label: t("hebrew") },
                    { value: LanguageOptions.En, label: t("english") },
                ],
                optionsContainerClassName: "max-h-80",
            },
            // api_token
            {
                type: "input",
                name: "api_token",
                containerClassName: "_center w-full",
                labelContent: t("api_token"),
                validationName: "textNumbers",
                placeholder: t("client_api_token_placeholder"),
            },
            // installation_name
            {
                type: "input",
                name: "installation_name",
                containerClassName: "_center w-full",
                labelContent: t("installation_name"),
                validationName: "textNumbers",
                placeholder: t("client_installation_name_placeholder"),
            },
            // installation_phone
            {
                type: "input",
                name: "installation_number",
                containerClassName: "_center w-full",
                labelContent: t("installation_number"),
                validationName: "textNumbers",
                placeholder: t("client_installation_number_placeholder"),
            },
        ];
        const submit = async (e: FormEvent<HTMLFormElement>, features: string[]) => {
            e.preventDefault();
            const form = e.currentTarget;
            const name = (form.elements.namedItem("name") as HTMLInputElement)?.value || "";
            const api_token = (form.elements.namedItem("api_token") as HTMLInputElement)?.value || "";
            const status = (form.elements.namedItem("status") as HTMLInputElement)?.value || "";
            const language = (form.elements.namedItem("language") as HTMLInputElement)?.value || "";
            const key = (form.elements.namedItem("key") as HTMLInputElement)?.value || "";
            const installation_name = (form.elements.namedItem("installation_name") as HTMLInputElement)?.value || "";
            const installation_phone = (form.elements.namedItem("installation_phone") as HTMLInputElement)?.value || "";
            const newClient = {
                name,
                status,
                api_token,
                key,
                language,
                features,
                installation_name,
                installation_phone,
            };
            await addClient(newClient, t);
            deletePopup("add_client");
        };
        const form = <ClientWizard elements={elements} submitFunction={submit} />;
        addPopup({ element: form, id: "add_client", type: "custom", initialPosition, headerContent: t(headerContent) });
    }, [addPopup, deletePopup]);
    return onAddClick;
};

export const useEditClient = () => {
    const { t } = useTranslation();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();

    const onEditClick = useCallback(
        (client: Client) => {
            const headerContent = "edit_client";
            const elements: FormElement[] = [
                // status
                {
                    type: "select",
                    name: "status",
                    labelContent: t("status"),
                    containerClassName: "_center w-full",
                    defaultValue: client.status,
                    required: true,
                    options: [
                        { value: ClientStatus.Active, label: t("active") },
                        { value: ClientStatus.Suspended, label: t("suspended") },
                    ],
                    optionsContainerClassName: "max-h-80",
                },
                // name
                {
                    type: "input",
                    name: "name",
                    defaultValue: client.name || "",
                    containerClassName: "_center w-full",
                    labelContent: t("name"),
                    validationName: "textNumbers",
                    required: true,
                    minLength: 4,
                    validationError: t("client_name_error"),
                    placeholder: t("client_name_placeholder"),
                },
                // key
                {
                    type: "input",
                    name: "key",
                    defaultValue: client.key || "",
                    containerClassName: "_center w-full",
                    labelContent: t("key"),
                    validationName: "textNumbers",
                    required: true,
                    minLength: 4,
                    validationError: t("client_key_error"),
                    placeholder: t("client_key_placeholder"),
                },
                // language
                {
                    type: "select",
                    name: "language",
                    defaultValue: client.language || LanguageOptions.He,
                    labelContent: t("language"),
                    containerClassName: "_center w-full",
                    options: [
                        { value: LanguageOptions.He, label: t("hebrew") },
                        { value: LanguageOptions.En, label: t("english") },
                    ],
                    optionsContainerClassName: "max-h-80",
                },
                // api_token
                {
                    type: "input",
                    name: "api_token",
                    defaultValue: client.api_token || "",
                    containerClassName: "_center w-full",
                    labelContent: t("api_token"),
                    validationName: "textNumbers",
                    placeholder: t("client_api_token_placeholder"),
                },
                // installation_name
                {
                    type: "input",
                    name: "installation_name",
                    defaultValue: client.installation_name || "",
                    containerClassName: "_center w-full",
                    labelContent: t("installation_name"),
                    validationName: "textNumbers",
                    placeholder: t("client_installation_name_placeholder"),
                },
                // installation_phone
                {
                    type: "input",
                    name: "installation_number",
                    defaultValue: client.installation_phone || "",
                    containerClassName: "_center w-full",
                    labelContent: t("installation_number"),
                    validationName: "textNumbers",
                    placeholder: t("client_installation_number_placeholder"),
                },
            ];
            const submit = async (e: FormEvent<HTMLFormElement>, features: string[]) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem("name") as HTMLInputElement)?.value || "";
                const api_token = (form.elements.namedItem("api_token") as HTMLInputElement)?.value || "";
                const status = (form.elements.namedItem("status") as HTMLInputElement)?.value || "";
                const language = (form.elements.namedItem("language") as HTMLInputElement)?.value || "";
                const key = (form.elements.namedItem("key") as HTMLInputElement)?.value || "";
                const installation_name = (form.elements.namedItem("installation_name") as HTMLInputElement)?.value || "";
                const installation_phone = (form.elements.namedItem("installation_phone") as HTMLInputElement)?.value || "";
                const updatedClient = {
                    name,
                    status,
                    api_token,
                    key,
                    language,
                    features,
                    installation_name,
                    installation_phone,
                };
                await updateClient(client.id!, updatedClient);
                deletePopup("edit_client" + client.id);
            };
            const form = <ClientWizard elements={elements} submitFunction={submit} client={client} />;
            addPopup({
                element: form,
                id: "edit_client" + client.id,
                type: "custom",
                initialPosition,
                headerContent: t(headerContent).replace("{name}", client.name!),
            });
        },
        [deletePopup, addPopup]
    );

    return onEditClick;
};

export const useDeleteClient = () => {
    const deletePopup = PopupsStore.deletePopup();
    const direction = SettingsStore.direction();
    const addPopup = PopupsStore.addPopup();
    const { t } = useTranslation();

    const onDeleteClick = useCallback(
        (client: Client) => {
            const onX = async () => {
                deletePopup("delete_client " + client.id);
            };
            const onV = async () => {
                await updateClient(client.id!, { status: ClientStatus.Deleted });
                onX();
            };

            addPopup({
                element: (
                    <ConfirmForm
                        direction={direction}
                        onV={onV}
                        onX={onX}
                        headline={t("client_delete_confirmation").replace("{name}", client.name!)}
                        containerClassName="w-80 flex flex-col gap-4"
                        buttonsContainerClassName="_center gap-4"
                    />
                ),
                id: "delete_client " + client.id,
                initialPosition,
                type: "custom",
                headerContent: t("delete_client"),
            });
        },
        [deletePopup, addPopup]
    );

    return onDeleteClick;
};
