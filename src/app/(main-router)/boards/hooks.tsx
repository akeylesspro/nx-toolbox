import { delete_document, fire_base_TIME_TEMP, getFormElementValue, is_iccid, userNameFormat } from "akeyless-client-commons/helpers";
import { Board, BoardStatus, TObject } from "akeyless-types-commons";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import QRCodeGenerator from "qrcode";
import { ModularForm, ConfirmForm } from "akeyless-client-commons/components";
import { useTranslation } from "react-i18next";
import { FormElement } from "akeyless-client-commons/types";
import { CacheStore, PopupsStore, SettingsStore, UserStore } from "@/lib/store";
import { addBoardDB, onImeiInputKeyDown, onSimInputKeyDown, updateBoardDB, validateBoardImei, validateBoardPhoneAndStatus } from "./helpers";
import { PrintableContent } from "./components";

const initialPosition = { top: "25%", left: "30%" };

export const usePrintQR = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [boardState, setBoardState] = useState<Board | null>(null);
    const [imgData, setImgData] = useState<string>("");
    const handlePrint = useReactToPrint({
        contentRef: containerRef,
        bodyClass: "h-screen",
    });

    const generateQRCodeImage = useCallback(async (board: Board, isCamera: boolean) => {
        const canvas = document.createElement("canvas");
        let qrContent = board.imei;

        if (isCamera) {
            const token = board.token || [...board.id].reverse().join("");
            if (!board.token) {
                await updateBoardDB(board.id, { token });
            }
            qrContent = `https://installerapp.online/camera_installation/${token}`;
        }

        await new Promise<void>((resolve, reject) => {
            QRCodeGenerator.toCanvas(canvas, qrContent, { width: 350 }, (error) => {
                if (error) {
                    console.error("error from generateQRCodeImage", error);
                    return reject(error);
                }
                const data = canvas.toDataURL("image/png");
                setImgData(data);
                setBoardState(board);
                resolve();
            });
        });
    }, []);

    const onPrintClick = useCallback(
        async (board: Board, isCamera: boolean) => {
            await generateQRCodeImage(board, isCamera);
            handlePrint();
        },
        [generateQRCodeImage, handlePrint]
    );

    return { onPrintClick, PrintableContent: () => <PrintableContent boardState={boardState} imgData={imgData || null} ref={containerRef} /> };
};

export const useAddBoard = () => {
    const activeUser = UserStore.activeUser();
    const direction = SettingsStore.direction();
    const boardTypes = CacheStore.boardTypes();
    const cameraBoardTypes = CacheStore.cameraBoardTypes();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const { t } = useTranslation();
    const { onPrintClick, PrintableContent } = usePrintQR();
    const onAddClick = useCallback(async () => {
        const headerContent = "add_board";
        const elements: FormElement[] = [
            // type
            {
                type: "select",
                name: "type",
                labelContent: t("type"),
                elementClassName: "h-6 ",
                required: true,
                containerClassName: "_center w-full",
                options: boardTypes.map((bt) => ({ value: bt, label: bt })),
                optionsContainerClassName: "max-h-80",
            },
            // imei
            {
                type: "input",
                name: "imei",
                required: true,
                validationError: t("imei_error_board"),
                containerClassName: "_center w-full",
                onKeyDown: onImeiInputKeyDown,
                labelContent: t("imei"),
                validationName: "numbers",
            },
            // sim
            {
                type: "input",
                name: "sim",
                required: true,
                validationError: t("sim_error_board"),
                containerClassName: "_center w-full",
                onKeyDown: onSimInputKeyDown,
                labelContent: t("sim"),
                validationName: "numbers",
            },
            // comments
            {
                type: "input",
                name: "comments",
                containerClassName: "_center w-full",
                labelContent: t("comments"),
                validationName: "textNumbers",
            },
        ];
        const submit = async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = e.currentTarget;

            const sim = getFormElementValue(form, "sim");
            const type = getFormElementValue(form, "type");
            const comments = getFormElementValue(form, "comments");
            let imei = getFormElementValue(form, "imei");

            const match = imei.match(/\b\d{15,17}\b/);
            if (imei.length < 15 || !match) {
                throw new Error(t("imei_error_board"));
            }
            imei = match[0];
            (form.elements.namedItem("imei") as HTMLInputElement).value = match[0];
            if (sim.length !== 10 && !is_iccid(sim)) {
                throw new Error(t("sim_error_board"));
            }
            const data = {
                imei,
                sim,
                type,
                comments,
                uploaded: fire_base_TIME_TEMP(),
                update: fire_base_TIME_TEMP(),
                status: BoardStatus["ReadyForInstallation"],
                mac: "",
                swVer: "",
                installedDate: "",
                userId: userNameFormat(activeUser!),
            };

            await validateBoardImei(data, t);
            await validateBoardPhoneAndStatus(data, t);
            const update = await addBoardDB(data);
            if (!update) {
                throw new Error(t("update_board_error"));
            }

            const onX = async () => {
                deletePopup("print_confirmation");
            };
            const onV = async () => {
                await onPrintClick(update as Board, cameraBoardTypes.includes(type));
                onX();
            };
            addPopup({
                element: (
                    <ConfirmForm
                        direction={direction}
                        onV={onV}
                        onX={onX}
                        headline={t("print_confirmation").replace("{imei}", update.imei)}
                        containerClassName="w-80 flex flex-col gap-4"
                        buttonsContainerClassName="_center gap-4"
                    />
                ),
                id: "print_confirmation",
                type: "custom",
            });
            deletePopup("add_board");
        };
        const form = (
            <ModularForm
                direction={direction}
                buttonContent={t("save")}
                elements={elements}
                buttonClassName="_center pb-2 bg-[#5f9ea0]"
                formClassName="min-w-[400px]"
                submitFunction={submit}
            />
        );
        addPopup({ element: form, id: "add_board", type: "custom", initialPosition, headerContent: t(headerContent) });
    }, [activeUser, boardTypes, cameraBoardTypes, addPopup, deletePopup]);
    return { onAddClick, PrintableContent };
};

