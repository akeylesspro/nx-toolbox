import { add_document } from "akeyless-server-commons/helpers";
import { logger } from "akeyless-server-commons/managers";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
export const config = {
    runtime: "nodejs",
};

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const data: Record<string, string> = {};
        formData.forEach((value, key) => {
            data[key] = value.toString();
        });
        await add_document("nx-sms-income", {
            external_id: data.msgId,
            content: data.content,
            sender: data.sender,
            timestamp: Timestamp.now(),
        });
        logger.log("incoming message successfully saved in db",data)
        return NextResponse.json({ success: true, msg: "ok" });
    } catch (error) {
        logger.error("exception in api/multisend/inbound route", error);
        return NextResponse.json({ success: false, error: "failed to process request" }, { status: 400 });
    }
}
