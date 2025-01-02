import { set_document, sleep } from "akeyless-server-commons/helpers";
import { logger } from "akeyless-server-commons/managers";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getOutMessageByIdFromDB } from "../../helpers";

export const config = {
    runtime: "nodejs",
};

export async function POST(request: Request) {
    try {
        await sleep(5000);
        const data = await request.json();
        const { message, status, customerMessageId } = data;
        const messageFromDb = await getOutMessageByIdFromDB(customerMessageId);
        if (messageFromDb) {
            await set_document("nx-sms-out", messageFromDb.id, {
                timestamp: Timestamp.now(),
                status: status === "delivered" ? status : "failed",
            });
            logger.log("multisend outgoing message successfully saved in db", { ...data, service: "multisend" });
        }
        return NextResponse.json({ success: true, msg: "ok" });
    } catch (error) {
        logger.error("multisend exception in api/sms/multisend/out route", error);
        return NextResponse.json({ success: false, error: "failed to process request" }, { status: 400 });
    }
}
