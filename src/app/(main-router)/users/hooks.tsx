import { LanguageOptions, NxUser } from "akeyless-types-commons";
import { FormEvent, useCallback } from "react";
import { ConfirmForm } from "akeyless-client-commons/components";
import { useTranslation } from "react-i18next";
import { FormElement } from "akeyless-client-commons/types";
import { CacheStore, PopupsStore, SettingsStore } from "@/lib/store";
import { addUser, onSearchClients, updateUser } from "./helpers";
import { UserWizard } from "./components";
import {
    getFormElementValue,
    international_israel_phone_format,
    isInternational,
    local_israel_phone_format,
    parseMultiSelectInput,
    query_document,
    userNameFormat,
} from "akeyless-client-commons/helpers";
import { PRIMARY_COLOR } from "@/lib";

const initialPosition = { top: "25%", left: "30%" };

export const useAddUser = () => {
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const clients = CacheStore.clients();
    const users = CacheStore.users();
    const { t } = useTranslation();
    const onAddClick = useCallback(async () => {
        const headerContent = "add_user";
        const options = clients.map((client) => ({ value: client.id!, label: client.name!, key: client.key! }));
        const elements: FormElement[] = [
            // first name
            {
                type: "input",
                name: "firstName",
                containerClassName: "_center w-full",
                labelContent: t("first_name"),
                validationName: "textNumbers",
                required: true,
                minLength: 2,
                validationError: t("user_first_name_error"),
                placeholder: t("user_first_name_placeholder"),
            },
            // last name
            {
                type: "input",
                name: "lastName",
                containerClassName: "_center w-full",
                labelContent: t("last_name"),
                validationName: "textNumbers",
                required: true,
                minLength: 2,
                validationError: t("user_last_name_error"),
                placeholder: t("user_last_name_placeholder"),
            },
            // phone number
            {
                type: "internationalPhoneInput",
                required: true,
                name: "phone",
                labelContent: t("phone"),
                labelClassName: "w-[120px]",
                className: "flex-1 flex ",
                inputClassName: "flex-1",
                minLength: 9,
                validationError: t("user_phone_error"),
            },
            // clients
            {
                type: "multiSelect",
                name: "clients",
                labelContent: t("clients"),
                labelClassName: "w-[170px]",
                placeholder: t("clients_placeholder"),
                required: true,
                onSearch: (q) => onSearchClients(q, options),
                minLength: 27,
                validationError: t("user_clients_error"),
                styles: {
                    className: "max-w-80",
                    dropdownClassName: "max-h-44 overflow-y-auto",
                    badgeClassName: "px-1",
                },
                options,
            },
        ];
        const submit = async (e: FormEvent<HTMLFormElement>, features: string[]) => {
            e.preventDefault();
            const form = e.currentTarget;
            const firstName = getFormElementValue(form, "firstName");
            const lastName = getFormElementValue(form, "lastName");
            const phone = getFormElementValue(form, "phone");
            const clientsSelect = getFormElementValue(form, "clients");
            const clientsValue = parseMultiSelectInput(clientsSelect);

            const existUser = users.find((u) => [phone, local_israel_phone_format(phone)].includes(u.phone_number!));
            if (existUser) {
                throw new Error(t("exist_user_error"));
            }

            const newUser = {
                features,
                first_name: firstName,
                last_name: lastName,
                phone_number: phone,
                clients: clientsValue,
            };

            await addUser(newUser);
            deletePopup("add_user");
        };
        const form = <UserWizard elements={elements} submitFunction={submit} />;
        addPopup({ element: form, id: "add_user", type: "custom", initialPosition, headerContent: t(headerContent) });
    }, [addPopup, deletePopup, clients, users]);
    return onAddClick;
};

