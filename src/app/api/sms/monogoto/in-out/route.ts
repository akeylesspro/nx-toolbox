import { add_document, set_document } from "akeyless-server-commons/helpers";
import { logger } from "akeyless-server-commons/managers";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getOutSmsByContent, parseTextToObject } from "../../helpers";
import { OutSmsStatus } from "../../types";

export const config = {
    runtime: "nodejs",
};

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { text, title } = data;
        const { ICCID, Message } = parseTextToObject(text);
        if (!title.toLowerCase().includes("incoming")) {
            await add_document("nx-sms-in", {
                external_id: "",
                content: Message,
                sender: ICCID,
                service: "monogoto",
                timestamp: Timestamp.now(),
            });
            logger.log("monogoto incoming message successfully saved in db", parseTextToObject(text));
            return NextResponse.json({ success: true, msg: "ok" });
        }
        const messageFromDb = await getOutSmsByContent(ICCID!, Message!);
        if (messageFromDb) {
            await set_document("nx-sms-out", messageFromDb.id, {
                timestamp: Timestamp.now(),
                status: title.includes("success") ? OutSmsStatus.DELIVERED : OutSmsStatus.FAILED,
            });
            logger.log("monogoto outgoing message successfully saved in db", parseTextToObject(text));
        }
        return NextResponse.json({ success: true, msg: "ok" });
    } catch (error) {
        logger.error("exception in api/sms/monogoto/in-out route", error);
        return NextResponse.json({ success: false, error: "failed to process request" }, { status: 500 });
    }
}
