import { SettingsStore } from "@/lib/store";
import { Table } from "akeyless-client-commons/components";
import { TableProps } from "akeyless-client-commons/types";
import { TObject } from "akeyless-types-commons";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

export const NotActiveTable = memo(({ data }: { data: TObject<any>[] }) => {
    const { t } = useTranslation();
    const direction = SettingsStore.direction();
    const isRtl = SettingsStore.isRtl();
    const headers = useMemo(
        () => [t("car_number"), t("board_provider"), t("deactivated"), t("on_akeyless_server"), t("state_time"), t("event_time"), t("location_time")],
        [direction]
    );

    const keysToRender = useMemo(
        () => ["car_number", "board_provider", "deactivated_ui", "on_akeyless_server_ui", "state_time", "event_time", "location_time"],
        []
    );

    const sortKeys = useMemo(
        () => ["car_number", "board_provider", "deactivated", "on_akeyless_server", "state_sort", "event_sort", "location_sort"],
        []
    );

    const formattedData = useMemo(() => {
        return data.map((val) => {
            return {
                ...val,
                state_time: <TimeUi time={val.erm_state} />,
                event_time: <TimeUi time={val.last_event} />,
                location_time: <TimeUi time={val.last_location} />,
                deactivated_ui: <TrueFalseIcon value={val.deactivated} />,
                on_akeyless_server_ui: <TrueFalseIcon value={val.on_akeyless_server} />,
                state_sort: val.erm_state?.short || "",
                event_sort: val.erm_state?.short || "",
                location_sort: val.erm_state?.short || "",
            };
        });
    }, [data, direction]);

    const tableProps: TableProps = useMemo(() => {
        return {
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
            containerClassName: "_full p-3",
            cellClassName: "_ellipsis text-start h-10 px-3",
            tableContainerClass: "flex-1",
            searchInputClassName: "h-10 w-1/4",
            // labels
            searchPlaceHolder: t("search"),
            filterLabel: t("filter_by"),
            sortLabel: t("sort_by"),
            maxRowsLabel1: t("maxRowsLabel1"),
            maxRowsLabel2: t("maxRowsLabel2"),
            // optionalElement: <AddBoard />,
        };
    }, [formattedData, direction, isRtl]);

    return <Table {...tableProps} />;
});
NotActiveTable.displayName = "NotActiveTable";

const TrueFalseIcon = ({ value }: { value: boolean }) => {
    const className = value ? "fa-light fa-check text-green-500" : "fa-light fa-xmark text-red-500";
    return <i className={`${className} text-2xl`}></i>;
};

const TimeUi = ({ time }: { time: { short: string; long: string } | null }) => {
    const isRtl = SettingsStore.isRtl();
    const { t } = useTranslation();
    const formattedValue = (time?.long || "")
        .replace("d", t("days"))
        .replace("h", t("hours"))
        .replace("min", t("minutes"))
        .replace("sec", t("seconds"));
    return (
        <div title={formattedValue} className={`w-full ${isRtl ? "text-end" : "text-start"}`} style={{ direction: "ltr" }}>
            {time?.short || <TrueFalseIcon value={false} />}
        </div>
    );
};