export const useEditUser = () => {
    const { t } = useTranslation();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const clients = CacheStore.clients();
    const users = CacheStore.users();

    const onEditClick = useCallback(
        (user: NxUser) => {
            const headerContent = "edit_user";
            const userClients = user.clients || [];
            const unremovableClient = clients.find((client) => client.id === userClients[0]);
            const unremovableOptions = unremovableClient ? [{ value: unremovableClient.id!, label: unremovableClient.name! }] : [];
            const options = clients.map((client) => ({ value: client.id!, label: client.name!, key: client.key! }));
            const selectedOptions = clients
                .filter((c) => userClients.includes(c.id!))
                .map((client) => ({ value: client.id!, label: client.name! }))
                .sort((a, b) => userClients.indexOf(a.value) - userClients.indexOf(b.value));

            const elements: FormElement[] = [
                // first name
                {
                    type: "input",
                    name: "firstName",
                    containerClassName: "_center w-full",
                    labelContent: t("first_name"),
                    validationName: "textNumbers",
                    required: true,
                    minLength: 2,
                    defaultValue: user.first_name || "",
                    validationError: t("user_first_name_error"),
                    placeholder: t("user_first_name_placeholder"),
                },
                // last name
                {
                    type: "input",
                    name: "lastName",
                    containerClassName: "_center w-full",
                    labelContent: t("last_name"),
                    validationName: "textNumbers",
                    defaultValue: user.last_name || "",
                    required: true,
                    minLength: 2,
                    validationError: t("user_last_name_error"),
                    placeholder: t("user_last_name_placeholder"),
                },
                // phone number
                {
                    type: "internationalPhoneInput",
                    name: "phone",
                    required: true,
                    labelContent: t("phone"),
                    defaultValue: isInternational(user.phone_number!) ? user.phone_number : international_israel_phone_format(user.phone_number!),
                    labelClassName: "w-[120px]",
                    className: "flex-1 flex ",
                    inputClassName: "flex-1",
                },
                // clients
                {
                    type: "multiSelect",
                    name: "clients",
                    labelContent: t("clients"),
                    labelClassName: "w-[170px]",
                    placeholder: t("clients_placeholder"),
                    required: true,
                    minLength: 27,
                    validationError: t("user_clients_error"),
                    options,
                    selectedOptions,
                    unremovableOptions,
                    onSearch: (q) => onSearchClients(q, options),
                    styles: {
                        className: "max-w-80",
                        dropdownClassName: "max-h-44 overflow-y-auto",
                        badgeClassName: `px-1`,
                    },
                },
            ];
            const submit = async (e: FormEvent<HTMLFormElement>, features: string[]) => {
                e.preventDefault();
                const form = e.currentTarget;
                const firstName = getFormElementValue(form, "firstName");
                const lastName = getFormElementValue(form, "lastName");
                const phone = getFormElementValue(form, "phone");
                const clientsSelect = getFormElementValue(form, "clients");
                const clientsValue = parseMultiSelectInput(clientsSelect);

                const existUser = users.find((u) => [phone, local_israel_phone_format(phone)].includes(u.phone_number!) && u.id !== user.id);
                if (existUser) {
                    throw new Error(t("exist_user_error"));
                }
                const updatedUser = {
                    ...user,
                    features,
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phone,
                    clients: clientsValue,
                };
                console.log("updatedUser", updatedUser);

                await updateUser(user.id!, updatedUser);
                deletePopup(headerContent + user.id);
            };
            const form = <UserWizard elements={elements} submitFunction={submit} user={user} />;
            addPopup({
                element: form,
                id: headerContent + user.id,
                type: "custom",
                initialPosition,
                headerContent: t(headerContent).replace("{name}", userNameFormat(user)),
            });
        },
        [deletePopup, addPopup, clients, users]
    );

    return onEditClick;
};

export const useDeleteUser = () => {
    const deletePopup = PopupsStore.deletePopup();
    const direction = SettingsStore.direction();
    const addPopup = PopupsStore.addPopup();
    const { t } = useTranslation();

    const onDeleteClick = useCallback(
        (user: NxUser) => {
            const onX = async () => {
                deletePopup("delete_user " + user.id);
            };
            const onV = async () => {
                await updateUser(user.id!, { status: "deleted" });
                onX();
            };

            addPopup({
                element: (
                    <ConfirmForm
                        direction={direction}
                        onV={onV}
                        onX={onX}
                        headline={t("client_delete_confirmation").replace("{name}", userNameFormat(user))}
                        containerClassName="w-80"
                    />
                ),
                id: "delete_user " + user.id,
                initialPosition,
                type: "custom",
                headerContent: t("delete_user"),
            });
        },
        [deletePopup, addPopup]
    );

    return onDeleteClick;
};
