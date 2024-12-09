import { query_document, query_documents } from "akeyless-client-commons/helpers";
import { BoardStatus, TObject } from "akeyless-types-commons";

import { updateBoardFB } from "@/lib/helpers";

type TranslationFun = (val: string) => string;

export const validateBoardPhoneAndStatus = async (boardData: TObject<any>, t: TranslationFun, oldBoard?: TObject<any>) => {
    if (oldBoard?.sim === boardData.sim && oldBoard?.status === boardData.status) {
        console.log("board sim or board status not changed");
        return;
    }
    if (boardData.sim === "") {
        console.log("board phone number is empty");
        return;
    }
    const boards = await query_documents("boards", "sim", "==", boardData.sim);
    const promises = boards.map(async (board) => {
        if (board.imei === oldBoard?.imei) {
            return;
        }

        if (board.status === BoardStatus["Installed"]) {
            console.log("installed");
            throw t("exist_phone_number_error");
        }
        if (board.status === BoardStatus["ReadyForInstallation"]) {
            console.log("ready");
            await updateBoardFB(board.id, { status: BoardStatus["NoSim"], sim: "" });
        }
        if (board.status === BoardStatus["Malfunction"]) {
            await updateBoardFB(board.id, { sim: "" });
        }
    });
    await Promise.all(promises);
};

export const onImeiInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const input = e.target as HTMLInputElement;
        const match = input.value.match(/\b\d{15,17}\b/);
        if (match) {
            input.value = match[0];
        }
        const tabEvent = new KeyboardEvent("keydown", {
            key: "Tab",
            keyCode: 9,
            code: "Tab",
            which: 9,
            bubbles: true,
            cancelable: true,
        });
        input.dispatchEvent(tabEvent);
    }
};

export const onSimInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
        e.preventDefault();
    }
    const input = e.target as HTMLInputElement;
    if (e.key === "Enter") {
        e.preventDefault();
        const sim = input.value;
        if (sim.length === 11 && sim[10] === "0") {
            input.value = sim.slice(0, 10);
        }
        if (sim.length === 9) {
            input.value = "0" + sim;
        }
    }
};

export const validateBoardImei = async (boardData: TObject<any>, t: TranslationFun) => {
    const boardExist = await query_document("boards", "imei", "==", boardData.imei, true);
    if (boardExist) {
        throw t("exist_imei_error");
    }
};
