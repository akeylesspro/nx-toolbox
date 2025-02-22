import { cn } from "@/lib";
import { SettingsStore } from "@/lib/store";
import { Table, TimesUI, BooleanUi } from "akeyless-client-commons/components";
import { TableProps } from "akeyless-client-commons/components";
import { TObject } from "akeyless-types-commons";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

export const NotActiveTable = memo(({ data }: { data: TObject<any>[] }) => {
    const { t } = useTranslation();
    const direction = SettingsStore.direction();
    const isRtl = SettingsStore.isRtl();
    const headers = useMemo(
        () => [t("car_number"), t("board_provider"), t("on_akeyless_server"), t("events_time"), t("location_time")],
        [direction, t]
    );

    const keysToRender = useMemo(() => ["car_number", "board_provider", "on_akeyless_server_ui", "event_time", "location_time"], []);

    const sortKeys = useMemo(() => ["car_number", "board_provider", "on_akeyless_server", "event_sort", "location_sort"], []);

    const filterableColumns = [
        { header: t("board_provider"), dataKey: "board_provider" },
        { header: t("on_akeyless_server"), dataKey: "on_akeyless_server", ui: (value: any) => <BooleanUi value={value} size="small" /> },
    ];

    const formattedData = useMemo(() => {
        return data.map((val) => {
            return {
                ...val,
                event_time: <TimesUI timestamp={val.last_event} />,
                location_time: <TimesUI timestamp={val.last_location} />,
                on_akeyless_server_ui: <BooleanUi value={val.on_akeyless_server} />,
                event_sort: val.last_event?.seconds_passed || 0,
                location_sort: val.last_location?.seconds_passed || 0,
            };
        });
    }, [data, direction]);

    const tableProps: TableProps = useMemo(() => {
        return {
            // settings
            includeSearch: true,
            // maxRows: 100,
            // data
            data: formattedData,
            direction: direction,
            headers: headers,
            keysToRender: keysToRender,
            sortKeys: sortKeys,
            // styles
            headerStyle: { backgroundColor: "cadetblue", height: "40px", fontSize: "18px" },
            containerHeaderClassName: "h-12 justify-between",
            containerClassName: "_full p-3",
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
            filterableColumns,
        };
    }, [formattedData, direction, isRtl, headers]);

    return <Table {...tableProps} />;
});
NotActiveTable.displayName = "NotActiveTable";
