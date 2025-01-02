import { add_document, set_document, sleep } from "akeyless-server-commons/helpers";
import { logger } from "akeyless-server-commons/managers";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getOutMessageByIdFromDB, parseFormData } from "../../helpers";

export const config = {
    runtime: "nodejs",
};

export async function POST(request: Request) {
    try {
        await sleep(5000);
        const data = parseFormData(await request.formData());
        const { MessageStatus, SmsSid, To, From } = data;
        if (!["queued", "sent"].includes(MessageStatus)) {
            logger.log("twilio out", data);
            const messageFromDb = await getOutMessageByIdFromDB(SmsSid);
            if (messageFromDb) {
                await set_document("nx-sms-out", messageFromDb.id, {
                    timestamp: Timestamp.now(),
                    status: MessageStatus === "delivered" ? MessageStatus : "failed",
                });
                logger.log("twilio outgoing message successfully saved in db", { ...data, service: "twilio" });
            }
        }
        return NextResponse.json({ success: true, msg: "ok" });
    } catch (error) {
        logger.error("twilio exception in api/sms/twilio/out route", error);
        return NextResponse.json({ success: false, error: "failed to process request" }, { status: 400 });
    }
}
