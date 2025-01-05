import { add_document, set_document } from "akeyless-server-commons/helpers";
import { logger } from "akeyless-server-commons/managers";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getOutSmsById, parseFormData } from "../../helpers";
import { OutSmsStatus } from "../../types";

export const config = {
    runtime: "nodejs",
};

export async function POST(request: Request) {
    try {
        const data = parseFormData(await request.formData());
        const { MessageStatus, SmsSid, To, From } = data;
        if (!["queued", "sent"].includes(MessageStatus)) {
            logger.log("twilio out", data);
            const messageFromDb = await getOutSmsById(SmsSid);
            if (messageFromDb) {
                await set_document("nx-sms-out", messageFromDb.id, {
                    timestamp: Timestamp.now(),
                    status: MessageStatus === "delivered" ? OutSmsStatus.DELIVERED : OutSmsStatus.FAILED,
                });
                logger.log("twilio outgoing message successfully saved in db", { ...data });
            }
        }
        return NextResponse.json({ success: true, msg: "ok" });
    } catch (error) {
        logger.error("twilio exception in api/sms/twilio/out route", error);
        return NextResponse.json({ success: false, error: "failed to process request" }, { status: 500 });
    }
}
