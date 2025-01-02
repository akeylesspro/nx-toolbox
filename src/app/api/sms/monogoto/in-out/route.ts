import { add_document, set_document, sleep } from "akeyless-server-commons/helpers";
import { logger } from "akeyless-server-commons/managers";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getOutMessageByConditionsFromDB, parseTextToObject } from "../../helpers";

export const config = {
    runtime: "nodejs",
};

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { text, title } = data;
        const { ICCID, Message } = parseTextToObject(text);
        if (!title.toLowerCase().includes("incoming")) {
            logger.log("monogoto in", data);
            await add_document("nx-sms-in", {
                external_id: "",
                content: Message,
                sender: ICCID,
                service: "monogoto",
                timestamp: Timestamp.now(),
            });
            logger.log("monogoto incoming message successfully saved in db", { ...parseTextToObject(text), service: "monogoto" });
            return NextResponse.json({ success: true, msg: "ok" });
        }
        await sleep(10000);
        const messageFromDb = await getOutMessageByConditionsFromDB(ICCID, Message);
        if (messageFromDb) {
            await set_document("nx-sms-out", messageFromDb.id, {
                timestamp: Timestamp.now(),
                status: title.includes("success") ? "delivered" : "failed",
            });
            logger.log("monogoto outgoing message successfully saved in db", { ...parseTextToObject(text), service: "monogoto" });
        }
        return NextResponse.json({ success: true, msg: "ok" });
    } catch (error) {
        logger.error("exception in api/sms/monogoto/in-out route", error);
        return NextResponse.json({ success: false, error: "failed to process request" }, { status: 400 });
    }
}