export const useEditBoard = () => {
    const { t } = useTranslation();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const boardTypes = CacheStore.boardTypes();
    const direction = SettingsStore.direction();

    const onEditClick = useCallback(
        (board: Board) => {
            const header_content = "edit_board";
            const elements: FormElement[] = [
                {
                    type: "select",
                    name: "status",
                    required: true,
                    containerClassName: "_center w-full",
                    labelContent: t("status"),
                    defaultValue: board.status,
                    options: [
                        { value: BoardStatus["ReadyForInstallation"], label: t(BoardStatus[1]) },
                        { value: BoardStatus["Installed"], label: t(BoardStatus[2]) },
                        { value: BoardStatus["Malfunction"], label: t(BoardStatus[3]) },
                        { value: BoardStatus["NoSim"], label: t(BoardStatus[4]) },
                    ],
                },
                {
                    type: "select",
                    name: "type",
                    required: true,
                    containerClassName: "_center w-full",
                    labelContent: t("type"),
                    defaultValue: board.type,
                    options: boardTypes.map((bt) => ({ value: bt, label: bt })),
                    optionsContainerClassName: "max-h-80",
                },
                {
                    type: "input",
                    name: "sim",
                    required: true,
                    containerClassName: "_center w-full",
                    onKeyDown: onSimInputKeyDown,
                    labelContent: t("sim"),
                    defaultValue: board.sim || "",
                    validationName: "numbers",
                    validationError: t("sim_error_board"),
                },
                {
                    type: "input",
                    name: "comments",
                    containerClassName: "_center w-full",
                    labelContent: t("comments"),
                    defaultValue: board.comments || "",
                    validationName: "textNumbers",
                },
            ];

            const submit = async (e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = e.currentTarget;
                const sim = getFormElementValue(form, "sim");
                const type = getFormElementValue(form, "type");
                const comments = getFormElementValue(form, "comments");
                const status = Number(getFormElementValue(form, "status"));

                if (sim.length !== 10 && status !== BoardStatus["Malfunction"] && status !== BoardStatus["NoSim"]) {
                    throw new Error(t("sim_error_camera_board"));
                }

                await validateBoardPhoneAndStatus({ sim, comments, status }, t, board);
                const update = { sim: status === BoardStatus["NoSim"] ? "" : sim, comments, status, type };
                await updateBoardDB(board.id, update);
                deletePopup("edit_board " + board.imei);
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
                element: form,
                id: "edit_board " + board.imei,
                type: "custom",
                initialPosition,
                headerContent: (
                    <>
                        {t(header_content)} - {board.imei}
                    </>
                ),
            });
        },
        [deletePopup, addPopup, boardTypes]
    );

    return onEditClick;
};

export const useDeleteBoard = () => {
    const deletePopup = PopupsStore.deletePopup();
    const direction = SettingsStore.direction();
    const addPopup = PopupsStore.addPopup();
    const { t } = useTranslation();

    const onDeleteClick = useCallback(
        (board: Board) => {
            const onX = async () => {
                deletePopup("delete_board " + board.imei);
            };
            const onV = async () => {
                await delete_document("boards", board.id);
                onX();
            };

            addPopup({
                element: (
                    <ConfirmForm
                        direction={direction}
                        onV={onV}
                        onX={onX}
                        headline={t("board_delete_confirmation").replace("{imei}", board.imei)}
                        containerClassName="w-80 flex flex-col gap-4"
                        buttonsContainerClassName="_center gap-4"
                    />
                ),
                id: "delete_board " + board.imei,
                initialPosition,
                type: "custom",
                headerContent: t("delete_board"),
            });
        },
        [deletePopup, addPopup]
    );

    return onDeleteClick;
};
