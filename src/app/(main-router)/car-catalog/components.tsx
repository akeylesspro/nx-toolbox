"use brand";
import { useTranslation } from "react-i18next";
import { SettingsStore, UserStore } from "@/lib/store";
import { Loader, Table, TableButton, TableProps, TimesUI } from "akeyless-client-commons/components";
import { memo, useMemo } from "react";
import { useAddBrand, useDeleteBrand, useEditBrand } from "./hooks";
import { Timestamp } from "firebase/firestore";
import { timestamp_to_string } from "akeyless-client-commons/helpers";
import { BrandItem } from "./helpers";
import { TableOptionsWarper } from "@/components/utils";

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
