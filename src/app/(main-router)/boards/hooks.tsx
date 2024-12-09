import { delete_document, fire_base_TIME_TEMP, set_document } from "akeyless-client-commons/helpers";
import { Board, BoardStatus, TObject } from "akeyless-types-commons";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import QRCodeGenerator from "qrcode";
import { ModularForm, ConfirmForm } from "akeyless-client-commons/components";
import { useTranslation } from "react-i18next";
import { FormElement } from "akeyless-client-commons/types";
import { CacheStore, PopupsStore, UserStore } from "@/lib/store";
import { addBoardFB, updateBoardFB } from "@/lib/helpers";
import { onImeiInputKeyDown, onSimInputKeyDown, validateBoardImei, validateBoardPhoneAndStatus } from "./helpers";

const initialPosition = { top: "25%", left: "30%" };

export const usePrintQR = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: containerRef,
        bodyClass: "",
        documentTitle: "QR Code",
    });

    const generateQRCodeImage = useCallback(async (board: Board) => {
        let token: string;
        if (board.token) {
            token = board.token;
        } else {
            token = [...board.id].reverse().join("");
            await set_document("boards", board.id, { token, update: fire_base_TIME_TEMP() });
        }
        const canvas = document.createElement("canvas");

        QRCodeGenerator.toCanvas(canvas, `https://installerapp.online/camera_installation/${token}`, { width: 250 }, (error) => {
            if (error) {
                console.error(error);
            } else {
                const imgData = canvas.toDataURL("image/png");
                const imgElement = imgRef.current;
                if (imgElement) {
                    imgElement.src = imgData;
                }
            }
        });
    }, []);

    const onPrintClick = useCallback(
        async (board: Board) => {
            await generateQRCodeImage(board);
            handlePrint();
        },
        [generateQRCodeImage, handlePrint]
    );

    const PrintableContent = () => (
        <div style={{ display: "none" }}>
            <div ref={containerRef} className="flex justify-center items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-[80px] h-[80px]" ref={imgRef} alt="QR Code" />
            </div>
        </div>
    );

    return { onPrintClick, PrintableContent };
};

