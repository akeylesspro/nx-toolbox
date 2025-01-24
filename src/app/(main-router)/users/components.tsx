"use client";
import { NxUser, TObject } from "akeyless-types-commons";
import { useTranslation } from "react-i18next";
import { CacheStore, SettingsStore } from "@/lib/store";
import { Loader, ModularForm, PhoneUI, Table, TableProps } from "akeyless-client-commons/components";
import { Dispatch, FormEvent, memo, RefObject, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormElement } from "akeyless-client-commons/types";
import { Button } from "@/components";
import { FeatureCheckbox, TableButton, TableOptionsWarper } from "@/components/utils";
import { useAddUser, useDeleteUser, useEditUser } from "./hooks";
import { cn } from "@/lib/utils";
import { PRIMARY_COLOR } from "@/lib";
import { get_document_by_id, multiStringFormat, query_document, userNameFormat } from "akeyless-client-commons/helpers";

// users table
interface UsersTableProps {
    data: NxUser[];
}
export const UsersTable = memo(({ data }: UsersTableProps) => {
    const { t } = useTranslation();
    const direction = SettingsStore.direction();
    const isRtl = SettingsStore.isRtl();
    const clientsObject = CacheStore.clientsObject();
    const headers = [t("name"), t("phone_number"), t("main_client"), t("actions")];

    const keysToRender = useMemo(() => ["name_ui", "phone_number_ui", "main_client", "actions"], []);

    const sortKeys = useMemo(() => ["name_ui", "phone_number_ui", "main_client"], []);

    const formattedData = useMemo(() => {
        return data.map((user) => {
            const currentClient = clientsObject[(user.clients || [])[0]];
            return {
                ...user,
                name_ui: userNameFormat(user),
                main_client: multiStringFormat(currentClient?.name || "", "-", currentClient?.key),
                phone_number_ui: <PhoneUI phone={user.phone_number!} direction={direction} />,
                actions: (
                    <TableOptionsWarper>
                        <EditUser user={user} />
                        <DeleteUser user={user} />
                    </TableOptionsWarper>
                ),
            };
        });
    }, [data, isRtl, clientsObject]);

    const tableProps: TableProps = {
        // settings
        includeSearch: true,
        maxRows: 100,
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
        optionalElement: <AddUser />,
    };

    return (
        <div className="p-3">
            <div style={{ direction: direction }} className="w-full h-full _center ">
                {formattedData.length && Object.keys(clientsObject).length ? <Table {...tableProps} /> : <Loader size={200} />}
            </div>
        </div>
    );
});
UsersTable.displayName = "UsersTable";

// CRUD buttons
interface PropsWithUser {
    user: NxUser;
}
const AddUser = () => {
    const { t } = useTranslation();
    const onAddClick = useAddUser();
    return (
        <>
            <TableButton type="add" onClick={onAddClick} title={t("add_user")} />
        </>
    );
};
const EditUser = ({ user }: PropsWithUser) => {
    const onEditClick = useEditUser();
    const { t } = useTranslation();

    return <TableButton type="edit" title={t("edit_user_title")} onClick={() => onEditClick(user)} />;
};
const DeleteUser = ({ user }: PropsWithUser) => {
    const { t } = useTranslation();
    const onDeleteClick = useDeleteUser();
    return <TableButton type="delete" title={t("delete_user")} onClick={() => onDeleteClick(user)} />;
};

// Wizard
interface UserWizardProps {
    user?: NxUser;
    elements: FormElement[];
    submitFunction: (event: React.FormEvent<HTMLFormElement>, features: string[]) => Promise<void>;
}
export const UserWizard = ({ elements, submitFunction, user }: UserWizardProps) => {
    const direction = SettingsStore.direction();
    const { t } = useTranslation();
    const [activeForm, setActiveForm] = useState<"features" | "form">("form");
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(user?.features || []);
    const [isLoading, setIsLoading] = useState(false);
    const submitRef = useRef<HTMLButtonElement>(null);

    const submit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            setIsLoading(true);
            try {
                await submitFunction(e, selectedFeatures);
            } catch (error) {
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [selectedFeatures]
    );

    return (
        <div className="flex flex-col min-w-[700px] p-3 ">
            <WizardHeader activeForm={activeForm} setActiveForm={setActiveForm} />
            <div className="min-h-[400px] _center">
                <ModularForm
                    submitRef={submitRef}
                    direction={direction}
                    formClassName={`w-8/12 h-full ${activeForm === "features" ? "hidden" : "flex"}`}
                    elements={elements}
                    submitFunction={submit}
                    buttonClassName="hidden"
                    buttonContent={""}
                />
                <FeaturesForm
                    display={activeForm === "features" ? "flex" : "none"}
                    selectedFeatures={selectedFeatures}
                    setSelectedFeatures={setSelectedFeatures}
                    user={user}
                />
            </div>
            <WizardFooter submitRef={submitRef} isLoading={isLoading} />
        </div>
    );
};

