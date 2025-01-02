import { add_document } from "akeyless-server-commons/helpers";
import { logger } from "akeyless-server-commons/managers";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { parseFormData } from "../../helpers";

export const config = {
    runtime: "nodejs",
};

export async function POST(request: Request) {
    try {
        const data = parseFormData(await request.formData());
        await add_document("nx-sms-in", {
            external_id: data.msgId,
            content: data.content,
            sender: data.sender,
            service: "multisend",
            timestamp: Timestamp.now(),
        });
        logger.log("multisend incoming message successfully saved in db", { ...data, service: "multisend" });
        return NextResponse.json({ success: true, msg: "ok" });
    } catch (error) {
        logger.error("multisend exception in api/sms/multisend/in route", error);
        return NextResponse.json({ success: false, error: "failed to process request" }, { status: 400 });
    }
}