export const useAddBoard = () => {
    const activeUser = UserStore.activeUser();
    const boardsTypes = CacheStore.boardsTypes();
    const cameraBoardsTypes = CacheStore.cameraBoardsTypes();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const { t } = useTranslation();
    const { onPrintClick, PrintableContent } = usePrintQR();
    const onAddClick = useCallback(async () => {
        const headerContent = "add_board";
        const elements: FormElement[] = [
            {
                type: "select",
                name: "type",
                labelContent: t("type"),
                elementClassName: "h-6 ",
                containerClassName: "_center w-full",
                options: boardsTypes.map((bt) => ({ value: bt, label: bt })),
                optionsContainerClassName: "max-h-80",
            },
            {
                type: "input",
                name: "imei",
                containerClassName: "_center w-full",
                onKeyDown: onImeiInputKeyDown,
                labelContent: t("imei"),
                validationName: "numbers",
            },
            {
                type: "input",
                name: "sim",
                containerClassName: "_center w-full",
                onKeyDown: onSimInputKeyDown,
                labelContent: t("sim"),
                validationName: "numbers",
            },
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
            const sim = (form.elements.namedItem("sim") as HTMLInputElement)?.value || "";
            const type = (form.elements.namedItem("type") as HTMLInputElement)?.value || "";
            const comments = (form.elements.namedItem("comments") as HTMLInputElement)?.value || "";
            let imei = (form.elements.namedItem("imei") as HTMLInputElement)?.value || "";

            const match = imei.match(/\b\d{15,17}\b/);
            if (imei.length < 15 || !match) {
                throw new Error(t("imei_error_board"));
            }
            imei = match[0];
            (form.elements.namedItem("imei") as HTMLInputElement).value = match[0];

            if (sim.length !== 10) {
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
                userId: activeUser?.fullName || "",
            };

            await validateBoardImei(data, t);
            await validateBoardPhoneAndStatus(data, t);
            const update = await addBoardFB(data);
            if (!update) {
                throw new Error(t("update_board_error"));
            }

            if (cameraBoardsTypes.includes(type)) {
                const onX = async () => {
                    deletePopup("print_confirmation");
                };
                const onV = async () => {
                    await onPrintClick(update as Board);
                    onX();
                };

                addPopup({
                    element: (
                        <ConfirmForm
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
            }
            deletePopup("add_board");
        };
        const form = (
            <ModularForm
                buttonContent={t("save")}
                elements={elements}
                buttonClassName="_center pb-2"
                formClassName="min-w-[400px]"
                submitFunction={submit}
                headerContent={
                    <div className="start gap-2">
                        <div>{t(headerContent)}</div>
                    </div>
                }
            />
        );
        addPopup({ element: form, id: "add_board", type: "custom", initialPosition });
    }, [activeUser, boardsTypes, cameraBoardsTypes, addPopup, deletePopup]);
    return { onAddClick, PrintableContent };
};

export const useEditBoard = () => {
    const { t } = useTranslation();
    const addPopup = PopupsStore.addPopup();
    const deletePopup = PopupsStore.deletePopup();
    const boardsTypes = CacheStore.boardsTypes();

    const onEditClick = useCallback(
        (board: Board) => {
            const header_content = "edit_board";
            const elements: FormElement[] = [
                {
                    type: "select",
                    name: "status",
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
                    containerClassName: "_center w-full",
                    labelContent: t("type"),
                    defaultValue: board.type,
                    options: boardsTypes.map((bt) => ({ value: bt, label: bt })),
                    optionsContainerClassName: "max-h-80",
                },
                {
                    type: "input",
                    name: "sim",
                    containerClassName: "_center w-full",
                    onKeyDown: onSimInputKeyDown,
                    labelContent: t("sim"),
                    defaultValue: board.sim || "",
                    validationName: "numbers",
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
                const sim = (form.elements.namedItem("sim") as HTMLInputElement)?.value || "";
                const status = Number((form.elements.namedItem("status") as HTMLInputElement)?.value);
                const type = (form.elements.namedItem("type") as HTMLInputElement)?.value || "";
                const comments = (form.elements.namedItem("comments") as HTMLInputElement)?.value || "";

                if (sim.length !== 10 && status !== BoardStatus["Malfunction"] && status !== BoardStatus["NoSim"]) {
                    throw new Error(t("sim_error_camera_board"));
                }

                await validateBoardPhoneAndStatus({ sim, comments, status }, t, board);
                const update = { sim: status === BoardStatus["NoSim"] ? "" : sim, comments, status, type };
                await updateBoardFB(board.id, update);
                deletePopup("edit_board " + board.imei);
            };

            const form = (
                <ModularForm
                    buttonContent={t("save")}
                    elements={elements}
                    formClassName="min-w-[400px]"
                    submitFunction={submit}
                    headerContent={
                        <div className="start gap-2">
                            <div>
                                {t(header_content)} - {board.imei}
                            </div>
                        </div>
                    }
                />
            );
            addPopup({ element: form, id: "edit_board " + board.imei, type: "custom", initialPosition });
        },
        [deletePopup, addPopup, boardsTypes]
    );

    return onEditClick;
};

export const useDeleteBoard = () => {
    const deletePopup = PopupsStore.deletePopup();
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
                        onV={onV}
                        onX={onX}
                        headline={t("delete_confirmation").replace("{imei}", board.imei)}
                        containerClassName="w-80 flex flex-col gap-4"
                        buttonsContainerClassName="_center gap-4"
                    />
                ),
                id: "delete_board " + board.imei,
                initialPosition,
                type: "custom",
            });
        },
        [deletePopup, addPopup]
    );

    return onDeleteClick;
};