interface WizardHeaderProps {
    activeForm: "features" | "form";
    setActiveForm: Dispatch<SetStateAction<"features" | "form">>;
}
export const WizardHeader = memo(({ activeForm, setActiveForm }: WizardHeaderProps) => {
    const { t } = useTranslation();
    return (
        <div className=" w-full px-2 flex items-center justify-start gap-2 h-8  ">
            <button
                onClick={() => setActiveForm("form")}
                className={` ${activeForm === "form" ? `text-[${PRIMARY_COLOR}]` : "text-[#00000076]"} font-bold text-[16px]`}
            >
                {t("user_details")}
            </button>
            <div className="h-6 bg-[#00000076] w-[1px]"></div>
            <button
                onClick={() => setActiveForm("features")}
                className={` ${activeForm === "features" ? `text-[${PRIMARY_COLOR}]` : "text-[#00000076]"} font-bold text-[16px]`}
            >
                {t("features")}
            </button>
        </div>
    );
});
WizardHeader.displayName = "WizardHeader";

interface WizardFooterProps {
    isLoading: boolean;
    submitRef: RefObject<HTMLButtonElement>;
}
export const WizardFooter = memo(({ submitRef, isLoading }: WizardFooterProps) => {
    const { t } = useTranslation();
    return (
        <div className="h-10 w-full flex justify-end items-center px-2">
            <Button disabled={isLoading} onClick={() => submitRef.current?.click()}>
                {isLoading ? <Loader size={20} color="#fff" /> : t("save")}
            </Button>
        </div>
    );
});
WizardFooter.displayName = "WizardFooter";

// features form
interface FeaturesFormProps {
    display: string | undefined;
    setSelectedFeatures: React.Dispatch<React.SetStateAction<string[]>>;
    selectedFeatures: string[];
    user: NxUser | undefined;
}
export const FeaturesForm = memo(
    ({ display, setSelectedFeatures, selectedFeatures, user }: FeaturesFormProps) => {
        const allFeatures = CacheStore.features();
        const displayFeatures = useMemo(() => {
            const data = { ...allFeatures };
            delete data["client"];
            const result: TObject<string[]> = {};
            Object.entries(data).forEach(([key, value]) => {
                let features: string[] = [];
                value.forEach((feature: string) => {
                    features.push(`${key}__${feature}`);
                });
                result[key] = features;
            });
            return result;
        }, [allFeatures]);

        const onChecked = useCallback(
            (feature: string) => {
                setSelectedFeatures((prev) => {
                    if (prev.includes(feature)) {
                        return prev.filter((v) => v !== feature);
                    }
                    return [...prev, feature];
                });
            },
            [setSelectedFeatures]
        );

        return (
            <div style={{ display: display }} className="justify-evenly overflow-auto h-[320px] w-full">
                {user && (
                    <CheckBoxGroup
                        entity="dashboard"
                        features={displayFeatures}
                        onChecked={onChecked}
                        selectedFeatures={selectedFeatures}
                        user={user}
                    />
                )}
                <CheckBoxGroup entity="installer" features={displayFeatures} onChecked={onChecked} selectedFeatures={selectedFeatures} user={user} />
                <CheckBoxGroup entity="toolbox" features={displayFeatures} onChecked={onChecked} selectedFeatures={selectedFeatures} user={user} />
                <CheckBoxGroup entity="reports" features={displayFeatures} onChecked={onChecked} selectedFeatures={selectedFeatures} user={user} />
            </div>
        );
    },
    (prev, next) => {
        return JSON.stringify(prev) === JSON.stringify(next);
    }
);
FeaturesForm.displayName = "FeaturesForm";

interface CheckBoxGroupProps {
    features: TObject<string[]>;
    onChecked: (name: string) => void;
    selectedFeatures: string[];
    entity: string;
    user?: NxUser | undefined;
}
export const CheckBoxGroup = ({ features, onChecked, selectedFeatures, entity, user }: CheckBoxGroupProps) => {
    const { t } = useTranslation();
    const isDashboard = entity === "dashboard";
    const entityTranslation = CacheStore.getFeaturesTranslation()(entity);
    const clientsObject = CacheStore.clientsObject();
    const [title, setTitle] = useState("");
    useEffect(() => {
        if (user && user.site && isDashboard) {
            get_document_by_id("nx-sites", user.site)
                .then((site) => {
                    const client = clientsObject[site.client];
                    setTitle(multiStringFormat(site.name || "", "-", client?.name));
                })
                .catch((error) => {
                    console.error("error from getting user site: ", error);
                });
        }
    }, []);
    return (
        <div className="flex flex-col gap-4 relative">
            <div className={`w-full text-start border-b-[2px] border-[${PRIMARY_COLOR}] px-1 sticky top-0 bg-white`}>
                {t("checkbox_group_headline").replace("{name}", t(entity))}
            </div>
            <div>
                {features[entity].map((feature) => {
                    const featureName = entityTranslation[feature];

                    return (
                        <FeatureCheckbox
                            featureName={featureName}
                            defaultCheck={selectedFeatures.includes(feature)}
                            feature={feature}
                            onChecked={onChecked}
                            key={feature}
                            disabled={isDashboard}
                            title={title}
                        />
                    );
                })}
            </div>
        </div>
    );
};
